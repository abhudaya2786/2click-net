"""Shared test configuration — resolves backend URL from env or frontend/.env."""
import os
from pathlib import Path

_WORKSPACE = Path(__file__).resolve().parents[2]


def get_backend_url() -> str:
    url = os.environ.get("REACT_APP_BACKEND_URL", "").strip()
    if url:
        return url.rstrip("/")
    for env_path in (_WORKSPACE / "frontend" / ".env", Path("/app/frontend/.env")):
        if env_path.exists():
            for line in env_path.read_text().splitlines():
                if line.startswith("REACT_APP_BACKEND_URL="):
                    return line.split("=", 1)[1].strip().rstrip("/")
    return "http://localhost:8001"
