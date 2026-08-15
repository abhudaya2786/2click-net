"""
Realtime persistence layer.
- PostgreSQL when DATABASE_URL is set
- In-process memory store otherwise (Instant Save still works for dashboard demos)
"""

from __future__ import annotations

import os
import re
import uuid
from datetime import date, datetime, timezone
from typing import Any, Optional
from uuid import UUID

import db as pg

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()

_memory_users: dict[str, dict] = {}
_memory_conversations: list[dict] = []
_memory_tasks: list[dict] = []


def persistence_mode() -> str:
    return "postgres" if DATABASE_URL else "memory"


def db_configured() -> bool:
    # Instant Save always available (memory or postgres)
    return True


async def init_pool() -> None:
    if DATABASE_URL:
        await pg.init_pool()


async def close_pool() -> None:
    if DATABASE_URL:
        await pg.close_pool()


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _uid() -> UUID:
    return uuid.uuid4()


async def create_user(name: str, phone_number: str) -> dict:
    if DATABASE_URL:
        return await pg.create_user(name, phone_number)
    for u in _memory_users.values():
        if u["phone_number"] == phone_number:
            u["name"] = name
            return u
    row = {
        "id": _uid(),
        "name": name,
        "phone_number": phone_number,
        "created_at": _now(),
    }
    _memory_users[str(row["id"])] = row
    return row


async def get_user(user_id: UUID) -> Optional[dict]:
    if DATABASE_URL:
        return await pg.get_user(user_id)
    return _memory_users.get(str(user_id))


async def ensure_user(user_id: UUID) -> dict:
    existing = await get_user(user_id)
    if existing:
        return existing
    if DATABASE_URL:
        # Create placeholder user row so FK succeeds
        async with pg.acquire() as conn:
            row = await conn.fetchrow(
                """
                INSERT INTO users (id, name, phone_number)
                VALUES ($1, $2, $3)
                ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
                RETURNING id, name, phone_number, created_at
                """,
                user_id,
                f"User {str(user_id)[:8]}",
                f"u{str(user_id).replace('-', '')[:12]}",
            )
            return dict(row)
    row = {
        "id": user_id,
        "name": f"User {str(user_id)[:8]}",
        "phone_number": f"u{str(user_id).replace('-', '')[:12]}",
        "created_at": _now(),
    }
    _memory_users[str(user_id)] = row
    return row


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
    await ensure_user(user_id)
    if DATABASE_URL:
        return await pg.save_conversation(
            user_id=user_id,
            type=type,
            contact_name=contact_name,
            contact_phone=contact_phone,
            raw_transcript=raw_transcript,
            pure_hindi_text=pure_hindi_text,
            pure_english_text=pure_english_text,
            summary=summary,
            detected_dialect=detected_dialect,
            detected_intent=detected_intent,
            duration_seconds=duration_seconds,
        )

    row = {
        "id": _uid(),
        "user_id": user_id,
        "type": type,
        "contact_name": contact_name,
        "contact_phone": contact_phone,
        "raw_transcript": raw_transcript,
        "pure_hindi_text": pure_hindi_text,
        "pure_english_text": pure_english_text,
        "summary": summary,
        "detected_dialect": detected_dialect,
        "detected_intent": detected_intent,
        "duration_seconds": duration_seconds,
        "created_at": _now(),
    }
    _memory_conversations.insert(0, row)
    # keep last 500
    del _memory_conversations[500:]
    return row


async def list_conversations(
    user_id: UUID,
    *,
    limit: int = 50,
    q: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    conversation_type: Optional[str] = None,
) -> list[dict]:
    if DATABASE_URL:
        return await _pg_search(
            user_id,
            limit=limit,
            q=q,
            date_from=date_from,
            date_to=date_to,
            conversation_type=conversation_type,
        )

    rows = [r for r in _memory_conversations if r["user_id"] == user_id]
    if conversation_type:
        rows = [r for r in rows if r.get("type") == conversation_type]
    if date_from:
        rows = [r for r in rows if r["created_at"].date() >= date_from]
    if date_to:
        rows = [r for r in rows if r["created_at"].date() <= date_to]
    if q:
        needle = q.lower().strip()
        rows = [r for r in rows if _matches_keyword(r, needle)]
    rows.sort(key=lambda r: r["created_at"], reverse=True)
    return rows[:limit]


