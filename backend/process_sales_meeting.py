#!/usr/bin/env python3
"""
Standalone Sales MoM generator — OpenAI JSON mode.

Usage:
  export OPENAI_API_KEY=sk-...
  python process_sales_meeting.py

Or import:
  from process_sales_meeting import process_sales_meeting
  result = process_sales_meeting(transcript, "2026-08-12", output_language="hi")
"""
from __future__ import annotations

import json
import os
import sys

import openai

# OpenAI client — key from env (never hardcode secrets)
_api_key = os.environ.get("OPENAI_API_KEY", "").strip()
_base_url = os.environ.get("OPENAI_BASE_URL", "").strip() or None
_model = os.environ.get("OPENAI_MODEL", "gpt-4o").strip() or "gpt-4o"

_client_kwargs = {"api_key": _api_key or "YOUR_OPENAI_API_KEY"}
if _base_url:
    _client_kwargs["base_url"] = _base_url
client = openai.OpenAI(**_client_kwargs)

SYSTEM_PROMPT = """
You are an expert AI Sales Intelligence & Minutes of Meeting (MoM) Generator.

Your task is to analyze the provided conversation transcript between a Sales Representative and a Client/Customer.

INSTRUCTIONS & RULES:
1. IGNORE PERSONAL TALK: Filter out irrelevant personal chatter (e.g., family talk, general gossip, weather, food/tea offers). Focus ONLY on business-related discussion.
2. ACCURACY: Do not invent or fabricate details not present in the transcript.
3. OUTPUT FORMAT: Respond ONLY in valid JSON format matching the schema below. Do not wrap in markdown quotes or add extra text.
4. LANGUAGE: Write all narrative string values (titles, summaries, points, objections, tips, WhatsApp message, task text) in the language requested by the user message (en or hi). Keep enum fields in English exactly as specified: client_engagement_level, lead_status, and action_plan.owner.
5. action_plan.owner MUST be exactly one of: "Sales Rep", "Client", "Manager" (map "Sales Manager" → "Manager").

JSON SCHEMA TO FOLLOW EXACTLY:
{
  "mom": {
    "meeting_title": "String - Short title summarizing the primary purpose",
    "executive_summary": "String - 2 to 3 sentences summarizing the meeting outcome",
    "key_discussion_points": [
      "String - Point 1",
      "String - Point 2"
    ],
    "decisions_made": [
      "String - Decision 1"
    ],
    "client_objections": [
      "String - Price concern, competitor mention, or doubt raised by client"
    ],
    "missed_pitch_gaps": [
      "String - What feature, discount, or info the sales rep failed to mention or address"
    ]
  },
  "sales_intelligence": {
    "client_engagement_level": "High / Medium / Low",
    "lead_status": "Hot / Warm / Cold",
    "conversion_probability_percentage": 75,
    "competitors_mentioned": [
      "String - Competitor company or product names mentioned"
    ],
    "coaching_tips_for_rep": "String - 1-2 actionable tips to help the sales rep improve their pitch next time"
  },
  "action_plan": [
    {
      "task": "String - Task to perform",
      "owner": "Sales Rep / Client / Manager",
      "deadline_date": "YYYY-MM-DD",
      "reminder_time": "HH:MM"
    }
  ],
  "whatsapp_template_message": "String - A short, polite, highly professional WhatsApp follow-up message ready to be sent to the client, summarizing key decisions and next steps."
}
""".strip()

SAMPLE_TRANSCRIPT_HI = """सेल्स रेप: नमस्ते राहुल जी, आज सॉफ्टवेयर डेमो के लिए धन्यवाद। चाय लेंगे?
क्लाइंट: नहीं धन्यवाद, चलिए सीधे डेमो शुरू करते हैं।
सेल्स रेप: ज़रूर। यह लाइव जियो-फेंसिंग फीचर है — फील्ड टीम रियल-टाइम ट्रैक होती है।
क्लाइंट: ट्रैकिंग अच्छी लग रही है, हम संतुष्ट हैं। लेकिन मासिक सब्सक्रिप्शन बजट से लगभग 15% ज्यादा लग रहा है। क्या 10% और डिस्काउंट मिल सकता है?
सेल्स रेप: मैं मैनेजर से कमर्शियल रिवाइज़ करवा सकता हूँ। 3-दिन का नि:शुल्क ट्रायल शुरू करें?
क्लाइंट: हाँ, ट्रायल के लिए सहमत हूँ। हमारे वर्तमान वेंडर X-Tech Solutions 24/7 सपोर्ट देते हैं — डाटा बैकअप और सिक्योरिटी पर भी स्पष्टता चाहिए।
सेल्स रेप: समझ गया। ट्रायल क्रेडेंशियल्स आज शेयर करूँगा और रिवाइज्ड कोटेशन भेजूँगा।
"""


def process_sales_meeting(
    transcript_text: str,
    meeting_date: str,
    output_language: str = "hi",
):
    """Analyze a sales call transcript → MoM JSON (OpenAI JSON mode)."""
    if not os.environ.get("OPENAI_API_KEY", "").strip():
        raise RuntimeError(
            "Set OPENAI_API_KEY in the environment before calling process_sales_meeting()."
        )

    lang = "hi" if str(output_language).lower().startswith("hi") else "en"
    user_content = (
        f"Meeting Date: {meeting_date}\n"
        f"Output language: {lang}\n\n"
        f"Transcript:\n{transcript_text}"
    )

    response = client.chat.completions.create(
        model=_model,
        response_format={"type": "json_object"},  # JSON मोड एनफोर्स करता है
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ],
        temperature=0.2,  # सटीक और तथ्य-आधारित आउटपुट के लिए
    )

    # JSON ऑब्जेक्ट में कन्वर्ट करें
    parsed_json = json.loads(response.choices[0].message.content)
    return parsed_json


if __name__ == "__main__":
    date = sys.argv[1] if len(sys.argv) > 1 else "2026-08-12"
    try:
        result = process_sales_meeting(SAMPLE_TRANSCRIPT_HI, date, output_language="hi")
    except RuntimeError as exc:
        print(json.dumps({"error": str(exc)}, ensure_ascii=False, indent=2))
        sys.exit(1)
    print(json.dumps(result, ensure_ascii=False, indent=2))
