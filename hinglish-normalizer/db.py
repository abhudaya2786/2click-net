"""
PostgreSQL helpers for users / conversations / scheduled_tasks.
Uses DATABASE_URL when set; otherwise persistence endpoints return 503.
"""

from __future__ import annotations

import os
from contextlib import asynccontextmanager
from typing import Any, AsyncIterator, Optional
from uuid import UUID

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()

_pool = None


def db_configured() -> bool:
    return bool(DATABASE_URL)


async def init_pool() -> None:
    global _pool
    if not DATABASE_URL or _pool is not None:
        return
    import asyncpg

    _pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=5)


async def close_pool() -> None:
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None


@asynccontextmanager
async def acquire() -> AsyncIterator[Any]:
    if _pool is None:
        raise RuntimeError("Database pool not initialized. Set DATABASE_URL.")
    async with _pool.acquire() as conn:
        yield conn


async def create_user(name: str, phone_number: str) -> dict:
    async with acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO users (name, phone_number)
            VALUES ($1, $2)
            ON CONFLICT (phone_number) DO UPDATE SET name = EXCLUDED.name
            RETURNING id, name, phone_number, created_at
            """,
            name,
            phone_number,
        )
        return dict(row)


async def get_user(user_id: UUID) -> Optional[dict]:
    async with acquire() as conn:
        row = await conn.fetchrow(
            "SELECT id, name, phone_number, created_at FROM users WHERE id = $1",
            user_id,
        )
        return dict(row) if row else None


async def save_conversation(
    *,
    user_id: UUID,
    type: str,
    contact_name: Optional[str],
    contact_phone: Optional[str],
    raw_transcript: str,
    pure_hindi_text: Optional[str],
    pure_english_text: Optional[str],
    summary: Optional[str],
    detected_dialect: Optional[str] = None,
    detected_intent: Optional[str] = None,
    duration_seconds: Optional[float] = None,
) -> dict:
    async with acquire() as conn:
        # Prefer extended insert; fall back if duration column missing on older DBs
        try:
            row = await conn.fetchrow(
                """
                INSERT INTO conversations (
                    user_id, type, contact_name, contact_phone,
                    raw_transcript, pure_hindi_text, pure_english_text, summary,
                    detected_dialect, detected_intent, duration_seconds
                )
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
                RETURNING *
                """,
                user_id,
                type,
                contact_name,
                contact_phone,
                raw_transcript,
                pure_hindi_text,
                pure_english_text,
                summary,
                detected_dialect,
                detected_intent,
                duration_seconds,
            )
        except Exception:
            row = await conn.fetchrow(
                """
                INSERT INTO conversations (
                    user_id, type, contact_name, contact_phone,
                    raw_transcript, pure_hindi_text, pure_english_text, summary,
                    detected_dialect, detected_intent
                )
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
                RETURNING *
                """,
                user_id,
                type,
                contact_name,
                contact_phone,
                raw_transcript,
                pure_hindi_text,
                pure_english_text,
                summary,
                detected_dialect,
                detected_intent,
            )
        return dict(row)


async def list_conversations(user_id: UUID, limit: int = 50) -> list[dict]:
    async with acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT * FROM conversations
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2
            """,
            user_id,
            limit,
        )
        return [dict(r) for r in rows]


async def create_task(
    *,
    conversation_id: UUID,
    user_id: UUID,
    task_description: str,
    due_date: Optional[Any] = None,
) -> dict:
    async with acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO scheduled_tasks (conversation_id, user_id, task_description, due_date)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            """,
            conversation_id,
            user_id,
            task_description,
            due_date,
        )
        return dict(row)


async def list_pending_tasks(user_id: UUID) -> list[dict]:
    async with acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT * FROM scheduled_tasks
            WHERE user_id = $1 AND status = 'pending'
            ORDER BY due_date NULLS LAST, created_at DESC
            """,
            user_id,
        )
        return [dict(r) for r in rows]


async def complete_task(task_id: UUID) -> Optional[dict]:
    async with acquire() as conn:
        row = await conn.fetchrow(
            """
            UPDATE scheduled_tasks
            SET status = 'completed'
            WHERE id = $1
            RETURNING *
            """,
            task_id,
        )
        return dict(row) if row else None
