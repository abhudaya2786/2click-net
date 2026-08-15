import os
from contextlib import asynccontextmanager
from datetime import date, datetime
from pathlib import Path
from typing import Literal, Optional
from uuid import UUID

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from google import genai
from pydantic import BaseModel, Field

import store as db
from classification import classify_conversation_type
from linguistics import (
    LinguisticResult,
    build_mom_summary,
    normalize_text,
    transcribe_audio,
)

load_dotenv()

STATIC_DIR = Path(__file__).resolve().parent / "static"
_raw_key = (os.getenv("GEMINI_API_KEY") or "").strip()
GEMINI_API_KEY = "" if _raw_key in {"", "your_actual_gemini_api_key_here"} else _raw_key
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()
ai_client = None


def get_ai_client(required: bool = True):
    global ai_client
    if not GEMINI_API_KEY:
        if required:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="GEMINI_API_KEY वातावरण चर में सेट नहीं है।",
            )
        return None
    if ai_client is None:
        ai_client = genai.Client(api_key=GEMINI_API_KEY)
    return ai_client


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await db.init_pool()
    try:
        yield
    finally:
        await db.close_pool()


app = FastAPI(
    title="Hinglish Linguistic Normalizer API",
    description=(
        "User-based Instant Save + multi-dialect normalize/transcribe. "
        "POST/GET /api/v1/conversations for realtime persistence."
    ),
    version="1.4.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


# --- Models ---


class NormalizationRequest(BaseModel):
    raw_text: str = Field(..., min_length=2)
    save: bool = False
    user_id: Optional[UUID] = None
    conversation_type: Optional[Literal["phone_call", "in_person_meeting", "voice_note"]] = None
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    summary: Optional[str] = None


class NormalizationResponse(LinguisticResult):
    conversation_id: Optional[UUID] = None


class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    phone_number: str = Field(..., min_length=8, max_length=15)


class TaskCreate(BaseModel):
    conversation_id: UUID
    user_id: UUID
    task_description: str = Field(..., min_length=2)
    due_date: Optional[datetime] = None


class ConversationCreateRequest(BaseModel):
    """User-context Instant Save — audio and/or text."""

    user_id: UUID = Field(..., description="Required user context for Instant Save")
    raw_text: Optional[str] = Field(default=None, description="कच्ची ट्रांसक्रिप्ट (अगर ऑडियो नहीं)")
    audio_base64: Optional[str] = Field(default=None, description="Call/meeting recording (base64 or data-URL)")
    mime_type: str = Field(default="audio/webm")
    type: Optional[Literal["phone_call", "in_person_meeting", "voice_note"]] = Field(
        default=None,
        description="Optional explicit type; otherwise auto-classified",
    )
    source: Optional[str] = Field(
        default=None,
        description="Hint: phone | meeting | voice_note | call_recorder | geofence",
    )
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    duration_seconds: Optional[float] = None
    create_task: Optional[str] = Field(default=None, description="Optional auto-task description")
    task_due_date: Optional[datetime] = None


class ConversationCreateResponse(BaseModel):
    success: bool = True
    conversation_id: UUID
    user_id: UUID
    type: str
    raw_transcript: str
    detected_dialect: str
    detected_intent: str
    pure_hindi: str
    pure_english: str
    summary: str
    persistence: str
    task_id: Optional[UUID] = None


# --- Helpers ---


def _serialize_row(row: dict) -> dict:
    out = {}
    for k, v in row.items():
        if isinstance(v, UUID):
            out[k] = str(v)
        elif isinstance(v, datetime):
            out[k] = v.isoformat()
        elif isinstance(v, date):
            out[k] = v.isoformat()
        else:
            out[k] = v
    return out


async def _process_and_save_conversation(payload: ConversationCreateRequest) -> ConversationCreateResponse:
    raw_text = (payload.raw_text or "").strip()

    client = get_ai_client(required=False)
    if not raw_text and payload.audio_base64:
        raw_text = await transcribe_audio(
            client,
            GEMINI_MODEL,
            audio_base64=payload.audio_base64,
            mime_type=payload.mime_type,
        )
    if not raw_text or len(raw_text) < 2:
        raise HTTPException(status_code=400, detail="raw_text या audio_base64 आवश्यक है।")

    # Call & meeting classification
    conv_type = classify_conversation_type(
        explicit_type=payload.type,
        transcript=raw_text,
        contact_phone=payload.contact_phone,
        duration_seconds=payload.duration_seconds,
        source=payload.source,
    )

    # Linguistic normalize (Gemini if key present, else heuristic)
    ling = await normalize_text(client, GEMINI_MODEL, raw_text)
    summary = build_mom_summary(ling)

    # Realtime persistence — always Instant Save with user_id
    saved = await db.save_conversation(
        user_id=payload.user_id,
        type=conv_type,
        contact_name=payload.contact_name,
        contact_phone=payload.contact_phone,
        raw_transcript=raw_text,
        pure_hindi_text=ling.pure_hindi,
        pure_english_text=ling.pure_english,
        summary=summary,
        detected_dialect=ling.detected_dialect,
        detected_intent=ling.detected_intent,
        duration_seconds=payload.duration_seconds,
    )

    task_id = None
    if payload.create_task:
        task = await db.create_task(
            conversation_id=saved["id"],
            user_id=payload.user_id,
            task_description=payload.create_task,
            due_date=payload.task_due_date,
        )
        task_id = task["id"]

    return ConversationCreateResponse(
        conversation_id=saved["id"],
        user_id=payload.user_id,
        type=conv_type,
        raw_transcript=raw_text,
        detected_dialect=ling.detected_dialect,
        detected_intent=ling.detected_intent,
        pure_hindi=ling.pure_hindi,
        pure_english=ling.pure_english,
        summary=summary,
        persistence=db.persistence_mode(),
        task_id=task_id,
    )


# --- Routes ---


@app.get("/", tags=["Health Check"])
async def health_check():
    return {
        "status": "active",
        "service": "Hinglish Normalizer Service",
        "persistence": db.persistence_mode(),
        "gemini": bool(GEMINI_API_KEY),
        "ui": "/conversations",
        "conversations_api": "/api/v1/conversations",
    }


@app.get("/conversations", tags=["UI"], include_in_schema=False)
async def conversations_ui():
    index = STATIC_DIR / "index.html"
    if not index.exists():
        raise HTTPException(status_code=404, detail="UI not found")
    return FileResponse(index)


@app.post(
    "/api/v1/conversations",
    response_model=ConversationCreateResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Conversations"],
)
async def create_conversation(payload: ConversationCreateRequest):
    """
    Audio/Text → classify → normalize → Instant Save under user_id → immediate response.
    Dashboard GET will see this record right away.
    """
    try:
        return await _process_and_save_conversation(payload)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversation save failed: {e}") from e


@app.get("/api/v1/conversations", tags=["Conversations"])
async def list_conversations(
    user_id: UUID = Query(..., description="Required user context"),
    q: Optional[str] = Query(None, description="Keyword search (name, transcript, summary)"),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    type: Optional[Literal["phone_call", "in_person_meeting", "voice_note"]] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    group_by_date: bool = Query(True, description="Date-wise buckets for dashboard"),
):
    """
    Retrieve the user's conversations with date filters + keyword search.
    """
    rows = await db.list_conversations(
        user_id,
        limit=limit,
        q=q,
        date_from=date_from,
        date_to=date_to,
        conversation_type=type,
    )
    serialized = [_serialize_row(r) for r in rows]
    if group_by_date:
        # group on already-filtered rows
        from store import group_by_date as _group

        grouped = _group(rows)
        return {
            "success": True,
            "user_id": str(user_id),
            "count": len(serialized),
            "persistence": db.persistence_mode(),
            "groups": [
                {
                    "date": g["date"],
                    "count": g["count"],
                    "conversations": [_serialize_row(c) for c in g["conversations"]],
                }
                for g in grouped
            ],
            "conversations": serialized,
        }
    return {
        "success": True,
        "user_id": str(user_id),
        "count": len(serialized),
        "persistence": db.persistence_mode(),
        "conversations": serialized,
    }


@app.post(
    "/api/v1/normalize",
    response_model=NormalizationResponse,
    status_code=status.HTTP_200_OK,
    tags=["Linguistics"],
)
async def normalize_hinglish(payload: NormalizationRequest):
    """Dialect normalize; optional Instant Save when save=true + user_id."""
    try:
        client = get_ai_client(required=False)
        ling = await normalize_text(client, GEMINI_MODEL, payload.raw_text)
        out = NormalizationResponse(**ling.model_dump())

        if payload.save:
            if not payload.user_id:
                raise HTTPException(status_code=400, detail="Instant Save के लिए user_id आवश्यक है।")
            conv_type = classify_conversation_type(
                explicit_type=payload.conversation_type,
                transcript=payload.raw_text,
                contact_phone=payload.contact_phone,
            )
            saved = await db.save_conversation(
                user_id=payload.user_id,
                type=conv_type,
                contact_name=payload.contact_name,
                contact_phone=payload.contact_phone,
                raw_transcript=payload.raw_text,
                pure_hindi_text=ling.pure_hindi,
                pure_english_text=ling.pure_english,
                summary=payload.summary or build_mom_summary(ling),
                detected_dialect=ling.detected_dialect,
                detected_intent=ling.detected_intent,
            )
            out.conversation_id = saved["id"]
        return out
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"प्रोसेसिंग में त्रुटि: {e}") from e


