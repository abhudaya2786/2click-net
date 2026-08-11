"""
2click.in — AI 3D Home Studio: 5-phase workflow & prompt builders.
"""
from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/design-studio", tags=["design-studio"])

LAYOUT_ZONES = [
    {"id": "living", "pct": 40, "label": "AI workstation & living", "label_hi": "AI वर्कस्टेशन व लिविंग"},
    {"id": "bedroom", "pct": 25, "label": "Sleeping nook", "label_hi": "स्लीपिंग नूक"},
    {"id": "kitchen", "pct": 20, "label": "Kitchenette", "label_hi": "किचनेट"},
    {"id": "utility", "pct": 15, "label": "Hidden washroom", "label_hi": "हिडन वॉशरूम"},
]

LIGHTING = {
    "key": {"pct": 100},
    "fill": {"pct": 50},
    "ambient": {"pct": 30},
}

FORMULA = [
    {"id": "blueprint", "en": "2D Blueprint", "hi": "2D ब्लूप्रिंट"},
    {"id": "depth", "en": "Depth Map", "hi": "डेप्थ मैप"},
    {"id": "mesh", "en": "3D Mesh", "hi": "3D मेश"},
    {"id": "materials", "en": "Material Mapping", "hi": "मटेरियल मैपिंग"},
    {"id": "render", "en": "Photorealistic Render", "hi": "फोटोरियलिस्टिक रेंडर"},
]


class LayoutIn(BaseModel):
    built_up_sqft: float = Field(..., gt=0)


class WorkflowIn(BaseModel):
    built_up_sqft: float = Field(400, gt=0)
    style: str = "studio"
    scale: str = "1:50"
    fov: int = Field(68, ge=60, le=75)
    extra: Optional[str] = None
    quality: str = "premium"
    lang: str = "en"


def _zones(sqft: float):
    return [{**z, "sqft": round(sqft * z["pct"] / 100)} for z in LAYOUT_ZONES]


def _zone_text(zones, lang="en"):
    parts = []
    for z in zones:
        label = z["label_hi"] if lang == "hi" else z["label"]
        parts.append(f"{z['pct']}% {label} ({z['sqft']} sqft)")
    return ", ".join(parts)


def _prompt1(sqft, zones, lang):
    zoning = _zone_text(zones, lang)
    return (
        f"Act as an expert architectural prompt engineer. Create a highly detailed, 50-word prompt for an image-generation AI. "
        f"The prompt must describe a modern, minimalist isometric 3D floor plan layout for a compact 3D Home Studio apartment (approx {sqft} sq ft). "
        f"Include specific zoning: {zoning}. "
        f"Specify the materials (warm oak wood flooring, exposed concrete walls, large glass partition) and the lighting (warm 3-point studio lighting, cinematic atmosphere)."
    )


def _prompt2(sqft, style, fov, extra):
    base = (
        f"Photorealistic 3D architectural render of a modern isometric studio apartment layout, open floor plan, warm lighting, "
        f"primary AI workstation corner with ergonomic desk and multiple monitors, separated sleeping nook with glass partition, "
        f"compact L-shaped kitchenette, minimalist furniture, warm oak flooring, exposed concrete walls, "
        f"warm 3-point studio lighting (key 100% fill 50% backlight 30%), camera FOV {fov} degrees, cinematic lighting, "
        f"8k resolution, Unreal Engine 5 render"
    )
    if extra:
        base += f", {extra.strip()}"
    return base + "."


def _prompt3():
    return (
        "Redesign this uploaded room as a modern 3D Home Studio. Keep the walls and windows, but replace all furniture with minimalist aesthetic, "
        "include an ergonomic standing desk, sound-absorbing acoustic panels on the work wall, and a large central coffee table. "
        "Use a warm, diffused lighting setup."
    )


def _prompt4():
    return (
        "Generate a detailed 3D model of a modern, modular ergonomic workstation desk. "
        "It must include an articulated arm holding a large curved monitor, an integrated cable management system, "
        "and a black matte finish with wood accents. Low-poly optimized for rapid rendering."
    )


def _prompt5(quality):
    return (
        f"Photorealistic architectural visualization, interior view of modern 3D Home Studio, focus on the workstation, "
        f"dramatic cinematic lighting, soft warm filling light from the left (fill 50%), sharp accent backlight from the right (key 100%), "
        f"ambient depth light 30%, detailed textures on the oak floor and acoustic panels, {quality} quality tier, "
        f"hyper-realistic, 8k, raytracing."
    )


@router.get("/meta")
async def studio_meta():
    return {
        "formula_pipeline": FORMULA,
        "fov_range": {"min": 60, "max": 75, "default": 68},
        "lighting": LIGHTING,
        "layout_zones": LAYOUT_ZONES,
        "phases": 5,
    }


@router.post("/layout")
async def compute_layout(body: LayoutIn):
    zones = _zones(body.built_up_sqft)
    return {"ok": True, "built_up_sqft": body.built_up_sqft, "zones": zones}


@router.post("/workflow")
async def build_workflow(body: WorkflowIn):
    zones = _zones(body.built_up_sqft)
    workflow = {
        "formula": FORMULA,
        "zones": zones,
        "lighting": LIGHTING,
        "fov": body.fov,
        "scale": body.scale,
        "prompts": {
            "prompt1": _prompt1(body.built_up_sqft, zones, body.lang),
            "prompt2": _prompt2(body.built_up_sqft, body.style, body.fov, body.extra or ""),
            "prompt3": _prompt3(),
            "prompt4": _prompt4(),
            "prompt5": _prompt5(body.quality),
        },
    }
    return {"ok": True, "workflow": workflow}


@router.post("/prompt")
async def build_prompt(body: WorkflowIn):
    zones = _zones(body.built_up_sqft)
    return {
        "ok": True,
        "prompt": _prompt2(body.built_up_sqft, body.style, body.fov, body.extra or ""),
        "zones": zones,
    }
