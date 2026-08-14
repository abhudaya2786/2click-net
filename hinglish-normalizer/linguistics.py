"""
Shared AI helpers: dialect normalize + optional audio transcription.
"""

from __future__ import annotations

import base64
import re
from typing import Any, Optional

from fastapi import HTTPException, status
from google.genai import types
from pydantic import BaseModel, Field


class LinguisticResult(BaseModel):
    detected_dialect: str = Field(
        description="पहचानी गई बोली (जैसे: भोजपुरी, अवधी, हिंग्लिश, टपोरी, शिष्ट)"
    )
    detected_intent: str = Field(description="बातचीत का मुख्य बिज़नेस उद्देश्य और संदर्भ")
    pure_hindi: str = Field(description="शुद्ध मानक देवनागरी हिंदी रूपांतरण")
    pure_english: str = Field(description="व्याकरणिक रूप से शुद्ध औपचारिक अंग्रेजी वाक्य")


SYSTEM_INSTRUCTION = """
आप एक मास्टर बहुभाषी भाषाविद् (Multi-Dialect Linguistic Specialist) और एग्जीक्यूटिव ट्रांसक्रिप्ट एडिटर हैं।

आपका कार्य भारत की विभिन्न क्षेत्रीय बोलियों (भोजपुरी, अवधी, पूर्वांचली, देहाती बोलचाल), शहरी स्लैंग्स (मुंबईया, दिल्ली टपोरी), हिंग्लिश और अत्यधिक विनम्र/औपचारिक बोलियों में बोली गई किसी भी कच्ची ऑडियो बातचीत को समझना, उसका सही अर्थ निकालना और उसे 100% शुद्ध, त्रुटिहीन और औपचारिक (Formal) हिंदी और अंग्रेजी में बदलना है।

### सख्त नियम:
1. बोली/लहज़ा पहचानें — मूल भाव 100% सुरक्षित रखें। `detected_dialect` में लिखें।
2. अनावश्यक शब्द हटाएँ: अरे, मतलब, उम्म, काहे की, बाबू, भैया, यार, अपुन, तबे।
3. नंबर्स और टेक्निकल टर्म्स सटीक रखें।
4. `pure_hindi` मानक देवनागरी; `pure_english` औपचारिक अंग्रेजी।
5. आउटपुट केवल मान्य JSON।

### JSON स्कीमा:
{
  "detected_dialect": "...",
  "detected_intent": "...",
  "pure_hindi": "...",
  "pure_english": "..."
}
"""


def heuristic_normalize(text: str) -> LinguisticResult:
    cleaned = re.sub(r"\s+", " ", text).strip()
    dialect = "हिंग्लिश"
    if re.search(r"(गइल|चाही|बा\b|अउर|नइखे)", cleaned):
        dialect = "भोजपुरी / पूर्वांचली"
    elif re.search(r"(कहत|होई|तबे|मिस्त्री)", cleaned):
        dialect = "ग्रामीण अवधी / लेबर वर्कफोर्स"
    return LinguisticResult(
        detected_dialect=dialect,
        detected_intent=cleaned[:160],
        pure_hindi=cleaned,
        pure_english=cleaned,
    )


def build_mom_summary(result: LinguisticResult) -> str:
    return "\n".join(
        [
            f"1. {result.detected_intent}",
            f"2. {result.pure_hindi[:180]}",
            f"3. {result.pure_english[:180]}",
        ]
    )


async def normalize_text(client: Any, model: str, raw_text: str) -> LinguisticResult:
    if client is None:
        return heuristic_normalize(raw_text)
    response = client.models.generate_content(
        model=model,
        contents=(
            "निम्नलिखित कच्ची ट्रांसक्रिप्ट को नियमों के अनुसार केवल मान्य JSON में सामान्यीकृत करें:\n\n"
            f"{raw_text}"
        ),
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            temperature=0.1,
            response_mime_type="application/json",
            response_schema=LinguisticResult,
        ),
    )
    if not response.text:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI मॉडल से कोई वैध उत्तर प्राप्त नहीं हुआ।",
        )
    return LinguisticResult.model_validate_json(response.text)


async def transcribe_audio(
    client: Any,
    model: str,
    *,
    audio_base64: str,
    mime_type: str = "audio/webm",
) -> str:
    if client is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Audio transcription के लिए GEMINI_API_KEY आवश्यक है।",
        )
    raw = audio_base64
    if "," in raw and raw.strip().startswith("data:"):
        raw = raw.split(",", 1)[1]
    try:
        audio_bytes = base64.b64decode(raw)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid audio_base64: {exc}") from exc

    response = client.models.generate_content(
        model=model,
        contents=[
            types.Content(
                role="user",
                parts=[
                    types.Part.from_bytes(data=audio_bytes, mime_type=mime_type or "audio/webm"),
                    types.Part.from_text(
                        text=(
                            "इस ऑडियो को हिंदी/हिंग्लिश में सटीक ट्रांसक्राइब करें। "
                            "केवल ट्रांसक्रिप्ट टेक्स्ट लौटाएँ — कोई प्रस्तावना नहीं।"
                        )
                    ),
                ],
            )
        ],
        config=types.GenerateContentConfig(temperature=0.1),
    )
    text = (response.text or "").strip()
    if not text:
        raise HTTPException(status_code=502, detail="Audio transcription empty")
    return text
