"""
Hinglish Normalizer API
Converts broken Hinglish / slang into pure Hindi + pure English JSON.
"""

from __future__ import annotations

import json
import os
import re
from typing import Literal

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

load_dotenv()

app = FastAPI(
    title="Hinglish Normalizer",
    description="Bikhre Hinglish / slang ko shuddh Hindi aur English mein badalta hai.",
    version="1.0.0",
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash").strip()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()

SYSTEM_PROMPT = """आप एक एडवांस लिंग्विस्टिक एक्सपर्ट (Linguistic Expert) हैं। आपका काम बिखरी हुई हिंग्लिश, स्लैंग (Slang), और व्याकरण-रहित बोलचाल की भाषा को शुद्ध, औपचारिक (Formal) और स्पष्ट हिंदी और अंग्रेजी में बदलना है।

### नियम:
1. इनपुट का मूल अर्थ (Intent) और संदर्भ बिल्कुल नहीं बदलना चाहिए।
2. अपूर्ण या गलत शब्दों (जैसे: 'kr rhe h', 'kuch smjh ni ara') को ठीक करें।
3. केवल निम्नलिखित JSON फॉर्मेट में आउटपुट दें। कोई अतिरिक्त टिप्पणी या टेक्स्ट न लिखें।

### आउटपुट फॉर्मेट (JSON):
{
  "detected_intent": "उपयोगकर्ता क्या कहना चाह रहा है (संक्षिप्त सारांश)",
  "pure_hindi": "शुद्ध मानक देवनागरी हिंदी वाक्य",
  "pure_english": "Clean, grammatically correct standard English sentence"
}
"""

# Common chat/slang → expanded tokens (heuristic layer)
SLANG_MAP: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"\bbhai\b", re.I), "भाई"),
    (re.compile(r"\bkl\b|\bkal\b", re.I), "कल"),
    (re.compile(r"\baaj\b", re.I), "आज"),
    (re.compile(r"\bkitne\b", re.I), "कितने"),
    (re.compile(r"\bbje\b|\bbaje\b", re.I), "बजे"),
    (re.compile(r"\bhogi\b", re.I), "होगी"),
    (re.compile(r"\bh\b|\bhai\b", re.I), "है"),
    (re.compile(r"\bkya\b", re.I), "क्या"),
    (re.compile(r"\bkuch\b", re.I), "कुछ"),
    (re.compile(r"\bfix\b", re.I), "तय"),
    (re.compile(r"\bcancel\b", re.I), "रद्द"),
    (re.compile(r"\bmtg\b|\bmeeting\b", re.I), "मीटिंग"),
    (re.compile(r"\bpl[sz]\b|\bplz\b|\bplease\b", re.I), "कृपया"),
    (re.compile(r"\bkr\b|\bkar\b", re.I), "कर"),
    (re.compile(r"\brhe\b|\brahe\b", re.I), "रहे"),
    (re.compile(r"\brhi\b|\brahi\b", re.I), "रही"),
    (re.compile(r"\bsmjh\b|\bsamajh\b", re.I), "समझ"),
    (re.compile(r"\bni\b|\bnahi\b|\bnhi\b", re.I), "नहीं"),
    (re.compile(r"\bara\b|\baaraha\b|\baa raha\b", re.I), "आ रहा"),
    (re.compile(r"\b hum\b|\bhm\b", re.I), " हम"),
    (re.compile(r"\btum\b|\btm\b", re.I), "तुम"),
    (re.compile(r"\bap\b|\baap\b", re.I), "आप"),
    (re.compile(r"\bthik\b|\btheek\b|\bok\b", re.I), "ठीक"),
    (re.compile(r"\bbtao\b|\bbatao\b", re.I), "बताओ"),
    (re.compile(r"\bjaldi\b", re.I), "जल्दी"),
    (re.compile(r"\babhi\b", re.I), "अभी"),
    (re.compile(r"\bbaad\b", re.I), "बाद"),
    (re.compile(r"\bme\b|\bmein\b", re.I), "में"),
    (re.compile(r"\bse\b", re.I), "से"),
    (re.compile(r"\bko\b", re.I), "को"),
    (re.compile(r"\bka\b", re.I), "का"),
    (re.compile(r"\bki\b", re.I), "की"),
    (re.compile(r"\bke\b", re.I), "के"),
    (re.compile(r"\bya\b", re.I), "या"),
    (re.compile(r"\bau\b|\baur\b", re.I), "और"),
]


class NormalizeRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Hinglish / slang input")
    engine: Literal["auto", "llm", "heuristic"] = "auto"


class NormalizeResponse(BaseModel):
    detected_intent: str
    pure_hindi: str
    pure_english: str
    engine_used: str | None = None


class BatchNormalizeRequest(BaseModel):
    texts: list[str] = Field(..., min_length=1, max_length=50)


def _extract_json_object(raw: str) -> dict:
    raw = raw.strip()
    if raw.startswith("```"):
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        m = re.search(r"\{[\s\S]*\}", raw)
        if not m:
            raise
        return json.loads(m.group(0))


