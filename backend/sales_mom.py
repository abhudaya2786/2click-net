"""
2click.in — AI Sales Intelligence & Minutes of Meeting (MoM) Generator.

Analyzes Sales Rep ↔ Client transcripts into structured MoM, sales intelligence,
action plans, and a ready-to-send WhatsApp follow-up. Uses a deterministic
heuristic engine (always available) with optional Emergent LLM enrichment.
"""
from __future__ import annotations

import json
import os
import re
import uuid
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional, Tuple

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

_db = None
_get_current_user = None  # reserved for future auth-gated history

router = APIRouter(prefix="/api/sales-mom", tags=["sales-mom"])

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
AI_PROVIDER = os.environ.get("AI_PROVIDER", "gemini")
AI_MODEL = os.environ.get("AI_MODEL", "gemini-3.1-pro-preview")

PERSONAL_NOISE = re.compile(
    r"\b("
    r"weather|rain|sunny|family|kids?|wife|husband|tea|coffee|lunch|dinner|"
    r"breakfast|cricket|bollywood|how\s+are\s+you|good\s+morning|good\s+evening|"
    r"weekend|holiday|vacation|traffic|festival|diwali|holi|"
    r"beta|bhai|yaar\s+kal|ghar\s+pe"
    r")\b",
    re.I,
)

OBJECTION_PATTERNS = [
    (re.compile(r"\b(too\s+expensive|costly|pricey|overpriced|high\s+price|budget)\b", re.I), "Price / budget concern"),
    (re.compile(r"\b(cheaper|discount|negotiate|reduce\s+the\s+price|lower\s+price)\b", re.I), "Discount / price reduction request"),
    (re.compile(r"\b(not\s+sure|doubt|hesitat|think\s+about\s+it|need\s+time|later)\b", re.I), "Timing / decision hesitation"),
    (re.compile(r"\b(quality|warranty|support|after[- ]?sales|reliability)\b", re.I), "Quality / support concern"),
    (re.compile(r"\b(already\s+have|using\s+\w+|locked\s+in|contract)\b", re.I), "Existing vendor / lock-in"),
]

# Always-flag marketplace / platform rivals
COMPETITOR_PLATFORMS = [
    "indiamart", "justdial", "amazon business", "magicbricks", "99acres",
    "competitor", "other vendor", "another company", "rival",
]
# Product brands — only count when client cites them competitively
COMPETITOR_BRANDS = [
    "ultratech", "ambuja", "acc", "tata steel", "jsw", "sail", "asian paints",
    "berger", "kajaria", "somany", "havells", "polycab", "l&t", "shapoorji",
    "dlf", "godrej", "tata projects", "nbcc", "brigade", "sobha", "prestige",
]

BUYING_SIGNALS = re.compile(
    r"\b(let'?s\s+proceed|go\s+ahead|sign|close|deal|purchase|buy|order|po\b|"
    r"kick\s*off|start\s+next\s+week|send\s+(the\s+)?(quote|proposal|contract|invoice)|"
    r"agree|approved|confirm|book\s+it|ready\s+to\s+move)\b",
    re.I,
)

DECISION_PATTERNS = re.compile(
    r"\b(we\s+(?:will|can|agreed?|decided)|let'?s\s+\w+|confirmed|approved|"
    r"going\s+with|finalize|finalise|next\s+step|action\s+item)\b",
    re.I,
)

ACTION_PATTERNS = re.compile(
    r"(?:i(?:'| wi)?ll|we(?:'| wi)?ll|please|need\s+to|should|must)\s+"
    r"([^.!?\n]{8,120})",
    re.I,
)

DATE_HINT = re.compile(
    r"\b(by\s+)?("
    r"monday|tuesday|wednesday|thursday|friday|saturday|sunday|"
    r"tomorrow|next\s+week|end\s+of\s+(?:this\s+)?week|"
    r"\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?"
    r")\b",
    re.I,
)

