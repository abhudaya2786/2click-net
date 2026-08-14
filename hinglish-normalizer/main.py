import os
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path
from typing import Literal, Optional
from uuid import UUID

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

import db

# .env फ़ाइल से वेरिएबल्स लोड करें
load_dotenv()

STATIC_DIR = Path(__file__).resolve().parent / "static"
_raw_key = (os.getenv("GEMINI_API_KEY") or "").strip()
GEMINI_API_KEY = "" if _raw_key in {"", "your_actual_gemini_api_key_here"} else _raw_key
ai_client = None


def get_ai_client():
    global ai_client
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GEMINI_API_KEY वातावरण चर में सेट नहीं है।",
        )
    if ai_client is None:
        ai_client = genai.Client(api_key=GEMINI_API_KEY)
    return ai_client


@asynccontextmanager
async def lifespan(_app: FastAPI):
    if db.db_configured():
        await db.init_pool()
    try:
        yield
    finally:
        await db.close_pool()


# FastAPI ऐप सेटअप
app = FastAPI(
    title="Hinglish Linguistic Normalizer API",
    description=(
        "भारत की क्षेत्रीय बोलियाँ (भोजपुरी, अवधी, पूर्वांचली), शहरी स्लैंग "
        "और हिंग्लिश को 100% शुद्ध औपचारिक हिंदी व अंग्रेजी JSON में बदलने वाली API"
    ),
    version="1.3.0",
    lifespan=lifespan,
)

# CORS Middleware (Frontend/Mobile App से कनेक्ट करने के लिए)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


# --- Pydantic Data Models ---


class NormalizationRequest(BaseModel):
    raw_text: str = Field(
        ...,
        min_length=2,
        description="कच्ची क्षेत्रीय बोली / हिंग्लिश / स्लैंग ट्रांसक्रिप्ट",
        examples=[
            "are bhaiya kl site pe cement kb tk phuchega kuch fix h kya?",
            "का हो भैया, कल सीमेंट के बैग कब तक पहुँच जाई?",
            "का करत हौ? पेमेंट अभी तक क्लियर नइखे।",
            "scene set h, apun ko kal 11 baje site pe mil.",
        ],
    )
    # Instant Save (optional — requires DATABASE_URL)
    save: bool = Field(default=False, description="Normalize के बाद conversations में Instant Save")
    user_id: Optional[UUID] = Field(default=None, description="users.id for Instant Save")
    conversation_type: Optional[Literal["phone_call", "in_person_meeting", "voice_note"]] = (
        "voice_note"
    )
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    summary: Optional[str] = Field(default=None, description="3-लाइन समरी (optional override)")


class NormalizationResponse(BaseModel):
    detected_dialect: str = Field(
        description="पहचानी गई बोली (जैसे: भोजपुरी, अवधी, हिंग्लिश, टपोरी, शिष्ट)"
    )
    detected_intent: str = Field(
        description="बातचीत का मुख्य बिज़नेस उद्देश्य और संदर्भ"
    )
    pure_hindi: str = Field(
        description="शुद्ध मानक देवनागरी हिंदी रूपांतरण"
    )
    pure_english: str = Field(
        description="व्याकरणिक रूप से शुद्ध औपचारिक अंग्रेजी वाक्य"
    )
    conversation_id: Optional[UUID] = Field(
        default=None, description="Instant Save होने पर conversations.id"
    )


class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    phone_number: str = Field(..., min_length=8, max_length=15)


class TaskCreate(BaseModel):
    conversation_id: UUID
    user_id: UUID
    task_description: str = Field(..., min_length=2)
    due_date: Optional[datetime] = None


# --- System Prompt Instructions ---

