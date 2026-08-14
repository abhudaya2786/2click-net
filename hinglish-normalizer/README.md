# Hinglish Normalizer

Bikhre Hinglish / slang / व्याकरण-रहित बोलचाल को **शुद्ध हिंदी** और **clean English** JSON में बदलने वाला FastAPI microservice.

## Structure

```
hinglish-normalizer/
├── main.py
├── requirements.txt
├── .env.example
├── .env          # local only (gitignored) — copy from .env.example
└── README.md
```

## Setup

```bash
cd hinglish-normalizer
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Optional: set GEMINI_API_KEY in .env for LLM mode
```

## Run

```bash
source .venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# or: python main.py
```

- API docs: http://127.0.0.1:8000/docs  
- Health: http://127.0.0.1:8000/health  

Without a real `GEMINI_API_KEY` the service uses a **heuristic engine** (works offline). With a valid key it uses **google-genai** + the linguistic expert prompt.

## API

### `POST /normalize`

```bash
curl -s http://127.0.0.1:8000/normalize \
  -H 'content-type: application/json' \
  -d '{"text":"bhai kl meeting kitne bje hogi kuch fix h kya ya cancel h?"}'
```

Response:

```json
{
  "detected_intent": "कल की मीटिंग के समय या स्थिति के बारे में पूछताछ",
  "pure_hindi": "क्या कल की बैठक का समय तय हो गया है या इसे रद्द कर दिया गया है?",
  "pure_english": "Is the timing for tomorrow's meeting finalized, or has it been cancelled?",
  "engine_used": "heuristic"
}
```

Optional body field: `"engine": "auto" | "llm" | "heuristic"`.

### `POST /normalize/batch`

```bash
curl -s http://127.0.0.1:8000/normalize/batch \
  -H 'content-type: application/json' \
  -d '{"texts":["kuch smjh ni ara","kr rhe h"]}'
```

## Dependencies

```
fastapi>=0.110.0
uvicorn[standard]>=0.28.0
pydantic>=2.6.0
python-dotenv>=1.0.0
google-genai>=0.1.1
```

## Environment

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Your Gemini API key (`your_actual_gemini_api_key_here` → replace) |
| `GEMINI_MODEL` | Default `gemini-2.0-flash` |
| `HOST` / `PORT` | Bind address (default `0.0.0.0:8000`) |