def _matches_keyword(row: dict, needle: str) -> bool:
    blob = " ".join(
        str(row.get(k) or "")
        for k in (
            "contact_name",
            "contact_phone",
            "raw_transcript",
            "pure_hindi_text",
            "pure_english_text",
            "summary",
            "detected_dialect",
            "detected_intent",
            "type",
        )
    ).lower()
    return needle in blob


async def _pg_search(
    user_id: UUID,
    *,
    limit: int,
    q: Optional[str],
    date_from: Optional[date],
    date_to: Optional[date],
    conversation_type: Optional[str],
) -> list[dict]:
    clauses = ["user_id = $1"]
    args: list[Any] = [user_id]
    i = 2
    if conversation_type:
        clauses.append(f"type = ${i}")
        args.append(conversation_type)
        i += 1
    if date_from:
        clauses.append(f"created_at::date >= ${i}")
        args.append(date_from)
        i += 1
    if date_to:
        clauses.append(f"created_at::date <= ${i}")
        args.append(date_to)
        i += 1
    if q:
        clauses.append(
            f"""(
              coalesce(contact_name,'') ILIKE ${i}
              OR coalesce(contact_phone,'') ILIKE ${i}
              OR coalesce(raw_transcript,'') ILIKE ${i}
              OR coalesce(pure_hindi_text,'') ILIKE ${i}
              OR coalesce(pure_english_text,'') ILIKE ${i}
              OR coalesce(summary,'') ILIKE ${i}
              OR coalesce(detected_intent,'') ILIKE ${i}
              OR coalesce(detected_dialect,'') ILIKE ${i}
            )"""
        )
        args.append(f"%{q}%")
        i += 1
    args.append(limit)
    sql = f"""
        SELECT * FROM conversations
        WHERE {' AND '.join(clauses)}
        ORDER BY created_at DESC
        LIMIT ${i}
    """
    async with pg.acquire() as conn:
        rows = await conn.fetch(sql, *args)
        return [dict(r) for r in rows]


async def create_task(
    *,
    conversation_id: UUID,
    user_id: UUID,
    task_description: str,
    due_date: Optional[Any] = None,
) -> dict:
    if DATABASE_URL:
        return await pg.create_task(
            conversation_id=conversation_id,
            user_id=user_id,
            task_description=task_description,
            due_date=due_date,
        )
    row = {
        "id": _uid(),
        "conversation_id": conversation_id,
        "user_id": user_id,
        "task_description": task_description,
        "due_date": due_date,
        "status": "pending",
        "created_at": _now(),
    }
    _memory_tasks.insert(0, row)
    return row


async def list_pending_tasks(user_id: UUID) -> list[dict]:
    if DATABASE_URL:
        return await pg.list_pending_tasks(user_id)
    return [t for t in _memory_tasks if t["user_id"] == user_id and t["status"] == "pending"]


async def complete_task(task_id: UUID) -> Optional[dict]:
    if DATABASE_URL:
        return await pg.complete_task(task_id)
    for t in _memory_tasks:
        if t["id"] == task_id:
            t["status"] = "completed"
            return t
    return None


def group_by_date(rows: list[dict]) -> list[dict]:
    """Return date-wise buckets newest-first for dashboard."""
    buckets: dict[str, list[dict]] = {}
    for r in rows:
        created = r.get("created_at")
        if isinstance(created, datetime):
            key = created.date().isoformat()
        else:
            key = str(created)[:10]
        buckets.setdefault(key, []).append(r)
    out = []
    for day in sorted(buckets.keys(), reverse=True):
        out.append({"date": day, "count": len(buckets[day]), "conversations": buckets[day]})
    return out
