"""
Call vs meeting classification from metadata + transcript cues.
"""

from __future__ import annotations

import re
from typing import Literal, Optional

ConversationType = Literal["phone_call", "in_person_meeting", "voice_note"]

PHONE_CUES = re.compile(
    r"\b(phone|call|caller|mobile|whatsapp call|फोन|कॉल|कॉलिंग|रिंग|receiver)\b",
    re.I,
)
MEETING_CUES = re.compile(
    r"\b(meeting|meet|standup|boardroom|office|site visit|मीटिंग|बैठक|मुलाकात|ऑफिस|साइट पर मिले)\b",
    re.I,
)
VOICE_NOTE_CUES = re.compile(
    r"\b(voice note|voicenote|audio note|वॉइस नोट|ऑडियो नोट)\b",
    re.I,
)


def classify_conversation_type(
    *,
    explicit_type: Optional[str] = None,
    transcript: str = "",
    contact_phone: Optional[str] = None,
    duration_seconds: Optional[float] = None,
    source: Optional[str] = None,
) -> ConversationType:
    """
    Identify conversation type for Instant Save.
    Priority: explicit type → source hint → transcript/phone cues → duration heuristic.
    """
    if explicit_type in {"phone_call", "in_person_meeting", "voice_note"}:
        return explicit_type  # type: ignore[return-value]

    src = (source or "").lower().strip()
    if src in {"phone", "telephony", "call_recorder", "exotel", "twilio"}:
        return "phone_call"
    if src in {"meeting", "in_person", "geofence", "studio"}:
        return "in_person_meeting"
    if src in {"voice_note", "recorder", "upload"}:
        return "voice_note"

    text = transcript or ""
    if VOICE_NOTE_CUES.search(text):
        return "voice_note"
    if contact_phone and PHONE_CUES.search(text):
        return "phone_call"
    if contact_phone and not MEETING_CUES.search(text):
        return "phone_call"
    if MEETING_CUES.search(text):
        return "in_person_meeting"
    if PHONE_CUES.search(text):
        return "phone_call"

    # Short clips without meeting cues → voice note; longer → meeting default
    if duration_seconds is not None:
        if duration_seconds < 90:
            return "voice_note"
        if duration_seconds >= 90:
            return "in_person_meeting"

    return "voice_note"
