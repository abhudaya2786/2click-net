"""
Platform estimate API — material coefficients, brand tier mapping.
"""
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/platform", tags=["platform"])

COEFFICIENTS = {
    "residential": {"steel": 3.8, "cement": 0.4, "sand": 1.8, "aggregate": 1.35, "bricks": 18, "aac": 1.2, "tiles": 1.3, "paint": 0.15},
    "commercial": {"steel": 4.5, "cement": 0.45, "sand": 2.0, "aggregate": 1.5, "bricks": 14, "aac": 1.5, "tiles": 1.4, "paint": 0.12},
    "industrial": {"steel": 5.0, "cement": 0.5, "sand": 2.2, "aggregate": 1.6, "bricks": 12, "aac": 1.8, "tiles": 1.0, "paint": 0.1},
    "renovation": {"steel": 2.5, "cement": 0.25, "sand": 1.2, "aggregate": 1.0, "bricks": 8, "aac": 0.8, "tiles": 1.5, "paint": 0.2},
    "interior": {"steel": 0.5, "cement": 0.1, "sand": 0.5, "aggregate": 0.3, "bricks": 2, "aac": 0.5, "tiles": 2.0, "paint": 0.25},
    "solar": {"steel": 1.0, "cement": 0.15, "sand": 0.4, "aggregate": 0.3, "bricks": 0, "aac": 0, "tiles": 0.5, "paint": 0.05},
    "villa": {"steel": 4.0, "cement": 0.42, "sand": 1.9, "aggregate": 1.4, "bricks": 16, "aac": 1.3, "tiles": 1.5, "paint": 0.18},
}

TIER_RATES = {"basic": 1400, "standard": 1700, "premium": 2200, "low": 1400, "luxury": 2200}

BRAND_TIERS = {
    "basic": {"cement": ["ACC", "Ambuja"], "steel": ["JSW Neosteel", "SAIL"], "tiles": ["Somany"], "paint": ["Berger"]},
    "standard": {"cement": ["UltraTech", "Ambuja", "ACC"], "steel": ["Tata Tiscon", "JSW Neosteel"], "tiles": ["Kajaria", "Somany"], "paint": ["Asian Paints Apex", "Berger"]},
    "premium": {"cement": ["UltraTech Premium", "Ambuja Plus"], "steel": ["Tata Tiscon SD", "JSW Neosteel"], "tiles": ["Kajaria Premium"], "paint": ["Asian Paints Royale", "Dulux"]},
}
BRAND_TIERS["luxury"] = BRAND_TIERS["premium"]


class EstimateIn(BaseModel):
    built_up_sqft: float = Field(..., gt=0)
    project_type: str = "residential"
    quality_tier: str = "standard"
    use_aac: bool = False


@router.get("/meta")
async def platform_meta():
    return {
        "nav_mapping": [
            {"nav": "Estimate", "path": "/estimate", "engine": "material_calculator"},
            {"nav": "Design", "path": "/design", "engine": "ai_3d_studio"},
            {"nav": "Build", "path": "/build", "engine": "two_click_wizard"},
            {"nav": "AI", "path": "/design", "engine": "prompt_generator"},
            {"nav": "Explore", "path": "/store", "engine": "brand_recommendations"},
        ],
        "personas": ["individual", "company", "contractor", "investor"],
        "quality_tiers": list(TIER_RATES.keys()),
        "project_types": list(COEFFICIENTS.keys()),
        "zoning": {"living": 40, "bedroom": 25, "kitchen": 20, "utility": 15},
        "lighting": {"key": 100, "fill": 50, "back": 30},
        "fov_range": [60, 75],
    }


@router.post("/material-estimate")
async def material_estimate(body: EstimateIn):
    coeff = COEFFICIENTS.get(body.project_type, COEFFICIENTS["residential"])
    tier_key = body.quality_tier if body.quality_tier in TIER_RATES else "standard"
    rate = TIER_RATES.get(tier_key, 1700)
    brand_key = "basic" if tier_key in ("basic", "low") else "premium" if tier_key in ("premium", "luxury") else "standard"
    A = body.built_up_sqft

    materials = {
        "cement_bags": round(A * coeff["cement"]),
        "steel_kg": round(A * coeff["steel"]),
        "sand_cu_ft": round(A * coeff["sand"]),
        "aggregate_cu_ft": round(A * coeff["aggregate"]),
        "bricks": round(A * coeff["bricks"]) if not body.use_aac else None,
        "aac_blocks": round(A * coeff["aac"]) if body.use_aac else None,
        "tiles_sqft": round(A * coeff["tiles"]),
        "paint_liters": round(A * coeff["paint"]),
    }

    return {
        "ok": True,
        "built_up_sqft": A,
        "project_type": body.project_type,
        "quality_tier": tier_key,
        "rate_per_sqft": rate,
        "total_cost": round(A * rate),
        "materials": materials,
        "coefficients": coeff,
        "brands": BRAND_TIERS.get(brand_key, BRAND_TIERS["standard"]),
    }