async def normalize_with_gemini(text: str) -> dict:
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    )
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": (
                            f"{SYSTEM_PROMPT}\n\n### इनपुट:\n{text}\n\n"
                            "केवल JSON ऑब्जेक्ट लौटाएँ।"
                        )
                    }
                ],
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json",
        },
    }
    async with httpx.AsyncClient(timeout=45.0) as client:
        res = await client.post(url, json=payload)
        if res.status_code >= 400:
            raise HTTPException(status_code=502, detail=f"Gemini error: {res.text[:400]}")
        data = res.json()
    try:
        raw = data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError) as exc:
        raise HTTPException(status_code=502, detail=f"Unexpected Gemini response: {exc}") from exc
    return _extract_json_object(raw)


async def normalize_with_openai(text: str) -> dict:
    url = "https://api.openai.com/v1/chat/completions"
    headers = {"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"}
    payload = {
        "model": OPENAI_MODEL,
        "temperature": 0.2,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"इनपुट: {text}"},
        ],
    }
    async with httpx.AsyncClient(timeout=45.0) as client:
        res = await client.post(url, headers=headers, json=payload)
        if res.status_code >= 400:
            raise HTTPException(status_code=502, detail=f"OpenAI error: {res.text[:400]}")
        data = res.json()
    raw = data["choices"][0]["message"]["content"]
    return _extract_json_object(raw)


def normalize_heuristic(text: str) -> dict:
    """Offline fallback — expands slang and builds formal Hindi/English for common patterns."""
    original = text.strip()
    lowered = original.lower()

    # Pattern: meeting time / cancel
    if re.search(r"meeting|mtg|बैठक|मीटिंग", lowered) and re.search(
        r"cancel|fix|kitne|bje|baje|time|समय", lowered
    ):
        return {
            "detected_intent": "कल की मीटिंग के समय या स्थिति के बारे में पूछताछ",
            "pure_hindi": "क्या कल की बैठक का समय तय हो गया है या इसे रद्द कर दिया गया है?",
            "pure_english": "Is the timing for tomorrow's meeting finalized, or has it been cancelled?",
        }

    # Pattern: don't understand
    if re.search(r"smjh|samajh", lowered) and re.search(r"ni|nahi|nhi", lowered):
        return {
            "detected_intent": "उपयोगकर्ता को विषय समझ नहीं आ रहा है",
            "pure_hindi": "मुझे कुछ समझ नहीं आ रहा है।",
            "pure_english": "I am not able to understand this.",
        }

    # Pattern: working / in progress
    if re.search(r"\bkr\b|\bkar\b", lowered) and re.search(r"rhe|rahe|rhi|rahi", lowered):
        return {
            "detected_intent": "कार्य प्रगति पर होने की जानकारी",
            "pure_hindi": "मैं अभी काम कर रहा/रही हूँ।",
            "pure_english": "I am currently working on it.",
        }

    # Generic: expand slang tokens then wrap formally
    expanded = original
    for pattern, repl in SLANG_MAP:
        expanded = pattern.sub(repl, expanded)
    expanded = re.sub(r"\s+", " ", expanded).strip()

    return {
        "detected_intent": "उपयोगकर्ता की अनौपचारिक हिंग्लिश बात को औपचारिक रूप में व्यक्त करना",
        "pure_hindi": f"कृपया ध्यान दें: {expanded}",
        "pure_english": (
            "Please note the following request (normalized from informal Hinglish): "
            f"{original.strip()}"
        ),
    }


async def normalize_text(text: str, engine: str = "auto") -> NormalizeResponse:
    text = text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="text is required")

    use_llm = engine == "llm" or (engine == "auto" and (GEMINI_API_KEY or OPENAI_API_KEY))
    if engine == "heuristic":
        use_llm = False

    if use_llm:
        if GEMINI_API_KEY:
            data = await normalize_with_gemini(text)
            engine_used = "gemini"
        elif OPENAI_API_KEY:
            data = await normalize_with_openai(text)
            engine_used = "openai"
        else:
            raise HTTPException(
                status_code=503,
                detail="LLM engine requested but GEMINI_API_KEY / OPENAI_API_KEY not set",
            )
    else:
        data = normalize_heuristic(text)
        engine_used = "heuristic"

    for key in ("detected_intent", "pure_hindi", "pure_english"):
        if key not in data or not str(data[key]).strip():
            raise HTTPException(status_code=502, detail=f"Normalizer missing field: {key}")

    return NormalizeResponse(
        detected_intent=str(data["detected_intent"]).strip(),
        pure_hindi=str(data["pure_hindi"]).strip(),
        pure_english=str(data["pure_english"]).strip(),
        engine_used=engine_used,
    )


@app.get("/health")
async def health():
    return {
        "ok": True,
        "service": "hinglish-normalizer",
        "gemini": bool(GEMINI_API_KEY),
        "openai": bool(OPENAI_API_KEY),
        "default_engine": "llm" if (GEMINI_API_KEY or OPENAI_API_KEY) else "heuristic",
    }


@app.post("/normalize", response_model=NormalizeResponse)
async def normalize(req: NormalizeRequest):
    """Convert one Hinglish/slang string to pure Hindi + English."""
    return await normalize_text(req.text, req.engine)


@app.post("/normalize/batch")
async def normalize_batch(req: BatchNormalizeRequest):
    results = []
    for t in req.texts:
        results.append(await normalize_text(t, "auto"))
    return {"success": True, "count": len(results), "results": results}


@app.get("/")
async def root():
    return {
        "service": "Hinglish Normalizer",
        "docs": "/docs",
        "endpoints": ["GET /health", "POST /normalize", "POST /normalize/batch"],
    }


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8088"))
    uvicorn.run("main:app", host=host, port=port, reload=True)