SYSTEM_INSTRUCTION = """
आप एक मास्टर बहुभाषी भाषाविद् (Multi-Dialect Linguistic Specialist) और एग्जीक्यूटिव ट्रांसक्रिप्ट एडिटर हैं।

आपका कार्य भारत की विभिन्न क्षेत्रीय बोलियों (भोजपुरी, अवधी, पूर्वांचली, देहाती बोलचाल), शहरी स्लैंग्स (मुंबईया, दिल्ली टपोरी), हिंग्लिश और अत्यधिक विनम्र/औपचारिक बोलियों में बोली गई किसी भी कच्ची ऑडियो बातचीत को समझना, उसका सही अर्थ निकालना और उसे 100% शुद्ध, त्रुटिहीन और औपचारिक (Formal) हिंदी और अंग्रेजी में बदलना है।

### सख्त नियम:
1. बोली/लहज़ा पहचानें (Dialect Recognition): चाहे इनपुट भोजपुरी ("का हो भैया"), अवधी ("का करत हौ"), हिंग्लिश ("scene set h") या फॉर्मल हो—मूल भाव और संदर्भ को 100% सुरक्षित रखें। पहचानी गई बोली `detected_dialect` में लिखें।
2. अनावश्यक शब्द हटाएँ: "अरे", "मतलब", "उम्म", "काहे की", "बाबू", "भैया", "यार", "अपुन", "तबे" जैसे गैर-ज़रूरी और बार-बार दोहराए गए शब्दों को हटा दें।
3. नंबर्स और टेक्निकल टर्म्स: सीमेंट बैग्स, वर्ग फुट, API, सर्वर, पेमेंट, तारीख और समय को बिल्कुल सटीक रखें। अर्थ न बदलें, मात्रा/इकाई/नाम न गढ़ें।
4. `pure_hindi` हमेशा मानक देवनागरी में हो; `pure_english` पूरी तरह व्याकरण-शुद्ध, प्रोफेशनल और औपचारिक हो।
5. आउटपुट केवल और केवल मान्य JSON में होना चाहिए—कोई प्रस्तावना, मार्कडाउन या अतिरिक्त टेक्स्ट नहीं।

### JSON स्कीमा (फ़ील्ड क्रम अनिवार्य):
{
  "detected_dialect": "पहचानी गई बोली/लहज़ा",
  "detected_intent": "उपयोगकर्ता क्या कहना चाह रहा है (संक्षिप्त सारांश)",
  "pure_hindi": "शुद्ध मानक देवनागरी हिंदी वाक्य",
  "pure_english": "Clean, grammatically correct formal English sentence"
}

### उदाहरण (Few-Shot):

उदाहरण 1
इनपुट: "भैया पेमेंट पूरा हो गइल बा, साइट पे माल कब तक पहुँचे? काम रुकै ना चाही।"
आउटपुट:
{
  "detected_dialect": "भोजपुरी / पूर्वांचली",
  "detected_intent": "भुगतान पूरा होने के बाद साइट पर सामग्री की डिलीवरी समय पर सुनिश्चित करना",
  "pure_hindi": "कृपया स्पष्ट करें कि साइट पर निर्माण सामग्री कब तक पहुंचेगी। भुगतान पूर्ण कर दिया गया है, अतः कार्य में कोई रुकावट नहीं आनी चाहिए।",
  "pure_english": "Please confirm when the materials will be delivered to the site. The full payment has been made, so there should be no disruption in work."
}

उदाहरण 2
इनपुट: "yaar client bol rha h 10% discount de do to aaj hi token de dega scene set h"
आउटपुट:
{
  "detected_dialect": "हिंग्लिश / कैजुअल स्लैंग",
  "detected_intent": "क्लाइंट द्वारा तत्काल टोकन राशि देने की शर्त पर 10% छूट की मांग",
  "pure_hindi": "क्लाइंट 10% छूट की मांग कर रहा है और मूल्य कम करने की स्थिति में आज ही टोकन राशि देने को तैयार है।",
  "pure_english": "The client is requesting a 10% discount and is willing to pay the token amount today if the price is reduced."
}

उदाहरण 3
इनपुट: "ठेकेदार कहत है कल 5 और मिस्त्री अउर 10 मजदूर चाही, तबे परसों तक छत के ढलाई पूरा होई"
आउटपुट:
{
  "detected_dialect": "ग्रामीण अवधी / लेबर वर्कफोर्स",
  "detected_intent": "छत की ढलाई हेतु अतिरिक्त जनशक्ति (मैनपावर) की आवश्यकता",
  "pure_hindi": "ठेकेदार के अनुसार कल 5 अतिरिक्त राजमिस्त्री और 10 श्रमिकों की आवश्यकता होगी, जिससे परसों तक छत की ढलाई पूर्ण की जा सके।",
  "pure_english": "According to the contractor, 5 additional masons and 10 laborers will be required tomorrow to complete the slab casting by day after tomorrow."
}
"""

