"""Tests for Sales MoM / Sales Intelligence generator."""
import os
import pytest
import requests

from conftest import get_backend_url

BASE = get_backend_url()
API = f"{BASE}/api/sales-mom"

SAMPLE = """Sales Rep: Thanks for joining. 2click.in Super Mart gives brand-wise rates and BOQ templates.
Client: We use IndiaMART today. Your subscription feels costly — can you discount annual billing?
Sales Rep: I can check Business annual pricing. Shall we run a pilot on the Pune site next week?
Client: Yes, let's proceed. Please send the proposal by Friday with SLA and ROI versus IndiaMART.
Sales Rep: Confirmed. I'll send the proposal by Friday and kick off after your approval.
"""


@pytest.fixture(scope="module")
def client():
    try:
        r = requests.get(f"{BASE}/api/health", timeout=5)
        if r.status_code >= 500:
            pytest.skip("Backend unhealthy")
    except Exception:
        # health may not exist — try sample endpoint
        try:
            requests.get(f"{API}/sample", timeout=5).raise_for_status()
        except Exception as exc:
            pytest.skip(f"Backend not reachable: {exc}")
    return requests.Session()


def test_sample_transcript(client):
    r = client.get(f"{API}/sample", timeout=30)
    assert r.status_code == 200
    data = r.json()
    assert "transcript" in data and len(data["transcript"]) > 50
    assert "Sales Rep" in data["transcript"] or "Client" in data["transcript"]


def test_analyze_heuristic_schema(client):
    r = client.post(
        f"{API}/analyze",
        json={"transcript": SAMPLE, "use_llm": False, "save": True, "client_name": "Sharma"},
        timeout=60,
    )
    assert r.status_code == 200, r.text
    data = r.json()

    assert "mom" in data
    mom = data["mom"]
    for key in ("meeting_title", "executive_summary", "key_discussion_points",
                "decisions_made", "client_objections", "missed_pitch_gaps"):
        assert key in mom

    assert isinstance(mom["key_discussion_points"], list)
    assert isinstance(mom["decisions_made"], list)
    assert isinstance(mom["client_objections"], list)

    si = data["sales_intelligence"]
    assert si["client_engagement_level"] in ("High", "Medium", "Low")
    assert si["lead_status"] in ("Hot", "Warm", "Cold")
    assert 0 <= int(si["conversion_probability_percentage"]) <= 100
    assert isinstance(si["competitors_mentioned"], list)
    assert "indiamart" in " ".join(si["competitors_mentioned"]).lower()

    assert isinstance(data["action_plan"], list)
    if data["action_plan"]:
        a = data["action_plan"][0]
        assert a["owner"] in ("Sales Rep", "Client", "Manager")
        assert len(a["deadline_date"]) == 10
        assert ":" in a["reminder_time"]

    assert isinstance(data["whatsapp_template_message"], str)
    assert len(data["whatsapp_template_message"]) > 20

    # Price objection should surface
    obj_blob = " ".join(mom["client_objections"]).lower()
    assert "price" in obj_blob or "discount" in obj_blob or "cost" in obj_blob


def test_analyze_rejects_short_transcript(client):
    r = client.post(f"{API}/analyze", json={"transcript": "hi", "use_llm": False}, timeout=30)
    assert r.status_code in (400, 422)


def test_history_endpoint(client):
    r = client.get(f"{API}/history?limit=5", timeout=30)
    assert r.status_code == 200
    assert "items" in r.json()
    assert isinstance(r.json()["items"], list)


def test_pure_heuristic_unit():
    """Unit test without HTTP — import module directly."""
    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    import sales_mom as sm

    result = sm.analyze_transcript_heuristic(SAMPLE)
    validated = sm._validate_payload(result)
    assert validated["sales_intelligence"]["lead_status"] in ("Hot", "Warm", "Cold")
    assert "IndiaMART" in validated["sales_intelligence"]["competitors_mentioned"] or \
           "Indiamart" in validated["sales_intelligence"]["competitors_mentioned"]
    assert validated["whatsapp_template_message"]


def test_openai_helper_requires_key():
    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    import sales_mom as sm

    assert "IGNORE PERSONAL TALK" in sm.SYSTEM_PROMPT
    assert "whatsapp_template_message" in sm.SYSTEM_PROMPT
    # Without OPENAI_API_KEY, sync helper must fail clearly (no silent fake JSON)
    old = sm.OPENAI_API_KEY
    try:
        sm.OPENAI_API_KEY = None
        try:
            sm.process_sales_meeting(SAMPLE, "2026-08-12")
            assert False, "expected RuntimeError"
        except RuntimeError as exc:
            assert "OPENAI_API_KEY" in str(exc)
    finally:
        sm.OPENAI_API_KEY = old


def test_hindi_example_schema_and_owner_alias():
    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    import sales_mom as sm

    assert sm._normalize_owner("Sales Manager") == "Manager"
    raw = {
        **sm.EXAMPLE_RESULT_HI,
        "action_plan": [
            {**sm.EXAMPLE_RESULT_HI["action_plan"][0], "owner": "Sales Manager"},
            sm.EXAMPLE_RESULT_HI["action_plan"][1],
        ],
    }
    validated = sm._validate_payload(raw)
    assert validated["mom"]["meeting_title"].startswith("सॉफ्टवेयर")
    assert validated["action_plan"][0]["owner"] == "Manager"
    assert validated["sales_intelligence"]["competitors_mentioned"] == ["X-Tech Solutions"]
    assert "नमस्ते" in validated["whatsapp_template_message"]


def test_hindi_sample_analyze(client):
    r = client.get(f"{API}/sample?lang=hi", timeout=30)
    assert r.status_code == 200
    sample = r.json()
    assert "जियो" in sample["transcript"] or "जियो-फेंसिंग" in sample["transcript"]
    assert sample.get("example_result", {}).get("mom", {}).get("meeting_title")

    r2 = client.post(
        f"{API}/analyze",
        json={
            "transcript": sample["transcript"],
            "meeting_date": "2026-08-12",
            "output_language": "hi",
            "use_llm": False,
            "save": False,
        },
        timeout=60,
    )
    assert r2.status_code == 200, r2.text
    data = r2.json()
    assert "डेमो" in data["mom"]["meeting_title"] or "सॉफ्टवेयर" in data["mom"]["meeting_title"]
    assert data["sales_intelligence"]["lead_status"] == "Warm"
    assert data["action_plan"][0]["owner"] in ("Sales Rep", "Client", "Manager")
    assert data["meta"].get("output_language") == "hi"