FEATURE_CHECKLIST = [
    ("pricing", re.compile(r"\b(price|pricing|rate|cost|quote|quotation|₹|rs\.?|inr)\b", re.I)),
    ("discount / offer", re.compile(r"\b(discount|offer|promo|incentive|rebate)\b", re.I)),
    ("warranty / SLA", re.compile(r"\b(warranty|guarantee|sla|uptime|support\s+hours)\b", re.I)),
    ("ROI / payback", re.compile(r"\b(roi|payback|savings|return\s+on)\b", re.I)),
    ("case study / proof", re.compile(r"\b(case\s+study|reference|testimonial|proof|demo)\b", re.I)),
    ("timeline / delivery", re.compile(r"\b(timeline|delivery|lead\s+time|schedule|deadline)\b", re.I)),
    ("integration / API", re.compile(r"\b(integrat|api|erp|whatsapp|crm)\b", re.I)),
]

SAMPLE_TRANSCRIPT = """Sales Rep: Good morning Mr. Sharma, thanks for joining. How was your weekend?
Client: Weekend was fine, kids were home. Shall we talk about the BOQ platform?
Sales Rep: Absolutely. 2click.in Super Mart gives brand-wise rates for cement, steel, tiles — UltraTech, TATA, Kajaria — and one-click BOQ templates for a 3BHK villa.
Client: We already use IndiaMART for vendors. Your rates look higher than UltraTech dealer quotes we get offline.
Sales Rep: Offline dealers miss GST-compliant invoices and project-wise BOQ tracking. Contractors on our platform cut procurement time by about 30%.
Client: Interesting, but the subscription feels costly for three sites. Can you reduce the price or give a discount for annual billing?
Sales Rep: I can check an annual Business plan. Shall we schedule a pilot on one site next week?
Client: Yes, let's proceed with a pilot on the Pune site. Please send the proposal by Friday and include warranty and support SLA. Also share ROI numbers versus IndiaMART.
Sales Rep: Confirmed. I'll send the proposal by Friday with SLA, ROI comparison, and annual pricing. We'll kick off the pilot next week after your approval.
Client: Good. If the pilot works we can roll out to all three sites.
"""

MOM_JSON_SCHEMA_HINT = """
Return ONLY valid JSON matching this schema (no markdown):
{
  "mom": {
    "meeting_title": "String",
    "executive_summary": "String (2-3 sentences)",
    "key_discussion_points": ["String"],
    "decisions_made": ["String"],
    "client_objections": ["String"],
    "missed_pitch_gaps": ["String"]
  },
  "sales_intelligence": {
    "client_engagement_level": "High / Medium / Low",
    "lead_status": "Hot / Warm / Cold",
    "conversion_probability_percentage": 0-100,
    "competitors_mentioned": ["String"],
    "coaching_tips_for_rep": "String"
  },
  "action_plan": [
    {
      "task": "String",
      "owner": "Sales Rep / Client / Manager",
      "deadline_date": "YYYY-MM-DD",
      "reminder_time": "HH:MM"
    }
  ],
  "whatsapp_template_message": "String"
}
Rules: Ignore personal chatter. Do not invent facts not in the transcript.
"""


def init(db, get_current_user):
    global _db, _get_current_user
    _db = db
    _get_current_user = get_current_user


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def iso(dt: datetime) -> str:
    return dt.isoformat()


def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


# ---------------------------------------------------------------------------
# Transcript helpers
# ---------------------------------------------------------------------------
def _split_turns(transcript: str) -> List[Tuple[str, str]]:
    turns: List[Tuple[str, str]] = []
    for raw in re.split(r"\n+", transcript.strip()):
        line = raw.strip()
        if not line:
            continue
        m = re.match(
            r"^(sales\s*rep|rep|seller|ae|account\s*executive|client|customer|prospect|buyer)\s*[:\-–]\s*(.+)$",
            line,
            re.I,
        )
        if m:
            role = m.group(1).lower()
            text = m.group(2).strip()
            speaker = "client" if any(k in role for k in ("client", "customer", "prospect", "buyer")) else "rep"
            turns.append((speaker, text))
        else:
            turns.append(("unknown", line))
    return turns