# --- API Endpoints ---


def _require_db():
    if not db.db_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="DATABASE_URL सेट नहीं है। schema.sql लागू करें और DATABASE_URL जोड़ें।",
        )


def _serialize_row(row: dict) -> dict:
    out = {}
    for k, v in row.items():
        if isinstance(v, UUID):
            out[k] = str(v)
        elif isinstance(v, datetime):
            out[k] = v.isoformat()
        else:
            out[k] = v
    return out


@app.get("/", tags=["Health Check"])
async def health_check():
    return {
        "status": "active",
        "service": "Hinglish Normalizer Service",
        "database": db.db_configured(),
        "gemini": bool(GEMINI_API_KEY),
        "ui": "/conversations",
    }


@app.get("/conversations", tags=["UI"], include_in_schema=False)
async def conversations_ui():
    index = STATIC_DIR / "index.html"
    if not index.exists():
        raise HTTPException(status_code=404, detail="UI not found")
    return FileResponse(index)



@app.post(
    "/api/v1/normalize",
    response_model=NormalizationResponse,
    status_code=status.HTTP_200_OK,
    tags=["Linguistics"],
)
async def normalize_hinglish(payload: NormalizationRequest):
    """
    क्षेत्रीय बोली / हिंग्लिश / स्लैंग को शुद्ध औपचारिक हिंदी व अंग्रेजी JSON में बदलता है।
    `save=true` + `user_id` पर Instant Save → conversations टेबल।
    """
    try:
        response = get_ai_client().models.generate_content(
            model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
            contents=(
                "निम्नलिखित कच्ची ट्रांसक्रिप्ट को नियमों के अनुसार केवल मान्य JSON में सामान्यीकृत करें:\n\n"
                f"{payload.raw_text}"
            ),
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                temperature=0.1,
                response_mime_type="application/json",
                response_schema=NormalizationResponse,
            ),
        )

        if not response.text:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="AI मॉडल से कोई वैध उत्तर प्राप्त नहीं हुआ।",
            )

        validated_output = NormalizationResponse.model_validate_json(response.text)

        if payload.save:
            _require_db()
            if not payload.user_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Instant Save के लिए user_id आवश्यक है।",
                )
            summary = payload.summary or validated_output.detected_intent
            saved = await db.save_conversation(
                user_id=payload.user_id,
                type=payload.conversation_type or "voice_note",
                contact_name=payload.contact_name,
                contact_phone=payload.contact_phone,
                raw_transcript=payload.raw_text,
                pure_hindi_text=validated_output.pure_hindi,
                pure_english_text=validated_output.pure_english,
                summary=summary,
                detected_dialect=validated_output.detected_dialect,
                detected_intent=validated_output.detected_intent,
            )
            validated_output.conversation_id = saved["id"]

        return validated_output

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"प्रोसेसिंग में त्रुटि: {str(e)}",
        )


@app.post("/api/v1/users", tags=["Users"])
async def create_user(payload: UserCreate):
    _require_db()
    try:
        row = await db.create_user(payload.name, payload.phone_number)
        return {"success": True, "user": _serialize_row(row)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/users/{user_id}", tags=["Users"])
async def get_user(user_id: UUID):
    _require_db()
    row = await db.get_user(user_id)
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "user": _serialize_row(row)}


@app.get("/api/v1/users/{user_id}/conversations", tags=["Conversations"])
async def list_user_conversations(user_id: UUID, limit: int = 50):
    _require_db()
    rows = await db.list_conversations(user_id, limit=min(limit, 200))
    return {"success": True, "conversations": [_serialize_row(r) for r in rows]}


@app.post("/api/v1/tasks", tags=["Tasks"])
async def create_scheduled_task(payload: TaskCreate):
    _require_db()
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
    _require_db()
    rows = await db.list_pending_tasks(user_id)
    return {"success": True, "tasks": [_serialize_row(r) for r in rows]}


@app.post("/api/v1/tasks/{task_id}/complete", tags=["Tasks"])
async def complete_task(task_id: UUID):
    _require_db()
    row = await db.complete_task(task_id)
    if not row:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"success": True, "task": _serialize_row(row)}


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
