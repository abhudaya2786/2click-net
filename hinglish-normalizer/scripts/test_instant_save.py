"""Smoke test: Instant Save architecture without Gemini/Postgres."""
import asyncio
import uuid

from classification import classify_conversation_type
import store as db


def test_classify():
    assert (
        classify_conversation_type(transcript="phone call with vendor", contact_phone="999")
        == "phone_call"
    )
    assert classify_conversation_type(transcript="site meeting standup") == "in_person_meeting"
    assert classify_conversation_type(source="call_recorder") == "phone_call"
    assert classify_conversation_type(duration_seconds=30) == "voice_note"
    print("classify OK")


async def test_instant_save_and_search():
    user_id = uuid.uuid4()
    await db.ensure_user(user_id)
    saved = await db.save_conversation(
        user_id=user_id,
        type="phone_call",
        contact_name="राजेश जी",
        contact_phone="9876543210",
        raw_transcript="bhai 100 bag cement kal subah 10 baje",
        pure_hindi_text="कल सुबह 10 बजे 100 बैग सीमेंट भेजें।",
        pure_english_text="Send 100 bags of cement by 10 AM tomorrow.",
        summary="Cement delivery confirmation",
        detected_dialect="हिंग्लिश",
        detected_intent="सीमेंट डिलीवरी",
        duration_seconds=160,
    )
    assert saved["user_id"] == user_id
    rows = await db.list_conversations(user_id, q="सीमेंट")
    assert len(rows) >= 1
    rows2 = await db.list_conversations(user_id, q="no-such-token-xyz")
    assert len(rows2) == 0
    grouped = db.group_by_date(rows)
    assert grouped and grouped[0]["count"] >= 1
    print("instant_save+search OK", saved["id"])


if __name__ == "__main__":
    test_classify()
    asyncio.run(test_instant_save_and_search())
    print("ALL PASS")
