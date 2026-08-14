import os
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from google import genai
from google.genai import types

# .env फ़ाइल से वेरिएबल्स लोड करें
load_dotenv()

# Gemini API Client इनिशियलाइज़ करें
api_key = os.getenv("GEMINI_API_KEY")
if not api_key or api_key.strip() in {"", "your_actual_gemini_api_key_here"}:
    raise RuntimeError("GEMINI_API_KEY वातावरण चर में सेट नहीं है।")

ai_client = genai.Client(api_key=api_key)

# FastAPI ऐप सेटअप
app = FastAPI(
    title="Hinglish Linguistic Normalizer API",
    description="बिखरी हुई हिंग्लिश बोली को शुद्ध देवनागरी हिंदी और फॉर्मल इंग्लिश में बदलने वाली API",
    version="1.0.0",
)

# CORS Middleware (Frontend/Mobile App से कनेक्ट करने के लिए)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Data Models ---


class NormalizationRequest(BaseModel):
    raw_text: str = Field(
        ...,
        min_length=2,
        description="कच्ची हिंग्लिश या टूटी-फूटी ट्रांसक्रिप्ट",
        examples=["are bhaiya kl site pe cement kb tk phuchega kuch fix h kya?"],
    )


class NormalizationResponse(BaseModel):
    detected_intent: str = Field(description="बातचीत का मुख्य भाव और संदर्भ")
    pure_hindi: str = Field(description="शुद्ध मानक देवनागरी हिंदी रूपांतरण")
    pure_english: str = Field(description="व्याकरणिक रूप से शुद्ध औपचारिक अंग्रेजी वाक्य")


# --- System Prompt Instructions ---

SYSTEM_INSTRUCTION = """
आप एक विशेषज्ञ भाषाविद् (Linguistic Expert) और ट्रांसक्रिप्ट एडिटर हैं।
आपका कार्य उपयोगकर्ताओं द्वारा बोली गई कच्ची, बिखरी हुई हिंग्लिश (रोमन या टूटी-फूटी देवनागरी) को शुद्ध, औपचारिक और स्पष्ट भाषा में बदलना है।

नियम:
1. मूल संदर्भ, तकनीकी शब्द (जैसे: Cement, Server, API, Quotation) और संख्याओं को न बदलें।
2. 'उम्म', 'अरे', 'मतलब', दोहराए गए शब्दों और अनावश्यक स्लैंग्स को पूरी तरह हटा दें।
3. शुद्ध हिंदी हमेशा मानक देवनागरी लिपि में ही होनी चाहिए।
4. अंग्रेजी वाक्य पूरी तरह व्याकरण-शुद्ध और प्रोफेशनल होना चाहिए।
"""

# --- API Endpoints ---


@app.get("/", tags=["Health Check"])
async def health_check():
    return {"status": "active", "service": "Hinglish Normalizer Service"}


@app.post(
    "/api/v1/normalize",
    response_model=NormalizationResponse,
    status_code=status.HTTP_200_OK,
    tags=["Linguistics"],
)
async def normalize_hinglish(payload: NormalizationRequest):
    """
    कच्ची हिंग्लिश स्ट्रिंग को लेकर स्ट्रक्चर्ड शुद्ध हिंदी और इंग्लिश JSON देता है।
    """
    try:
        # Gemini 2.5 Flash मॉडल का उपयोग करके स्ट्रक्चर्ड JSON प्राप्त करना
        response = ai_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=payload.raw_text,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                temperature=0.1,  # न्यूनतम विचलन और अधिकतम सटीकता के लिए
                response_mime_type="application/json",
                response_schema=NormalizationResponse,
            ),
        )

        if not response.text:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="AI मॉडल से कोई वैध उत्तर प्राप्त नहीं हुआ।",
            )

        # JSON पार्सिंग और स्कीमा वैलिडेशन
        validated_output = NormalizationResponse.model_validate_json(response.text)
        return validated_output

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"प्रोसेसिंग में त्रुटि: {str(e)}",
        )


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
