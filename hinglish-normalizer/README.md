# Hinglish Linguistic Normalizer API

Gemini-powered service that converts raw Hinglish / slang transcripts into
structured **pure Hindi** + **formal English** JSON.

## Structure

```
hinglish-normalizer/
├── main.py
├── requirements.txt
├── .env.example
├── .env          # local only (gitignored)
└── README.md
```

## Setup

```bash
cd hinglish-normalizer
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env — set a real GEMINI_API_KEY (required)
```

## Environment

```
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=8000
```

`GEMINI_API_KEY` enables Gemini normalize/transcribe. Without it, text Instant Save still works via heuristic normalize + memory/Postgres persistence.

## Run

```bash
source .venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# or: python main.py
```

- Docs: http://127.0.0.1:8000/docs  
- Health: http://127.0.0.1:8000/

## API

### `POST /api/v1/normalize`

```bash
curl -s http://127.0.0.1:8000/api/v1/normalize \
  -H 'content-type: application/json' \
  -d '{"raw_text":"are bhaiya kl site pe cement kb tk phuchega kuch fix h kya?"}'
```

Response:

```json
{
  "detected_dialect": "भोजपुरी / पूर्वांचली",
  "detected_intent": "भुगतान पूरा होने के बाद साइट पर सामग्री की डिलीवरी समय पर सुनिश्चित करना",
  "pure_hindi": "कृपया स्पष्ट करें कि साइट पर निर्माण सामग्री कब तक पहुंचेगी। भुगतान पूर्ण कर दिया गया है, अतः कार्य में कोई रुकावट नहीं आनी चाहिए।",
  "pure_english": "Please confirm when the materials will be delivered to the site. The full payment has been made, so there should be no disruption in work."
}
```

Hinglish slang example:

```json
{
  "detected_dialect": "हिंग्लिश / कैजुअल स्लैंग",
  "detected_intent": "क्लाइंट द्वारा तत्काल टोकन राशि देने की शर्त पर 10% छूट की मांग",
  "pure_hindi": "क्लाइंट 10% छूट की मांग कर रहा है और मूल्य कम करने की स्थिति में आज ही टोकन राशि देने को तैयार है।",
  "pure_english": "The client is requesting a 10% discount and is willing to pay the token amount today if the price is reduced."
}
```

Rural Awadhi / labor workforce example:

```json
{
  "detected_dialect": "ग्रामीण अवधी / लेबर वर्कफोर्स",
  "detected_intent": "छत की ढलाई हेतु अतिरिक्त जनशक्ति (मैनपावर) की आवश्यकता",
  "pure_hindi": "ठेकेदार के अनुसार कल 5 अतिरिक्त राजमिस्त्री और 10 श्रमिकों की आवश्यकता होगी, जिससे परसों तक छत की ढलाई पूर्ण की जा सके।",
  "pure_english": "According to the contractor, 5 additional masons and 10 laborers will be required tomorrow to complete the slab casting by day after tomorrow."
}
```

Supports: भोजपुरी, अवधी, पूर्वांचली, देहाती बोलचाल, मुंबईया/दिल्ली स्लैंग, Hinglish, formal Hindi.
## User-Based Instant Save (`/api/v1/conversations`)

Every conversation is stored with **`user_id`** immediately after process.

### POST — process + Instant Save
```bash
curl -s http://127.0.0.1:8000/api/v1/conversations \
  -H 'content-type: application/json' \
  -d '{
    "user_id": "11111111-1111-1111-1111-111111111111",
    "raw_text": "yaar client phone pe bol rha h 100 bag cement kal bhejna",
    "contact_name": "राजेश जी",
    "contact_phone": "9876543210",
    "source": "phone",
    "duration_seconds": 160,
    "create_task": "कल सुबह चेक तैयार रखना"
  }'
```

- Accepts `raw_text` and/or `audio_base64`
- Auto-classifies `phone_call` | `in_person_meeting` | `voice_note`
- Saves pure Hindi/English + MoM summary under `user_id`
- Works with Postgres (`DATABASE_URL`) or in-memory persistence

### GET — date-wise + keyword search
```bash
curl -s "http://127.0.0.1:8000/api/v1/conversations?user_id=11111111-1111-1111-1111-111111111111&q=सीमेंट&group_by_date=true"
```

Dashboard UI: `/conversations?user_id=<uuid>`


Schema: `schema.sql` — tables `users`, `conversations`, `scheduled_tasks`.

```bash
# create DB then apply schema
psql "$DATABASE_URL" -f schema.sql
```

Set in `.env`:

```
DATABASE_URL=postgresql://USER:PASS@HOST:5432/hinglish_normalizer
```

### Instant Save
`POST /api/v1/normalize` with:
```json
{
  "raw_text": "...",
  "save": true,
  "user_id": "<uuid>",
  "conversation_type": "phone_call",
  "contact_name": "Client",
  "contact_phone": "98XXXXXXXX"
}
```

### Extra endpoints
- `POST /api/v1/users`
- `GET /api/v1/users/{id}/conversations`
- `POST /api/v1/tasks`
- `GET /api/v1/users/{id}/tasks/pending`
- `POST /api/v1/tasks/{id}/complete`
