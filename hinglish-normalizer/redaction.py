"""
Wake-word / command-trigger redaction for Instant Save transcripts & MoM.
"""

from __future__ import annotations

import re

COMMAND_TRIGGER_PHRASES: list[str] = [
    # Start
    "2click start",
    "2 click start",
    "two click start",
    "meeting shuru karo",
    "meeting shuru",
    "start recording",
    "recording start",
    "record start",
    "meeting start",
    "start meeting",
    "मीटिंग शुरू करो",
    "मीटिंग शुरू",
    "रिकॉर्डिंग शुरू करो",
    "रिकॉर्डिंग शुरू",
    # Stop / save
    "meeting khatam",
    "meeting khatm",
    "2click stop",
    "2 click stop",
    "two click stop",
    "save note",
    "save notes",
    "stop recording",
    "recording stop",
    "meeting stop",
    "stop meeting",
    "मीटिंग खत्म",
    "मीटिंग समाप्त",
    "सेव नोट",
    # Cancel
    "cancel recording",
    "recording cancel",
    "cancel note",
    "discard recording",
    "रिकॉर्डिंग रद्द",
    "कैंसल रिकॉर्डिंग",
]


def _normalize_ws(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def redact_command_triggers(text: str, extra_phrases: list[str] | None = None) -> str:
    """Remove start/stop/cancel trigger phrases from transcript or MoM text."""
    if not text:
        return text

    phrases = [p.strip() for p in (*COMMAND_TRIGGER_PHRASES, *(extra_phrases or [])) if p and p.strip()]
    phrases.sort(key=len, reverse=True)

    out = text
    for phrase in phrases:
        escaped = re.escape(phrase).replace(r"\ ", r"\s+")
        out = re.sub(escaped, " ", out, flags=re.IGNORECASE)

    # Latin-normalized pass for mixed ASR output
    lowered = out.lower()
    for phrase in phrases:
        n = _normalize_ws(phrase.lower())
        if not n:
            continue
        if n in lowered:
            escaped = re.escape(n).replace(r"\ ", r"\s+")
            out = re.sub(escaped, " ", out, flags=re.IGNORECASE)
            lowered = out.lower()

    out = re.sub(r"\s{2,}", " ", out)
    out = re.sub(r"\s+([,.!?])", r"\1", out)
    return out.strip()
