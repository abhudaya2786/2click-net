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

`GEMINI_API_KEY` is **required**. Replace the placeholder with a real key or the app will refuse to start.

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
  "detected_intent": "...",
  "detected_dialect": "भोजपुरी | अवधी | हिंग्लिश | मुंबईया | ...",
  "pure_hindi": "...",
  "pure_english": "..."
}
```

Supports: भोजपुरी, अवधी, पूर्वांचली, देहाती बोलचाल, मुंबईया/दिल्ली स्लैंग, Hinglish, formal Hindi.
## Dependencies

```
fastapi>=0.110.0
uvicorn[standard]>=0.28.0
pydantic>=2.6.0
python-dotenv>=1.0.0
google-genai>=0.1.1
```
