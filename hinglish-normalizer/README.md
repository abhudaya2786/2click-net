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
# Optional: set GEMINI_API_KEY or OPENAI_API_KEY in .env for LLM mode
```

## Run

```bash
source .venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8088 --reload
# or: python main.py
```

- API docs: http://127.0.0.1:8088/docs  
- Health: http://127.0.0.1:8088/health  

Without API keys the service uses a **heuristic engine** (works offline). With `GEMINI_API_KEY` / `OPENAI_API_KEY` it uses the LLM linguistic expert prompt.

## API

### `POST /normalize`

```bash
curl -s http://127.0.0.1:8088/normalize \
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
curl -s http://127.0.0.1:8088/normalize/batch \
  -H 'content-type: application/json' \
  -d '{"texts":["kuch smjh ni ara","kr rhe h"]}'
```

## Environment

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Preferred LLM normalizer |
| `GEMINI_MODEL` | Default `gemini-2.0-flash` |
| `OPENAI_API_KEY` | Fallback LLM |
| `OPENAI_MODEL` | Default `gpt-4o-mini` |
| `HOST` / `PORT` | Bind address (default `0.0.0.0:8088`) |