@app.post("/api/v1/users", tags=["Users"])
async def create_user(payload: UserCreate):
    try:
        row = await db.create_user(payload.name, payload.phone_number)
        return {"success": True, "user": _serialize_row(row), "persistence": db.persistence_mode()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/users/{user_id}", tags=["Users"])
async def get_user(user_id: UUID):
    row = await db.get_user(user_id)
    if not row:
        # ensure soft presence for memory mode dashboards
        row = await db.ensure_user(user_id)
    return {"success": True, "user": _serialize_row(row)}


@app.get("/api/v1/users/{user_id}/conversations", tags=["Conversations"])
async def list_user_conversations_alias(
    user_id: UUID,
    q: Optional[str] = None,
    limit: int = 50,
):
    """Alias → GET /api/v1/conversations?user_id=..."""
    return await list_conversations(user_id=user_id, q=q, limit=limit, group_by_date=True)


@app.post("/api/v1/tasks", tags=["Tasks"])
async def create_scheduled_task(payload: TaskCreate):
    try:
        row = await db.create_task(
            conversation_id=payload.conversation_id,
            user_id=payload.user_id,
            task_description=payload.task_description,
            due_date=payload.due_date,
        )
        return {"success": True, "task": _serialize_row(row)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/users/{user_id}/tasks/pending", tags=["Tasks"])
async def list_pending_tasks(user_id: UUID):
    rows = await db.list_pending_tasks(user_id)
    return {"success": True, "tasks": [_serialize_row(r) for r in rows]}


@app.post("/api/v1/tasks/{task_id}/complete", tags=["Tasks"])
async def complete_task(task_id: UUID):
    row = await db.complete_task(task_id)
    if not row:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"success": True, "task": _serialize_row(row)}


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