def _is_personal(text: str) -> bool:
    if PERSONAL_NOISE.search(text) and not BUYING_SIGNALS.search(text) and not DECISION_PATTERNS.search(text):
        # Keep if it also has clear business nouns
        if re.search(r"\b(price|quote|project|boq|tender|order|contract|pilot|sla|roi|vendor)\b", text, re.I):
            return False
        return True
    return False


def _business_turns(turns: List[Tuple[str, str]]) -> List[Tuple[str, str]]:
    return [(s, t) for s, t in turns if not _is_personal(t)]


def _next_weekday(from_dt: datetime, weekday: int) -> datetime:
    """weekday: Mon=0 … Sun=6"""
    days = (weekday - from_dt.weekday() + 7) % 7
    if days == 0:
        days = 7
    return from_dt + timedelta(days=days)


def _resolve_deadline(text: str, base: Optional[datetime] = None) -> str:
    base = base or now_utc()
    m = DATE_HINT.search(text or "")
    if not m:
        return (base + timedelta(days=3)).strftime("%Y-%m-%d")
    token = m.group(2).lower().strip()
    weekdays = {
        "monday": 0, "tuesday": 1, "wednesday": 2, "thursday": 3,
        "friday": 4, "saturday": 5, "sunday": 6,
    }
    if token in weekdays:
        return _next_weekday(base, weekdays[token]).strftime("%Y-%m-%d")
    if token == "tomorrow":
        return (base + timedelta(days=1)).strftime("%Y-%m-%d")
    if "next week" in token:
        return (base + timedelta(days=7)).strftime("%Y-%m-%d")
    if "end of" in token:
        # upcoming Friday
        return _next_weekday(base, 4).strftime("%Y-%m-%d")
    dm = re.match(r"(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?", token)
    if dm:
        d, mo = int(dm.group(1)), int(dm.group(2))
        y = int(dm.group(3) or base.year)
        if y < 100:
            y += 2000
        try:
            return datetime(y, mo, d, tzinfo=timezone.utc).strftime("%Y-%m-%d")
        except ValueError:
            pass
    return (base + timedelta(days=3)).strftime("%Y-%m-%d")


def _owner_from_text(text: str, speaker: str) -> str:
    low = text.lower()
    if "manager" in low or "my boss" in low or "leadership" in low:
        return "Manager"
    # Imperative to the other party
    if speaker == "client" and re.search(r"\b(please|kindly|can you|could you|send|share|provide)\b", low):
        return "Sales Rep"
    if speaker == "rep" and re.search(r"\b(please|kindly)\b", low) and re.search(r"\b(you|your)\b", low):
        return "Client"
    if re.search(r"\bi(?:'| wi)?ll\b", low):
        return "Client" if speaker == "client" else "Sales Rep"
    if speaker == "client":
        return "Client"
    return "Sales Rep"


