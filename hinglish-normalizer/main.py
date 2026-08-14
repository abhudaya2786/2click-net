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
    description=(
        "भारत की क्षेत्रीय बोलियाँ (भोजपुरी, अवधी, पूर्वांचली), शहरी स्लैंग "
        "और हिंग्लिश को 100% शुद्ध औपचारिक हिंदी व अंग्रेजी JSON में बदलने वाली API"
    ),
    version="1.1.0",
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
        description="कच्ची क्षेत्रीय बोली / हिंग्लिश / स्लैंग ट्रांसक्रिप्ट",
        examples=[
            "are bhaiya kl site pe cement kb tk phuchega kuch fix h kya?",
            "का हो भैया, कल सीमेंट के बैग कब तक पहुँच जाई?",
            "का करत हौ? पेमेंट अभी तक क्लियर नइखे।",
            "scene set h, apun ko kal 11 baje site pe mil.",
        ],
    )


class NormalizationResponse(BaseModel):
    detected_dialect: str = Field(
        description="पहचानी गई बोली/लहज़ा (जैसे: भोजपुरी / पूर्वांचली, अवधी, हिंग्लिश, मुंबईया)"
    )
    detected_intent: str = Field(description="बातचीत का मुख्य भाव, संदर्भ और संक्षिप्त सार")
    pure_hindi: str = Field(description="100% शुद्ध मानक देवनागरी हिंदी रूपांतरण")
    pure_english: str = Field(description="व्याकरणिक रूप से शुद्ध औपचारिक अंग्रेजी वाक्य")


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
    क्षेत्रीय बोली / हिंग्लिश / स्लैंग को शुद्ध औपचारिक हिंदी व अंग्रेजी JSON में बदलता है।
    """
    try:
        # Gemini 2.5 Flash — multi-dialect structured JSON
        response = ai_client.models.generate_content(
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
