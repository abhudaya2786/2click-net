"""
buildecogroup.com — AI project planner: 2-click estimate, journey meta, plan generation.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/project-planner", tags=["project-planner"])

_db = None
_get_user = None

JOURNEY_STAGES = [
    {"id": "land", "label": "Land", "label_hi": "ज़मीन", "order": 1},
    {"id": "survey", "label": "Survey", "label_hi": "सर्वे", "order": 2},
    {"id": "design", "label": "Design", "label_hi": "डिज़ाइन", "order": 3},
    {"id": "estimate", "label": "Estimate", "label_hi": "अनुमान", "order": 4},
    {"id": "approval", "label": "Approval", "label_hi": "अनुमोदन", "order": 5},
    {"id": "foundation", "label": "Foundation", "label_hi": "फाउंडेशन", "order": 6},
    {"id": "structure", "label": "Structure", "label_hi": "संरचना", "order": 7},
    {"id": "brickwork", "label": "Brickwork", "label_hi": "ईंट का काम", "order": 8},
    {"id": "mep", "label": "Electrical / Plumbing", "label_hi": "बिजली / प्लंबिंग", "order": 9},
    {"id": "flooring", "label": "Flooring", "label_hi": "फ़र्श", "order": 10},
    {"id": "interior", "label": "Interior", "label_hi": "इंटीरियर", "order": 11},
    {"id": "solar", "label": "Solar", "label_hi": "सोलर", "order": 12},
    {"id": "inspection", "label": "Inspection", "label_hi": "निरीक्षण", "order": 13},
    {"id": "handover", "label": "Handover", "label_hi": "हैंडओवर", "order": 14},
]

QUALITY_MULT = {"low": 0.82, "standard": 1.0, "premium": 1.28, "luxury": 1.58}
BASE_RATE_PER_SQFT = 1850  # INR blended construction


class EstimateIn(BaseModel):
    project_type: str = "residential"
    state: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    plot_area_sqft: float = Field(0, ge=0)
    built_up_sqft: float = Field(0, ge=0)
    floors: int = Field(1, ge=1, le=20)
    bhk: int = Field(0, ge=0, le=10)
    budget: float = Field(0, ge=0)
    quality: str = "standard"
    structure_type: str = "rcc"
    interior_level: str = "basic"
    solar_required: bool = False
    monthly_bill: float = Field(0, ge=0)


def init(db, get_current_user=None):
    global _db, _get_user
    _db = db
    _get_user = get_current_user


def now_utc():
    return datetime.now(timezone.utc)


def iso(dt):
    return dt.isoformat() if isinstance(dt, datetime) else dt


def _compute_estimate(body: EstimateIn) -> Dict:
    bua = body.built_up_sqft or max(body.plot_area_sqft * 0.55, 800)
    q = QUALITY_MULT.get(body.quality, 1.0)
    floor_mult = 1 + (body.floors - 1) * 0.08
    struct_mult = 1.12 if body.structure_type == "steel" else 1.0
    interior_mult = {"basic": 1.0, "modular": 1.15, "premium": 1.35, "luxury": 1.6}.get(body.interior_level, 1.0)

    civil_core = bua * BASE_RATE_PER_SQFT * q * floor_mult * struct_mult
    breakdown = {
        "civil": round(civil_core * 0.38),
        "electrical": round(civil_core * 0.09),
        "plumbing": round(civil_core * 0.07),
        "flooring": round(civil_core * 0.08),
        "doors_windows": round(civil_core * 0.06),
        "paint": round(civil_core * 0.05),
        "kitchen": round(civil_core * 0.04 * interior_mult),
        "bathroom": round(civil_core * 0.05 * interior_mult),
        "interior": round(civil_core * 0.12 * interior_mult),
        "labour": round(civil_core * 0.14),
        "miscellaneous": round(civil_core * 0.04),
    }
    solar_cost = 0
    solar_kw = 0
    solar_savings = 0
    if body.solar_required or body.monthly_bill > 0:
        solar_kw = max(1, round((body.monthly_bill or 3000) / 1200, 1))
        solar_cost = int(solar_kw * 65000)
        solar_savings = int(body.monthly_bill * 12 * 0.85) if body.monthly_bill else int(solar_kw * 12000)
    breakdown["solar"] = solar_cost

    total = sum(breakdown.values())
    duration_months = max(6, int(bua / 450) + body.floors * 2)

    tiers = {}
    for tier, mult in QUALITY_MULT.items():
        tiers[tier] = round(total * (mult / q))

    journey = []
    stage_cost = total / len(JOURNEY_STAGES)
    for i, st in enumerate(JOURNEY_STAGES):
        pct = round((i + 1) / len(JOURNEY_STAGES) * 100)
        journey.append({
            **st,
            "status": "pending" if i > 0 else "active",
            "progress_pct": pct if i == 0 else max(0, pct - 8),
            "estimated_cost": round(stage_cost),
            "next_action": "Start survey" if st["id"] == "land" else "Schedule milestone",
        })

    return {
        "built_up_sqft": bua,
        "breakdown": breakdown,
        "total_estimated_cost": total,
        "quality_tiers": tiers,
        "duration_months": duration_months,
        "solar_kw": solar_kw,
        "solar_annual_savings_inr": solar_savings,
        "solar_payback_years": round(solar_cost / max(solar_savings, 1), 1) if solar_cost else 0,
        "recommended_package": body.quality if body.quality in QUALITY_MULT else "standard",
        "journey": journey,
        "boq_hint": f"Approx {int(bua * 0.12)} bags cement, {int(bua * 2.5)} kg steel (indicative)",
        "labour_hint": f"~{int(bua / 120)} skilled days (indicative)",
    }


@router.get("/meta")
async def planner_meta():
    return {
        "journey_stages": JOURNEY_STAGES,
        "quality_tiers": list(QUALITY_MULT.keys()),
        "project_types": ["residential", "commercial", "industrial", "renovation", "interior", "solar"],
    }


@router.post("/estimate")
async def estimate_project(body: EstimateIn):
    if body.quality not in QUALITY_MULT:
        raise HTTPException(400, "quality must be low|standard|premium|luxury")
    return {"ok": True, "input": body.model_dump(), "result": _compute_estimate(body)}


@router.post("/plan")
async def generate_plan(body: EstimateIn):
    result = _compute_estimate(body)
    plan_id = f"plan_{uuid.uuid4().hex[:12]}"
    doc = {
        "id": plan_id,
        "input": body.model_dump(),
        "result": result,
        "created_at": iso(now_utc()),
    }
    if _db is not None:
        await _db.project_plans.insert_one(doc)
    return {"ok": True, "plan_id": plan_id, **result}


async def ensure_indexes():
    if _db is not None:
        await _db.project_plans.create_index("user_id")
        await _db.project_plans.create_index("created_at")