# ---------------------------------------------------------------------------
# Deterministic analyzer (demo-safe, no LLM required)
# ---------------------------------------------------------------------------
def analyze_transcript_heuristic(transcript: str, meeting_date: Optional[str] = None) -> Dict[str, Any]:
    text = (transcript or "").strip()
    if len(text) < 20:
        raise ValueError("Transcript too short — paste the full Sales Rep / Client conversation.")

    base = now_utc()
    if meeting_date:
        try:
            base = datetime.strptime(meeting_date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        except ValueError:
            pass

    turns = _split_turns(text)
    biz = _business_turns(turns) if turns else [("unknown", line) for line in text.splitlines() if line.strip()]
    client_lines = [t for s, t in biz if s == "client"]
    rep_lines = [t for s, t in biz if s == "rep"]
    all_biz = " ".join(t for _, t in biz)

    # Discussion points — non-personal business sentences
    points: List[str] = []
    for speaker, line in biz:
        if len(line) < 25:
            continue
        clean = re.sub(r"\s+", " ", line).strip()
        label = "Client" if speaker == "client" else ("Rep" if speaker == "rep" else "Note")
        points.append(f"{label}: {clean}")
    points = points[:8] or ["Business discussion captured from transcript."]

    # Decisions
    decisions: List[str] = []
    for speaker, line in biz:
        if DECISION_PATTERNS.search(line) or BUYING_SIGNALS.search(line):
            decisions.append(re.sub(r"\s+", " ", line).strip())
    # de-dupe preserve order
    seen = set()
    decisions = [d for d in decisions if not (d.lower() in seen or seen.add(d.lower()))][:6]

    # Objections (prefer client lines)
    objections: List[str] = []
    for line in client_lines or [t for _, t in biz]:
        for pat, label in OBJECTION_PATTERNS:
            if pat.search(line):
                snippet = re.sub(r"\s+", " ", line).strip()
                entry = f"{label}: {snippet}"
                if entry not in objections:
                    objections.append(entry)
    objections = objections[:6]

    # Competitors
    competitors: List[str] = []
    low_all = all_biz.lower()
    client_blob = " ".join(client_lines).lower()
    for name in COMPETITOR_PLATFORMS:
        if name in low_all:
            pretty = "IndiaMART" if name == "indiamart" else name.title()
            if pretty.lower() not in {c.lower() for c in competitors}:
                competitors.append(pretty)
    for name in COMPETITOR_BRANDS:
        # Brands only if client mentions them (usually as alternate quote/source)
        if name in client_blob:
            pretty = name.title()
            if pretty.lower() not in {c.lower() for c in competitors}:
                competitors.append(pretty)
    # "vs X" / "compared to X"
    for m in re.finditer(
        r"(?:vs\.?|versus|compared to|instead of)\s+([A-Za-z][\w&-]*(?:\s+[A-Za-z][\w&-]*){0,2})",
        all_biz,
        re.I,
    ):
        name = re.sub(r"[^\w&.\s-]+$", "", m.group(1).strip())
        if len(name) < 2:
            continue
        if name.lower() in {"i", "we", "you", "the", "a", "an"}:
            continue
        if name.lower() not in {c.lower() for c in competitors}:
            competitors.append(name)

    # Missed pitch gaps — checklist features not mentioned by rep
    rep_blob = " ".join(rep_lines) or all_biz
    gaps: List[str] = []
    for label, pat in FEATURE_CHECKLIST:
        if not pat.search(rep_blob):
            # Only flag if client showed related concern or topic is generally expected
            gaps.append(f"Rep did not clearly cover {label}")
    # If client asked something and rep never answered with keywords
    for line in client_lines:
        if re.search(r"\b(roi|sla|warranty|discount|annual)\b", line, re.I):
            key = re.search(r"\b(roi|sla|warranty|discount|annual)\b", line, re.I).group(1).lower()
            if key not in rep_blob.lower():
                gaps.append(f"Client asked about {key.upper()} but rep did not address it in-call")
    gaps = list(dict.fromkeys(gaps))[:6]

    # Engagement / lead scoring
    client_words = len(" ".join(client_lines).split())
    questions = sum(1 for l in client_lines if "?" in l)
    buy_hits = len(BUYING_SIGNALS.findall(all_biz))
    obj_count = len(objections)

    engagement = "Low"
    if client_words >= 40 or questions >= 2 or buy_hits >= 1:
        engagement = "Medium"
    if client_words >= 80 or (questions >= 3 and buy_hits >= 1) or buy_hits >= 2:
        engagement = "High"

    lead = "Cold"
    prob = 25
    if engagement == "Medium":
        lead, prob = "Warm", 55
    if engagement == "High" or buy_hits >= 2 or any(re.search(r"pilot|proceed|kick\s*off|approve", d, re.I) for d in decisions):
        lead, prob = "Hot", 78
    if obj_count >= 3 and buy_hits == 0:
        lead, prob = "Cold", min(prob, 30)
    if obj_count and lead == "Hot":
        prob = max(60, prob - 8)
    if buy_hits and not objections:
        prob = min(92, prob + 8)
    conversion = int(max(5, min(95, prob)))

    # Action plan
    actions: List[Dict[str, str]] = []
    for speaker, line in biz:
        for m in ACTION_PATTERNS.finditer(line):
            task = m.group(0).strip().rstrip(".")
            task = re.sub(r"\s+", " ", task)
            if len(task) < 12:
                continue
            actions.append({
                "task": task[0].upper() + task[1:],
                "owner": _owner_from_text(line, speaker),
                "deadline_date": _resolve_deadline(line, base),
                "reminder_time": "10:00",
            })
    # Always ensure at least one follow-up if decisions exist
    if not actions and decisions:
        actions.append({
            "task": "Send written follow-up summarizing decisions and next steps",
            "owner": "Sales Rep",
            "deadline_date": (base + timedelta(days=1)).strftime("%Y-%m-%d"),
            "reminder_time": "10:00",
        })
    # de-dupe by task lower
    seen_t = set()
    uniq_actions = []
    for a in actions:
        k = a["task"].lower()
        if k in seen_t:
            continue
        seen_t.add(k)
        uniq_actions.append(a)
    actions = uniq_actions[:6]

    title = "Sales discovery call"
    if re.search(r"\bpilot\b", all_biz, re.I):
        title = "Pilot scoping & commercial discussion"
    elif re.search(r"\b(proposal|quote|quotation|pricing)\b", all_biz, re.I):
        title = "Proposal & pricing review"
    elif re.search(r"\b(demo|walkthrough|product)\b", all_biz, re.I):
        title = "Product demo & requirements review"
    elif competitors:
        title = f"Competitive evaluation vs {competitors[0]}"

    summary_bits = []
    if decisions:
        summary_bits.append(f"Parties aligned on: {decisions[0][:120]}.")
    else:
        summary_bits.append("Discussion covered product fit and commercial considerations.")
    if objections:
        summary_bits.append(f"Client raised {len(objections)} objection(s) that need follow-up.")
    if actions:
        summary_bits.append(f"Next step owned by {actions[0]['owner']}: {actions[0]['task'][:100]}.")
    executive = " ".join(summary_bits)[:500]

    coaching = (
        "Acknowledge each objection before pitching value, then quantify ROI with a concrete number. "
        "Close the call by restating owners, deadlines, and the exact deliverable you will send."
    )
    if gaps:
        coaching = (
            f"Address the gap on '{gaps[0]}' in your next touch — bring proof (SLA, ROI, or case study). "
            "Confirm the decision criteria and timeline before ending the call."
        )

    wa_lines = [
        "Hello — thank you for your time on our call.",
        f"Summary: {executive[:180]}",
    ]
    if decisions:
        wa_lines.append(f"Agreed: {decisions[0][:140]}")
    if actions:
        a0 = actions[0]
        wa_lines.append(f"Next step ({a0['owner']} by {a0['deadline_date']}): {a0['task'][:120]}")
    wa_lines.append("Happy to adjust anything — just reply here.")
    whatsapp = "\n".join(wa_lines)

    return {
        "mom": {
            "meeting_title": title,
            "executive_summary": executive,
            "key_discussion_points": points,
            "decisions_made": decisions or ["No explicit decision recorded in transcript."],
            "client_objections": objections,
            "missed_pitch_gaps": gaps,
        },
        "sales_intelligence": {
            "client_engagement_level": engagement,
            "lead_status": lead,
            "conversion_probability_percentage": conversion,
            "competitors_mentioned": competitors,
            "coaching_tips_for_rep": coaching,
        },
        "action_plan": actions,
        "whatsapp_template_message": whatsapp,
    }


def _validate_payload(data: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize / coerce LLM or heuristic output into the exact schema."""
    mom = data.get("mom") or {}
    si = data.get("sales_intelligence") or {}
    actions = data.get("action_plan") or []

    def _str_list(v, fallback=None):
        if not isinstance(v, list):
            return list(fallback or [])
        out = []
        for x in v:
            if x is None:
                continue
            s = str(x).strip()
            if s:
                out.append(s)
        return out

    eng = str(si.get("client_engagement_level") or "Medium").strip().title()
    if eng not in ("High", "Medium", "Low"):
        eng = "Medium"
    lead = str(si.get("lead_status") or "Warm").strip().title()
    if lead not in ("Hot", "Warm", "Cold"):
        lead = "Warm"
    try:
        conv = int(float(si.get("conversion_probability_percentage", 50)))
    except (TypeError, ValueError):
        conv = 50
    conv = max(0, min(100, conv))

    norm_actions = []
    for a in actions if isinstance(actions, list) else []:
        if not isinstance(a, dict):
            continue
        owner = str(a.get("owner") or "Sales Rep").strip()
        if owner not in ("Sales Rep", "Client", "Manager"):
            owner = "Sales Rep"
        deadline = str(a.get("deadline_date") or "").strip()
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", deadline):
            deadline = (now_utc() + timedelta(days=3)).strftime("%Y-%m-%d")
        reminder = str(a.get("reminder_time") or "10:00").strip()
        if not re.match(r"^\d{2}:\d{2}$", reminder):
            reminder = "10:00"
        task = str(a.get("task") or "").strip()
        if not task:
            continue
        norm_actions.append({
            "task": task,
            "owner": owner,
            "deadline_date": deadline,
            "reminder_time": reminder,
        })

    return {
        "mom": {
            "meeting_title": str(mom.get("meeting_title") or "Sales meeting").strip()[:160],
            "executive_summary": str(mom.get("executive_summary") or "").strip()[:800],
            "key_discussion_points": _str_list(mom.get("key_discussion_points")),
            "decisions_made": _str_list(mom.get("decisions_made")),
            "client_objections": _str_list(mom.get("client_objections")),
            "missed_pitch_gaps": _str_list(mom.get("missed_pitch_gaps")),
        },
        "sales_intelligence": {
            "client_engagement_level": eng,
            "lead_status": lead,
            "conversion_probability_percentage": conv,
            "competitors_mentioned": _str_list(si.get("competitors_mentioned")),
            "coaching_tips_for_rep": str(si.get("coaching_tips_for_rep") or "").strip()[:600],
        },
        "action_plan": norm_actions,
        "whatsapp_template_message": str(data.get("whatsapp_template_message") or "").strip()[:2000],
    }


async def analyze_with_llm(transcript: str, meeting_date: Optional[str] = None) -> Optional[Dict[str, Any]]:
    if not EMERGENT_LLM_KEY:
        return None
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        session_id = new_id("mom")
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=(
                "You are an expert AI Sales Intelligence & Minutes of Meeting generator. "
                "Ignore personal chatter. Never invent facts. "
                + MOM_JSON_SCHEMA_HINT
            ),
        )
        if hasattr(chat, "with_model"):
            try:
                chat = chat.with_model(AI_PROVIDER, AI_MODEL)
            except Exception:
                pass
        prompt = (
            f"Meeting date (for deadlines): {meeting_date or now_utc().strftime('%Y-%m-%d')}\n\n"
            f"Transcript:\n{transcript}\n\n"
            "Produce the JSON now."
        )
        result = await chat.send_message(UserMessage(text=prompt))
        raw = result if isinstance(result, str) else str(result)
        raw = raw.strip()
        if raw.startswith("```"):
            raw = re.sub(r"^```(?:json)?\s*", "", raw)
            raw = re.sub(r"\s*```$", "", raw)
        data = json.loads(raw)
        return _validate_payload(data)
    except Exception:
        return None


async def generate_mom(transcript: str, meeting_date: Optional[str] = None, use_llm: bool = True) -> Dict[str, Any]:
    heuristic = _validate_payload(analyze_transcript_heuristic(transcript, meeting_date))
    if use_llm:
        llm = await analyze_with_llm(transcript, meeting_date)
        if llm:
            llm["_meta"] = {"engine": "llm", "demo": False}
            return llm
    heuristic["_meta"] = {"engine": "heuristic", "demo": not bool(EMERGENT_LLM_KEY)}
    return heuristic


# ---------------------------------------------------------------------------
# API models
# ---------------------------------------------------------------------------
class AnalyzeIn(BaseModel):
    transcript: str = Field(..., min_length=20, max_length=100_000)
    meeting_date: Optional[str] = Field(None, description="YYYY-MM-DD for deadline anchoring")
    client_name: Optional[str] = None
    rep_name: Optional[str] = None
    save: bool = True
    use_llm: bool = True


class AnalyzeOut(BaseModel):
    id: Optional[str] = None
    mom: Dict[str, Any]
    sales_intelligence: Dict[str, Any]
    action_plan: List[Dict[str, Any]]
    whatsapp_template_message: str
    meta: Dict[str, Any] = {}


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@router.get("/sample")
async def get_sample():
    """Return a sample Sales Rep / Client transcript for demos."""
    return {
        "transcript": SAMPLE_TRANSCRIPT.strip(),
        "meeting_date": now_utc().strftime("%Y-%m-%d"),
        "client_name": "Mr. Sharma",
        "rep_name": "Sales Rep",
    }


@router.post("/analyze")
async def analyze(body: AnalyzeIn):
    try:
        result = await generate_mom(body.transcript, body.meeting_date, use_llm=body.use_llm)
    except ValueError as e:
        raise HTTPException(400, str(e)) from e

    meta = result.pop("_meta", {})
    doc_id = None
    if body.save and _db is not None:
        doc_id = new_id("mom")
        doc = {
            "id": doc_id,
            "client_name": (body.client_name or "").strip() or None,
            "rep_name": (body.rep_name or "").strip() or None,
            "meeting_date": body.meeting_date or now_utc().strftime("%Y-%m-%d"),
            "transcript_preview": body.transcript.strip()[:400],
            "result": {
                "mom": result["mom"],
                "sales_intelligence": result["sales_intelligence"],
                "action_plan": result["action_plan"],
                "whatsapp_template_message": result["whatsapp_template_message"],
            },
            "meta": meta,
            "created_at": iso(now_utc()),
        }
        await _db.sales_mom_analyses.insert_one(doc)

    return {
        "id": doc_id,
        "mom": result["mom"],
        "sales_intelligence": result["sales_intelligence"],
        "action_plan": result["action_plan"],
        "whatsapp_template_message": result["whatsapp_template_message"],
        "meta": meta,
    }


@router.get("/history")
async def history(limit: int = 20):
    """Recent MoM analyses (newest first). Public read of saved summaries — no full transcript."""
    if _db is None:
        return {"items": []}
    limit = max(1, min(100, int(limit or 20)))
    cur = _db.sales_mom_analyses.find(
        {},
        {
            "_id": 0,
            "transcript_preview": 1,
            "id": 1,
            "client_name": 1,
            "rep_name": 1,
            "meeting_date": 1,
            "result.mom.meeting_title": 1,
            "result.sales_intelligence.lead_status": 1,
            "result.sales_intelligence.conversion_probability_percentage": 1,
            "created_at": 1,
        },
    ).sort("created_at", -1).limit(limit)
    items = await cur.to_list(limit)
    return {"items": items}


@router.get("/{analysis_id}")
async def get_analysis(analysis_id: str):
    if _db is None:
        raise HTTPException(503, "Database not ready")
    doc = await _db.sales_mom_analyses.find_one({"id": analysis_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Analysis not found")
    return doc
