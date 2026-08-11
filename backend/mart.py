"""
2Click.in — Super Mart: construction material catalog, category-wise + brand-wise
with per-brand editable rates. Public read; Super-Admin managed CRUD. Feeds the
Material Calculator + Contractor BOQ ("add from Super Mart" at the brand rate).
Adds: category images, per-material rate history (price-trend), and 1-click BOQ
templates (e.g. 3BHK Villa) resolved at live cheapest-brand rates.
"""
import uuid
import random
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
import rbac

_db = None


def init(db):
    global _db
    _db = db


def now_utc(): return datetime.now(timezone.utc)
def iso(dt): return dt.isoformat() if isinstance(dt, datetime) else dt
def new_id(p): return f"{p}_{uuid.uuid4().hex[:12]}"

public_router = APIRouter(prefix="/api", tags=["mart-public"])
admin_router = APIRouter(prefix="/api/admin", tags=["mart-admin"])


class MaterialIn(BaseModel):
    category: str
    name: str
    brand: str
    unit: str = "unit"
    rate: float
    hsn: Optional[str] = None
    image: Optional[str] = None
    status: str = "active"


class MaterialUpdate(BaseModel):
    category: Optional[str] = None
    name: Optional[str] = None
    brand: Optional[str] = None
    unit: Optional[str] = None
    rate: Optional[float] = None
    hsn: Optional[str] = None
    image: Optional[str] = None
    status: Optional[str] = None


# category -> representative image (used on Mart cards + calculator)
CATEGORY_IMAGES = {
    "Cement": "https://images.pexels.com/photos/29817952/pexels-photo-29817952.jpeg?auto=compress&cs=tinysrgb&w=800",
    "Steel & TMT": "https://images.unsplash.com/photo-1550041462-7e8602a4c4bc?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    "Bricks & Blocks": "https://images.unsplash.com/photo-1495578942200-c5f5d2137def?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    "Sand & Aggregate": "https://images.unsplash.com/photo-1631948856825-73b6c57b5345?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    "Paint": "https://images.unsplash.com/photo-1643822308521-1da534425d82?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    "Tiles": "https://images.unsplash.com/photo-1647102256335-7a7370d99924?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    "Plumbing": "https://images.pexels.com/photos/12142829/pexels-photo-12142829.jpeg?auto=compress&cs=tinysrgb&w=800",
    "Electrical": "https://images.unsplash.com/photo-1584774354932-62ceb99e6053?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    "Plywood & Wood": "https://images.unsplash.com/photo-1422246654994-34520d5a0340?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    "Waterproofing": "https://images.unsplash.com/photo-1674485169641-bcb2bf6f1df9?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    "Interior Decoration": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800",
    "Vastu": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    "Fabrication": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800",
    "False Ceiling": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800",
    "PVC Work": "https://images.pexels.com/photos/12142829/pexels-photo-12142829.jpeg?auto=compress&cs=tinysrgb&w=800",
    "Renovation": "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800",
    "Gardening": "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800",
}

# Per-product reference photos (category|material name) — clearer than category-only images
PRODUCT_IMAGES = {
    "Interior Decoration|Modular Kitchen Base Unit": "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800",
    "Interior Decoration|Wardrobe Sliding Door": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800",
    "Interior Decoration|TV Unit Panel": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
    "Interior Decoration|Curtains & Blinds": "https://images.unsplash.com/photo-1615529328331-f8917597711f?w=800",
    "Interior Decoration|Wall Wallpaper": "https://images.unsplash.com/photo-1615873968403-b89bfd70dc51?w=800",
    "Vastu|Vastu Consultation (Site Visit)": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    "Vastu|Vastu Report + Layout": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
    "Vastu|Pyramid / Remedy Kit": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800",
    "Fabrication|MS Gate Fabrication": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800",
    "Fabrication|SS Railing": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    "Fabrication|MS Grill Window": "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800",
    "Fabrication|Main Door Frame MS": "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800",
    "Tiles|Vitrified Tile": "https://images.unsplash.com/photo-1647102256335-7a7370d99924?w=800",
    "Tiles|Ceramic Floor Tile": "https://images.unsplash.com/photo-1615873968403-b89bfd70dc51?w=800",
    "Tiles|Wall Tile": "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800",
    "False Ceiling|POP False Ceiling": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800",
    "False Ceiling|Gypsum Board Ceiling": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
    "False Ceiling|PVC Ceiling Panel": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    "False Ceiling|Wooden Ceiling Panel": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800",
    "PVC Work|PVC Door": "https://images.pexels.com/photos/12142829/pexels-photo-12142829.jpeg?auto=compress&cs=tinysrgb&w=800",
    "PVC Work|UPVC Window": "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800",
    "PVC Work|PVC Pipe 2 inch": "https://images.pexels.com/photos/12142829/pexels-photo-12142829.jpeg?auto=compress&cs=tinysrgb&w=800",
    "PVC Work|PVC Casing & Capping": "https://images.pexels.com/photos/12142829/pexels-photo-12142829.jpeg?auto=compress&cs=tinysrgb&w=800",
    "PVC Work|PVC Flooring": "https://images.unsplash.com/photo-1615873968403-b89bfd70dc51?w=800",
    "Renovation|Bathroom Renovation Package": "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800",
    "Renovation|Kitchen Renovation": "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800",
    "Renovation|Wall Demolition": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800",
    "Renovation|Debris Removal": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800",
    "Renovation|Terrace Waterproofing": "https://images.unsplash.com/photo-1674485169641-bcb2bf6f1df9?w=800",
    "Gardening|Landscape Design": "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800",
    "Gardening|Artificial Grass": "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800",
    "Gardening|Drip Irrigation System": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
    "Gardening|Outdoor Plants (mixed)": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
    "Gardening|Garden Lighting LED": "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800",
}


def resolve_material_image(category: str, name: str, existing: Optional[str] = None) -> Optional[str]:
    if existing:
        return existing
    key = f"{category}|{name}"
    return PRODUCT_IMAGES.get(key) or CATEGORY_IMAGES.get(category)

# Interior / finishing verticals for BOQ calculator (column-wise breakdown)
INTERIOR_VERTICALS = [
    {"id": "interior_decoration", "name": "Interior Decoration", "name_hi": "इंटीरियर डेकोरेशन",
     "category": "Interior Decoration", "icon": "sofa",
     "image": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800"},
    {"id": "vastu", "name": "Vastu", "name_hi": "वास्तु",
     "category": "Vastu", "icon": "compass",
     "image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"},
    {"id": "fabrication", "name": "Fabrication", "name_hi": "फैब्रिकेशन",
     "category": "Fabrication", "icon": "wrench",
     "image": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800"},
    {"id": "tiles", "name": "Tiles", "name_hi": "टाइल्स",
     "category": "Tiles", "icon": "grid",
     "image": "https://images.unsplash.com/photo-1647102256335-7a7370d99924?w=800"},
    {"id": "false_ceiling", "name": "False Ceiling", "name_hi": "फॉल्स सीलिंग",
     "category": "False Ceiling", "icon": "layers",
     "image": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800"},
    {"id": "pvc_work", "name": "PVC Work", "name_hi": "PVC वर्क",
     "category": "PVC Work", "icon": "pipe",
     "image": "https://images.pexels.com/photos/12142829/pexels-photo-12142829.jpeg?auto=compress&cs=tinysrgb&w=800"},
    {"id": "renovation", "name": "Renovation", "name_hi": "रेनोवेशन",
     "category": "Renovation", "icon": "hammer",
     "image": "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800"},
    {"id": "gardening", "name": "Gardening", "name_hi": "गार्डनिंग",
     "category": "Gardening", "icon": "leaf",
     "image": "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800"},
]

# Fabrication work types → what can be done + linked material SKUs (category Fabrication)
FABRICATION_WORK_TYPES = [
    {
        "id": "gate_entry", "name": "Main gate & entry", "name_hi": "मुख्य गेट और प्रवेश",
        "desc_en": "MS gate, sliding gate, designer gate, automation",
        "desc_hi": "एमएस गेट, स्लाइडिंग गेट, डिज़ाइनर गेट, ऑटोमेशन",
        "materials": ["MS Gate Fabrication", "MS Sliding Gate", "Designer Fancy Gate", "Gate Automation Motor Kit", "Main Door Frame MS"],
    },
    {
        "id": "railing_balcony", "name": "Railing & balcony", "name_hi": "रेलिंग और बालकनी",
        "desc_en": "SS/MS balcony railing, glass railing with SS",
        "desc_hi": "एसएस/एमएस बालकनी रेलिंग, ग्लास रेलिंग",
        "materials": ["SS Railing", "MS Balcony Railing", "Glass Railing with SS", "SS Staircase Handrail"],
    },
    {
        "id": "window_grill", "name": "Window grill & safety", "name_hi": "विंडो ग्रिल और सुरक्षा",
        "desc_en": "Fixed grill, sliding grill, SS grill, safety door",
        "desc_hi": "फिक्स्ड ग्रिल, स्लाइडिंग ग्रिल, एसएस ग्रिल, सेफ्टी दरवाज़ा",
        "materials": ["MS Grill Window", "SS Window Grill", "MS Safety Door", "Expanded Metal Sheet"],
    },
    {
        "id": "staircase", "name": "Staircase MS/SS", "name_hi": "सीढ़ी एमएस/एसएस",
        "desc_en": "MS staircase structure, railing, handrail",
        "desc_hi": "एमएस सीढ़ी संरचना, रेलिंग, हैंडरेल",
        "materials": ["MS Staircase Structure", "MS Staircase Railing", "SS Staircase Handrail", "SS Railing"],
    },
    {
        "id": "boundary_fence", "name": "Boundary & fencing", "name_hi": "बाउंड्री और फेंसिंग",
        "desc_en": "Boundary wall railing, chain link, barricade",
        "desc_hi": "बाउंड्री वॉल रेलिंग, चेन लिंक, बैरिकेड",
        "materials": ["Boundary Wall MS Railing", "Chain Link Fencing", "MS Gate Fabrication"],
    },
    {
        "id": "structural_ms", "name": "Structural MS work", "name_hi": "स्ट्रक्चरल एमएस वर्क",
        "desc_en": "Angle, channel, beam, truss, columns",
        "desc_hi": "एंगल, चैनल, बीम, ट्रस, कॉलम",
        "materials": ["MS Angle 50x50", "MS Channel 75x40", "MS Flat 25x6", "MS Beam Fabrication", "MS Roof Truss", "GI Sheet 1mm"],
    },
    {
        "id": "roof_shed", "name": "Roof & shed", "name_hi": "छत और शेड",
        "desc_en": "PEB shed, roof truss, polycarbonate roofing",
        "desc_hi": "PEB शेड, रूफ ट्रस, पॉलीकार्बोनेट छत",
        "materials": ["PEB Shed Fabrication", "MS Roof Truss", "Polycarbonate Roofing Sheet", "GI Sheet 1mm"],
    },
    {
        "id": "carport_pergola", "name": "Car porch & pergola", "name_hi": "कार पोर्च और पर्गोला",
        "desc_en": "Car porch MS, pergola, shade structure",
        "desc_hi": "कार पोर्च एमएस, पर्गोला, शेड संरचना",
        "materials": ["Car Porch MS Structure", "Pergola MS Fabrication", "MS Roof Truss"],
    },
    {
        "id": "facade_cladding", "name": "Facade & cladding support", "name_hi": "फेसाड और क्लैडिंग सपोर्ट",
        "desc_en": "ACP fixing frame, aluminium louvers, facade brackets",
        "desc_hi": "ACP फिक्सिंग फ्रेम, एल्युमिनियम लूवर, फेसाड ब्रैकेट",
        "materials": ["ACP Fixing MS Frame", "Aluminium Louver Panel", "MS Facade Bracket System"],
    },
    {
        "id": "industrial", "name": "Industrial / factory", "name_hi": "औद्योगिक / फैक्टरी",
        "desc_en": "Mezzanine, platform, conveyor support",
        "desc_hi": "मेज़ानिन, प्लेटफॉर्म, कन्वेयर सपोर्ट",
        "materials": ["MS Mezzanine Floor", "MS Platform Fabrication", "MS Beam Fabrication", "PEB Shed Fabrication"],
    },
    {
        "id": "stainless_commercial", "name": "Stainless commercial", "name_hi": "स्टेनलेस कॉमर्शियल",
        "desc_en": "SS kitchen counter, sink unit, commercial railing",
        "desc_hi": "एसएस किचन काउंटर, सिंक यूनिट, कॉमर्शियल रेलिंग",
        "materials": ["SS Kitchen Counter", "SS Sink Unit with Stand", "SS Railing", "SS Main Door Frame"],
    },
    {
        "id": "consumables", "name": "Welding & finishing", "name_hi": "वेल्डिंग और फिनिशिंग",
        "desc_en": "Welding rod, primer, enamel paint, polish",
        "desc_hi": "वेल्डिंग रॉड, प्राइमर, एनामेल पेंट, पॉलिश",
        "materials": ["Welding Rod 12mm", "Cutting Disc", "MS Primer Red Oxide", "MS Enamel Paint", "SS Polish Finish"],
    },
]

# Room / trade stores for full-home BOQ builder (select stores → pick items → generate BOQ)
BOQ_SECTIONS = [
    {
        "id": "plumbing", "name": "Plumber Store", "name_hi": "प्लंबर स्टोर",
        "image": CATEGORY_IMAGES.get("Plumbing"),
        "categories": ["Plumbing"],
        "presets": [
            {"category": "Plumbing", "name": "CPVC Pipe", "qty": 80},
            {"category": "Plumbing", "name": "PVC Pipe", "qty": 40},
            {"category": "Plumbing", "name": "Water Tank 1000L", "qty": 1},
        ],
    },
    {
        "id": "electrical", "name": "Electrical, Wire & Switch", "name_hi": "इलेक्ट्रिकल, वायर, स्विच",
        "image": CATEGORY_IMAGES.get("Electrical"),
        "categories": ["Electrical"],
        "presets": [
            {"category": "Electrical", "name": "Wire 2.5 sqmm", "qty": 350},
            {"category": "Electrical", "name": "Wire 1.5 sqmm", "qty": 200},
            {"category": "Electrical", "name": "Modular Switch", "qty": 30},
            {"category": "Electrical", "name": "MCB 32A", "qty": 4},
            {"category": "Electrical", "name": "LED Panel Light 18W", "qty": 12},
        ],
    },
    {
        "id": "paint_putty", "name": "Paint & Putty", "name_hi": "पेंट और पुट्टी",
        "image": CATEGORY_IMAGES.get("Paint"),
        "categories": ["Paint"],
        "presets": [
            {"category": "Paint", "name": "Interior Emulsion", "qty": 80},
            {"category": "Paint", "name": "Wall Putty", "qty": 120},
            {"category": "Paint", "name": "Wall Primer", "qty": 50},
            {"category": "Paint", "name": "Exterior Emulsion", "qty": 40},
        ],
    },
    {
        "id": "pvc_panel", "name": "PVC Panel & Ceiling", "name_hi": "PVC पैनल और सीलिंग",
        "image": CATEGORY_IMAGES.get("False Ceiling"),
        "categories": ["False Ceiling", "PVC Work"],
        "presets": [
            {"category": "False Ceiling", "name": "PVC Ceiling Panel", "qty": 350},
            {"category": "False Ceiling", "name": "Gypsum Board Ceiling", "qty": 200},
            {"category": "PVC Work", "name": "PVC Casing & Capping", "qty": 100},
        ],
    },
    {
        "id": "interior", "name": "Interior & Décor", "name_hi": "इंटीरियर डेकोर",
        "image": CATEGORY_IMAGES.get("Interior Decoration"),
        "categories": ["Interior Decoration", "Plywood & Wood"],
        "presets": [
            {"category": "Interior Decoration", "name": "Curtains & Blinds", "qty": 150},
            {"category": "Interior Decoration", "name": "Wall Wallpaper", "qty": 180},
            {"category": "Plywood & Wood", "name": "Laminate Sheet", "qty": 120},
        ],
    },
    {
        "id": "kitchen", "name": "Kitchen", "name_hi": "किचन",
        "image": "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800",
        "categories": ["Interior Decoration", "Renovation", "Tiles", "Plumbing", "Electrical", "Paint"],
        "presets": [
            {"category": "Interior Decoration", "name": "Modular Kitchen Base Unit", "qty": 70},
            {"category": "Renovation", "name": "Kitchen Renovation", "qty": 1},
            {"category": "Tiles", "name": "Vitrified Tile", "qty": 90},
            {"category": "Plumbing", "name": "CPVC Pipe", "qty": 35},
            {"category": "Electrical", "name": "Modular Switch", "qty": 10},
            {"category": "Paint", "name": "Interior Emulsion", "qty": 25},
        ],
    },
    {
        "id": "bathroom", "name": "Bathroom", "name_hi": "बाथरूम",
        "image": "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800",
        "categories": ["Renovation", "Plumbing", "Tiles", "PVC Work", "Waterproofing"],
        "presets": [
            {"category": "Renovation", "name": "Bathroom Renovation Package", "qty": 1},
            {"category": "Tiles", "name": "Wall Tile", "qty": 120},
            {"category": "Plumbing", "name": "CPVC Pipe", "qty": 25},
            {"category": "PVC Work", "name": "PVC Door", "qty": 1},
            {"category": "Waterproofing", "name": "Waterproofing Coat", "qty": 40},
        ],
    },
    {
        "id": "bedroom", "name": "Bedroom", "name_hi": "बेडरूम",
        "image": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800",
        "categories": ["Interior Decoration", "Paint", "Tiles", "False Ceiling"],
        "presets": [
            {"category": "Interior Decoration", "name": "Wardrobe Sliding Door", "qty": 100},
            {"category": "Interior Decoration", "name": "Curtains & Blinds", "qty": 60},
            {"category": "Tiles", "name": "Vitrified Tile", "qty": 150},
            {"category": "Paint", "name": "Interior Emulsion", "qty": 35},
            {"category": "False Ceiling", "name": "POP False Ceiling", "qty": 120},
        ],
    },
    {
        "id": "lobby", "name": "Lobby / Living", "name_hi": "लॉबी / लिविंग",
        "image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
        "categories": ["Interior Decoration", "Tiles", "False Ceiling", "Paint"],
        "presets": [
            {"category": "Interior Decoration", "name": "TV Unit Panel", "qty": 45},
            {"category": "Tiles", "name": "Vitrified Tile", "qty": 200},
            {"category": "False Ceiling", "name": "Gypsum Board Ceiling", "qty": 180},
            {"category": "Paint", "name": "Interior Emulsion", "qty": 45},
            {"category": "Interior Decoration", "name": "Wall Wallpaper", "qty": 80},
        ],
    },
    {
        "id": "tv_panel", "name": "TV Panel & Feature Wall", "name_hi": "TV पैनल और वॉल",
        "image": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
        "categories": ["Interior Decoration", "Plywood & Wood", "Paint"],
        "presets": [
            {"category": "Interior Decoration", "name": "TV Unit Panel", "qty": 55},
            {"category": "Plywood & Wood", "name": "Plywood 18mm", "qty": 80},
            {"category": "Plywood & Wood", "name": "Laminate Sheet", "qty": 55},
            {"category": "Paint", "name": "Wall Putty", "qty": 30},
        ],
    },
    {
        "id": "tiles", "name": "Tiles & Flooring", "name_hi": "टाइल्स और फ्लोरिंग",
        "image": CATEGORY_IMAGES.get("Tiles"),
        "categories": ["Tiles", "PVC Work"],
        "presets": [
            {"category": "Tiles", "name": "Vitrified Tile", "qty": 500},
            {"category": "Tiles", "name": "Ceramic Floor Tile", "qty": 200},
            {"category": "PVC Work", "name": "PVC Flooring", "qty": 150},
        ],
    },
    {
        "id": "civil", "name": "Civil & Structure", "name_hi": "सिविल और स्ट्रक्चर",
        "image": CATEGORY_IMAGES.get("Cement"),
        "categories": ["Cement", "Steel & TMT", "Bricks & Blocks", "Sand & Aggregate"],
        "presets": [
            {"category": "Cement", "name": "OPC 53 Grade", "qty": 200},
            {"category": "Steel & TMT", "name": "TMT Bar Fe500", "qty": 2500},
            {"category": "Bricks & Blocks", "name": "AAC Block", "qty": 3000},
            {"category": "Sand & Aggregate", "name": "River Sand", "qty": 800},
        ],
    },
    {
        "id": "fabrication", "name": "Fabrication / MS-SS", "name_hi": "फैब्रिकेशन / एमएस-एसएस",
        "image": CATEGORY_IMAGES.get("Fabrication"),
        "categories": ["Fabrication"],
        "presets": [
            {"category": "Fabrication", "name": "MS Gate Fabrication", "qty": 80},
            {"category": "Fabrication", "name": "SS Railing", "qty": 50},
            {"category": "Fabrication", "name": "MS Grill Window", "qty": 60},
            {"category": "Fabrication", "name": "MS Staircase Railing", "qty": 35},
            {"category": "Fabrication", "name": "Welding Rod 12mm", "qty": 25},
        ],
    },
]


async def _resolve_cheapest_material(category: str, name: str):
    return await _db.materials.find_one(
        {"status": "active", "category": category, "name": name},
        {"_id": 0},
        sort=[("rate", 1)],
    )


async def _material_to_line(mat, qty: float, section_id: str = None, section_name: str = None):
    rate = float(mat["rate"])
    q = float(qty)
    return {
        "material_id": mat["id"],
        "section_id": section_id,
        "section_name": section_name,
        "category": mat["category"],
        "name": mat["name"],
        "brand": mat["brand"],
        "unit": mat["unit"],
        "rate": rate,
        "qty": q,
        "amount": round(rate * q, 2),
        "image": resolve_material_image(mat["category"], mat["name"], mat.get("image")),
    }

# category -> [ (material_name, unit, [(brand, rate), ...]) ]
SEED = {
    "Cement": [
        ("OPC 53 Grade", "bag", [("UltraTech", 420), ("ACC", 410), ("Ambuja", 415), ("Dalmia", 400), ("JK Lakshmi", 395)]),
        ("PPC", "bag", [("UltraTech", 400), ("ACC", 390), ("Ambuja", 395), ("Ramco", 385)]),
        ("White Cement", "bag", [("Birla White", 1250), ("JK White", 1180)]),
    ],
    "Steel & TMT": [
        ("TMT Bar Fe500", "kg", [("TATA Tiscon", 68), ("JSW", 66), ("SAIL", 65), ("Jindal Panther", 64), ("Kamdhenu", 62)]),
        ("TMT Bar Fe550", "kg", [("TATA Tiscon", 71), ("JSW", 69), ("SAIL", 68)]),
        ("Binding Wire", "kg", [("TATA", 78), ("Local", 70)]),
    ],
    "Bricks & Blocks": [
        ("Red Clay Brick", "piece", [("Local", 8), ("Wienerberger", 13)]),
        ("Fly Ash Brick", "piece", [("Local", 6), ("Ecobrick", 7)]),
        ("AAC Block", "block", [("Aerocon", 55), ("Biltech", 52), ("Magicrete", 50)]),
    ],
    "Sand & Aggregate": [
        ("River Sand", "cft", [("Graded", 65), ("Local", 58)]),
        ("M-Sand", "cft", [("Robo", 55), ("Local", 50)]),
        ("20mm Aggregate", "cft", [("Graded", 45)]),
        ("10mm Aggregate", "cft", [("Graded", 48)]),
    ],
    "Paint": [
        ("Interior Emulsion", "litre", [("Asian Paints", 280), ("Berger", 260), ("Nerolac", 250), ("Dulux", 270)]),
        ("Exterior Emulsion", "litre", [("Asian Apex", 320), ("Berger Weathercoat", 300), ("Nerolac Excel", 290)]),
        ("Wall Primer", "litre", [("Asian", 180), ("Berger", 170)]),
        ("Wall Putty", "kg", [("Asian", 42), ("Berger", 40), ("Nerolac", 38), ("Dulux", 41)]),
        ("Acrylic Putty", "kg", [("Asian", 52), ("Berger", 48), ("Nerolac", 46)]),
    ],
    "Tiles": [
        ("Vitrified Tile", "sqft", [("Kajaria", 65), ("Somany", 60), ("Nitco", 58), ("Johnson", 62)]),
        ("Ceramic Floor Tile", "sqft", [("Kajaria", 45), ("Somany", 42)]),
        ("Wall Tile", "sqft", [("Kajaria", 48), ("Johnson", 46)]),
    ],
    "Plumbing": [
        ("CPVC Pipe", "meter", [("Astral", 120), ("Supreme", 110), ("Ashirvad", 115), ("Prince", 105)]),
        ("PVC Pipe", "meter", [("Supreme", 90), ("Finolex", 95), ("Prince", 85)]),
        ("Water Tank 1000L", "piece", [("Sintex", 6800), ("Plasto", 6200)]),
    ],
    "Electrical": [
        ("Wire 1.5 sqmm", "meter", [("Havells", 22), ("Polycab", 20), ("Finolex", 21), ("RR Kabel", 19)]),
        ("Wire 2.5 sqmm", "meter", [("Havells", 34), ("Polycab", 32), ("Finolex", 33)]),
        ("Modular Switch", "piece", [("Havells", 85), ("Anchor", 60), ("Legrand", 120), ("GM", 55)]),
        ("MCB 32A", "piece", [("Havells", 320), ("Schneider", 380), ("Legrand", 350)]),
        ("LED Panel Light 18W", "piece", [("Havells", 650), ("Philips", 720), ("Syska", 580)]),
        ("Conduit Pipe 1 inch", "meter", [("Precision", 45), ("Finolex", 42), ("Local", 38)]),
        ("Switch Board 8 Module", "piece", [("Havells", 420), ("Legrand", 480), ("Anchor", 380)]),
    ],
    "Plywood & Wood": [
        ("Plywood 18mm", "sqft", [("Century", 95), ("Greenply", 90), ("Kitply", 80)]),
        ("Laminate Sheet", "sqft", [("Merino", 55), ("Greenlam", 60)]),
    ],
    "Waterproofing": [
        ("Waterproofing Coat", "kg", [("Dr Fixit", 240), ("Fosroc", 220), ("Asian SmartCare", 210)]),
    ],
    "Interior Decoration": [
        ("Modular Kitchen Base Unit", "sqft", [("Sleek", 2200), ("Hafele", 2400), ("Godrej Interio", 2100), ("Hettich", 2500)]),
        ("Wardrobe Sliding Door", "sqft", [("Hafele", 1800), ("Ebco", 1650), ("Godrej Interio", 1700)]),
        ("TV Unit Panel", "sqft", [("Greenlam", 450), ("Merino", 480), ("Century", 420)]),
        ("Curtains & Blinds", "sqft", [("SOMFY", 320), ("Hunter Douglas", 380), ("Local", 180)]),
        ("Wall Wallpaper", "sqft", [("DDecor", 85), ("Marshalls", 95), ("Asian Paints", 78)]),
    ],
    "Vastu": [
        ("Vastu Consultation (Site Visit)", "visit", [("Certified Vastu", 5000), ("Premium Vastu", 8500), ("Online Vastu", 2500)]),
        ("Vastu Report + Layout", "report", [("Certified Vastu", 12000), ("Premium Vastu", 18000), ("Online Vastu", 6000)]),
        ("Pyramid / Remedy Kit", "set", [("Vastu Store", 3500), ("Premium Vastu", 5500)]),
    ],
    "Fabrication": [
        ("MS Gate Fabrication", "sqft", [("Local MS", 650), ("Tata Structura", 720), ("Jindal", 680)]),
        ("MS Sliding Gate", "sqft", [("Local MS", 780), ("Tata Structura", 850), ("Jindal", 820)]),
        ("Designer Fancy Gate", "sqft", [("Local MS", 950), ("Art Gate Works", 1100), ("Jindal", 980)]),
        ("Gate Automation Motor Kit", "set", [("Nice", 18500), ("CAME", 16800), ("Local", 12500)]),
        ("SS Railing", "rft", [("Jindal SS", 850), ("Local SS", 720), ("Neelcon", 780)]),
        ("MS Balcony Railing", "rft", [("Local MS", 420), ("Tata Structura", 480), ("Jindal", 450)]),
        ("Glass Railing with SS", "rft", [("Saint Gobain", 1200), ("Local SS", 980), ("Jindal SS", 1050)]),
        ("MS Grill Window", "sqft", [("Local MS", 420), ("Tata Structura", 480)]),
        ("SS Window Grill", "sqft", [("Jindal SS", 620), ("Local SS", 550)]),
        ("Main Door Frame MS", "set", [("Local MS", 8500), ("Jindal", 9200)]),
        ("SS Main Door Frame", "set", [("Jindal SS", 14500), ("Neelcon", 13200)]),
        ("MS Safety Door", "piece", [("Local MS", 6500), ("Jindal", 7200), ("Tata Structura", 6800)]),
        ("MS Staircase Structure", "sqft", [("Local MS", 520), ("Tata Structura", 580), ("Jindal", 550)]),
        ("MS Staircase Railing", "rft", [("Local MS", 380), ("Tata Structura", 420), ("Jindal", 400)]),
        ("SS Staircase Handrail", "rft", [("Jindal SS", 720), ("Local SS", 650), ("Neelcon", 680)]),
        ("Boundary Wall MS Railing", "rft", [("Local MS", 350), ("Tata Structura", 390), ("Jindal", 370)]),
        ("Chain Link Fencing", "rft", [("Local", 180), ("Tata Structura", 210), ("Jindal", 195)]),
        ("MS Angle 50x50", "kg", [("Tata Structura", 68), ("Jindal", 65), ("Local MS", 62)]),
        ("MS Channel 75x40", "kg", [("Tata Structura", 70), ("Jindal", 67), ("Local MS", 64)]),
        ("MS Flat 25x6", "kg", [("Tata Structura", 66), ("Jindal", 63), ("Local MS", 60)]),
        ("MS Beam Fabrication", "kg", [("Local MS", 95), ("Tata Structura", 105), ("Jindal", 98)]),
        ("MS Roof Truss", "sqft", [("Local MS", 280), ("Tata Structura", 320), ("Jindal", 295)]),
        ("PEB Shed Fabrication", "sqft", [("Tata Structura", 420), ("Jindal", 395), ("Local MS", 360)]),
        ("Polycarbonate Roofing Sheet", "sqft", [("Sabic", 85), ("Local", 72), ("Onduline", 78)]),
        ("GI Sheet 1mm", "sqft", [("Tata Steel", 95), ("JSW", 92), ("Local", 85)]),
        ("Car Porch MS Structure", "sqft", [("Local MS", 450), ("Tata Structura", 520), ("Jindal", 480)]),
        ("Pergola MS Fabrication", "sqft", [("Local MS", 520), ("Art Metal", 580), ("Jindal", 550)]),
        ("ACP Fixing MS Frame", "sqft", [("Local MS", 180), ("Tata Structura", 195), ("Jindal", 188)]),
        ("Aluminium Louver Panel", "sqft", [("Hindalco", 320), ("Jindal Aluminium", 295), ("Local", 260)]),
        ("MS Facade Bracket System", "sqft", [("Tata Structura", 220), ("Local MS", 195), ("Jindal", 205)]),
        ("MS Mezzanine Floor", "sqft", [("Tata Structura", 380), ("Local MS", 340), ("Jindal", 360)]),
        ("MS Platform Fabrication", "sqft", [("Local MS", 420), ("Tata Structura", 460), ("Jindal", 440)]),
        ("SS Kitchen Counter", "sqft", [("Jindal SS", 2200), ("Neelcon", 2100), ("Local SS", 1850)]),
        ("SS Sink Unit with Stand", "set", [("Jindal SS", 12500), ("Neelcon", 11800), ("Local SS", 9800)]),
        ("Expanded Metal Sheet", "sqft", [("Local MS", 120), ("Tata Structura", 135), ("Jindal", 128)]),
        ("Welding Rod 12mm", "kg", [("Ador", 145), ("Esab", 155), ("Local", 125)]),
        ("Cutting Disc", "piece", [("Bosch", 85), ("Black+Decker", 78), ("Local", 55)]),
        ("MS Primer Red Oxide", "litre", [("Asian Paints", 95), ("Berger", 88), ("Nerolac", 82)]),
        ("MS Enamel Paint", "litre", [("Asian Paints", 180), ("Berger", 165), ("Nerolac", 158)]),
        ("SS Polish Finish", "sqft", [("Jindal SS", 45), ("Local SS", 38), ("Neelcon", 42)]),
        ("Fabrication Labour MS Gate", "sqft", [("Local Labour", 180), ("Contractor Grade", 220)]),
        ("Fabrication Labour SS Railing", "rft", [("Local Labour", 220), ("Contractor Grade", 260)]),
    ],
    "False Ceiling": [
        ("POP False Ceiling", "sqft", [("Gyproc", 95), ("Saint Gobain", 105), ("Local POP", 78)]),
        ("Gypsum Board Ceiling", "sqft", [("Gyproc", 110), ("USG Boral", 115), ("Saint Gobain", 108)]),
        ("PVC Ceiling Panel", "sqft", [("Finolex", 85), ("Supreme", 82), ("Prince", 75)]),
        ("Wooden Ceiling Panel", "sqft", [("Greenlam", 280), ("Century", 260), ("Merino", 295)]),
    ],
    "PVC Work": [
        ("PVC Door", "piece", [("Finolex", 8500), ("Supreme", 8200), ("Prince", 7800)]),
        ("UPVC Window", "sqft", [("Fenesta", 520), ("Weatherseal", 480), ("Encraft", 450)]),
        ("PVC Pipe 2 inch", "meter", [("Finolex", 95), ("Supreme", 90), ("Prince", 85)]),
        ("PVC Casing & Capping", "meter", [("Finolex", 28), ("Supreme", 26), ("Prince", 24)]),
        ("PVC Flooring", "sqft", [("Welspun", 65), ("Responsive", 58), ("Gerflor", 72)]),
    ],
    "Renovation": [
        ("Bathroom Renovation Package", "set", [("Jaquar Package", 125000), ("Kohler Package", 145000), ("Local Contractor", 95000)]),
        ("Kitchen Renovation", "set", [("Hafele Package", 180000), ("Sleek Package", 165000), ("Local", 120000)]),
        ("Wall Demolition", "sqft", [("Local Labour", 45), ("Contractor Grade", 55)]),
        ("Debris Removal", "trip", [("Local", 3500), ("UrbanClap", 4200)]),
        ("Terrace Waterproofing", "sqft", [("Dr Fixit", 95), ("Fosroc", 88), ("Asian SmartCare", 82)]),
    ],
    "Gardening": [
        ("Landscape Design", "sqft", [("Urban Greens", 120), ("Green Yard", 95), ("Local", 75)]),
        ("Artificial Grass", "sqft", [("Grass Carpet Co", 85), ("Green Yard", 78), ("Local", 65)]),
        ("Drip Irrigation System", "sqft", [("Rain Bird", 45), ("Netafim", 52), ("Local", 35)]),
        ("Outdoor Plants (mixed)", "sqft", [("Urban Greens", 180), ("Green Yard", 150), ("Local", 120)]),
        ("Garden Lighting LED", "point", [("Havells", 850), ("Philips", 920), ("Syska", 780)]),
    ],
}


# 1-click BOQ templates. Items resolve to the cheapest active brand at request time.
SEED_TEMPLATES = [
    {
        "id": "tpl_villa_3bhk", "name": "3BHK Villa", "area": "~1800 sqft",
        "description": "Complete material estimate for a standard 3BHK independent villa (G+1).",
        "image": "https://images.pexels.com/photos/7031594/pexels-photo-7031594.jpeg?auto=compress&cs=tinysrgb&w=800",
        "items": [
            {"category": "Cement", "name": "OPC 53 Grade", "qty": 350},
            {"category": "Steel & TMT", "name": "TMT Bar Fe500", "qty": 4500},
            {"category": "Bricks & Blocks", "name": "Red Clay Brick", "qty": 14000},
            {"category": "Sand & Aggregate", "name": "River Sand", "qty": 1200},
            {"category": "Sand & Aggregate", "name": "20mm Aggregate", "qty": 900},
            {"category": "Tiles", "name": "Vitrified Tile", "qty": 1800},
            {"category": "Paint", "name": "Interior Emulsion", "qty": 120},
            {"category": "Paint", "name": "Exterior Emulsion", "qty": 80},
            {"category": "Plumbing", "name": "CPVC Pipe", "qty": 250},
            {"category": "Electrical", "name": "Wire 2.5 sqmm", "qty": 600},
            {"category": "Plywood & Wood", "name": "Plywood 18mm", "qty": 400},
            {"category": "Waterproofing", "name": "Waterproofing Coat", "qty": 150},
        ],
    },
    {
        "id": "tpl_flat_2bhk", "name": "2BHK Flat", "area": "~1000 sqft",
        "description": "Material estimate for a 2BHK apartment / flat interior + civil.",
        "image": "https://images.pexels.com/photos/35339499/pexels-photo-35339499.jpeg?auto=compress&cs=tinysrgb&w=800",
        "items": [
            {"category": "Cement", "name": "OPC 53 Grade", "qty": 180},
            {"category": "Steel & TMT", "name": "TMT Bar Fe500", "qty": 2400},
            {"category": "Bricks & Blocks", "name": "AAC Block", "qty": 1800},
            {"category": "Sand & Aggregate", "name": "River Sand", "qty": 650},
            {"category": "Tiles", "name": "Vitrified Tile", "qty": 1000},
            {"category": "Paint", "name": "Interior Emulsion", "qty": 70},
            {"category": "Plumbing", "name": "CPVC Pipe", "qty": 150},
            {"category": "Electrical", "name": "Wire 2.5 sqmm", "qty": 350},
        ],
    },
    {
        "id": "tpl_boundary_wall", "name": "Boundary Wall", "area": "100 rft × 6 ft",
        "description": "Compound / boundary wall material estimate (brick masonry, 6 ft high).",
        "image": "https://images.unsplash.com/photo-1592795694703-24f1814cfb0a?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
        "items": [
            {"category": "Cement", "name": "OPC 53 Grade", "qty": 60},
            {"category": "Steel & TMT", "name": "TMT Bar Fe500", "qty": 350},
            {"category": "Bricks & Blocks", "name": "Red Clay Brick", "qty": 4500},
            {"category": "Sand & Aggregate", "name": "River Sand", "qty": 220},
            {"category": "Paint", "name": "Exterior Emulsion", "qty": 30},
        ],
    },
    {
        "id": "tpl_interior_2bhk", "name": "2BHK Interior Package", "area": "~1000 sqft",
        "description": "Interior decoration BOQ: kitchen, wardrobe, TV unit, wallpaper.",
        "image": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800",
        "vertical": "interior_decoration",
        "items": [
            {"category": "Interior Decoration", "name": "Modular Kitchen Base Unit", "qty": 80},
            {"category": "Interior Decoration", "name": "Wardrobe Sliding Door", "qty": 120},
            {"category": "Interior Decoration", "name": "TV Unit Panel", "qty": 40},
            {"category": "Interior Decoration", "name": "Wall Wallpaper", "qty": 200},
        ],
    },
    {
        "id": "tpl_false_ceiling_1000", "name": "False Ceiling 1000 sqft", "area": "1000 sqft",
        "description": "POP + gypsum false ceiling material estimate.",
        "image": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800",
        "vertical": "false_ceiling",
        "items": [
            {"category": "False Ceiling", "name": "POP False Ceiling", "qty": 1000},
            {"category": "False Ceiling", "name": "Gypsum Board Ceiling", "qty": 200},
        ],
    },
    {
        "id": "tpl_tiles_3bhk", "name": "3BHK Tiles Package", "area": "~1800 sqft",
        "description": "Floor + wall tiles for 3BHK with brand-wise rates.",
        "image": "https://images.unsplash.com/photo-1647102256335-7a7370d99924?w=800",
        "vertical": "tiles",
        "items": [
            {"category": "Tiles", "name": "Vitrified Tile", "qty": 1800},
            {"category": "Tiles", "name": "Wall Tile", "qty": 600},
            {"category": "Tiles", "name": "Ceramic Floor Tile", "qty": 400},
        ],
    },
    {
        "id": "tpl_pvc_3bhk", "name": "3BHK PVC Package", "area": "doors + windows",
        "description": "PVC doors, UPVC windows, casing for 3BHK.",
        "image": "https://images.pexels.com/photos/12142829/pexels-photo-12142829.jpeg?auto=compress&cs=tinysrgb&w=800",
        "vertical": "pvc_work",
        "items": [
            {"category": "PVC Work", "name": "PVC Door", "qty": 4},
            {"category": "PVC Work", "name": "UPVC Window", "qty": 120},
            {"category": "PVC Work", "name": "PVC Casing & Capping", "qty": 200},
        ],
    },
    {
        "id": "tpl_renovation_bathroom", "name": "Bathroom Renovation", "area": "2 bathrooms",
        "description": "Complete bathroom renovation with waterproofing.",
        "image": "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800",
        "vertical": "renovation",
        "items": [
            {"category": "Renovation", "name": "Bathroom Renovation Package", "qty": 2},
        ],
    },
    {
        "id": "tpl_garden_500", "name": "Garden 500 sqft", "area": "500 sqft lawn",
        "description": "Landscape, grass, irrigation for small garden.",
        "image": "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800",
        "vertical": "gardening",
        "items": [
            {"category": "Gardening", "name": "Landscape Design", "qty": 500},
            {"category": "Gardening", "name": "Artificial Grass", "qty": 300},
            {"category": "Gardening", "name": "Drip Irrigation System", "qty": 500},
        ],
    },
    {
        "id": "tpl_fabrication_gate", "name": "Gate + Railing Package", "area": "standard plot",
        "description": "MS gate, SS railing, window grills.",
        "image": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800",
        "vertical": "fabrication",
        "items": [
            {"category": "Fabrication", "name": "MS Gate Fabrication", "qty": 80},
            {"category": "Fabrication", "name": "SS Railing", "qty": 40},
            {"category": "Fabrication", "name": "MS Grill Window", "qty": 60},
        ],
    },
    {
        "id": "tpl_fabrication_staircase", "name": "Staircase MS Package", "area": "G+1 home",
        "description": "MS staircase structure, railing and handrail.",
        "image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
        "vertical": "fabrication",
        "items": [
            {"category": "Fabrication", "name": "MS Staircase Structure", "qty": 45},
            {"category": "Fabrication", "name": "MS Staircase Railing", "qty": 35},
            {"category": "Fabrication", "name": "SS Staircase Handrail", "qty": 35},
        ],
    },
    {
        "id": "tpl_fabrication_boundary", "name": "Boundary + Chain Link", "area": "200 rft boundary",
        "description": "Boundary railing and chain link fencing.",
        "image": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800",
        "vertical": "fabrication",
        "items": [
            {"category": "Fabrication", "name": "Boundary Wall MS Railing", "qty": 120},
            {"category": "Fabrication", "name": "Chain Link Fencing", "qty": 80},
            {"category": "Fabrication", "name": "MS Gate Fabrication", "qty": 40},
        ],
    },
    {
        "id": "tpl_fabrication_shed", "name": "Car Porch + PEB Shed", "area": "car porch + small shed",
        "description": "Car porch MS and light PEB shed structure.",
        "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
        "vertical": "fabrication",
        "items": [
            {"category": "Fabrication", "name": "Car Porch MS Structure", "qty": 200},
            {"category": "Fabrication", "name": "PEB Shed Fabrication", "qty": 400},
            {"category": "Fabrication", "name": "GI Sheet 1mm", "qty": 400},
        ],
    },
    {
        "id": "tpl_fabrication_commercial_ss", "name": "Commercial SS Package", "area": "shop / kitchen",
        "description": "SS counter, sink, railing for commercial fit-out.",
        "image": "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800",
        "vertical": "fabrication",
        "items": [
            {"category": "Fabrication", "name": "SS Kitchen Counter", "qty": 60},
            {"category": "Fabrication", "name": "SS Sink Unit with Stand", "qty": 2},
            {"category": "Fabrication", "name": "SS Railing", "qty": 30},
        ],
    },
    {
        "id": "tpl_vastu_site", "name": "Vastu Site Package", "area": "site visit + report",
        "description": "Vastu consultation, report, and remedy kit.",
        "image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
        "vertical": "vastu",
        "items": [
            {"category": "Vastu", "name": "Vastu Consultation (Site Visit)", "qty": 1},
            {"category": "Vastu", "name": "Vastu Report + Layout", "qty": 1},
        ],
    },
]


def _gen_history(rate, seed_str):
    """Deterministic-per-material 6-point monthly price trend ending at the current rate."""
    rnd = random.Random(seed_str)
    n = 6
    start_factor = 1 - rnd.uniform(0.03, 0.14)
    pts = []
    now = now_utc()
    for i in range(n):
        frac = i / (n - 1)
        f = start_factor + (1.0 - start_factor) * frac
        f = 1.0 if i == n - 1 else f + rnd.uniform(-0.02, 0.02)
        d = now - timedelta(days=30 * (n - 1 - i))
        pts.append({"date": d.date().isoformat(), "rate": round(rate * f, 2)})
    return pts


# ---------------------------------------------------------------------------
# Public reads
# ---------------------------------------------------------------------------
@public_router.get("/mart/categories")
async def mart_categories():
    return await _db.materials.distinct("category", {"status": "active"})


@public_router.get("/mart/brands")
async def mart_brands(category: Optional[str] = None):
    q = {"status": "active"}
    if category and category != "all":
        q["category"] = category
    return await _db.materials.distinct("brand", q)


@public_router.get("/mart/materials")
async def mart_materials(category: Optional[str] = None, brand: Optional[str] = None, q: Optional[str] = None):
    query = {"status": "active"}
    if category and category != "all":
        query["category"] = category
    if brand and brand != "all":
        query["brand"] = brand
    if q:
        query["name"] = {"$regex": q, "$options": "i"}
    return await _db.materials.find(query, {"_id": 0}).sort([("category", 1), ("name", 1), ("rate", 1)]).to_list(1000)


@public_router.get("/mart/boq-templates")
async def list_boq_templates(vertical: Optional[str] = None):
    tpls = SEED_TEMPLATES
    if vertical:
        tpls = [t for t in SEED_TEMPLATES if t.get("vertical") == vertical]
    return [{"id": t["id"], "name": t["name"], "description": t["description"],
             "image": t["image"], "area": t["area"], "items": len(t["items"]),
             "vertical": t.get("vertical")} for t in tpls]


@public_router.get("/mart/fabrication/works")
async def fabrication_work_types():
    """Fabrication work categories with linked material SKUs and rates."""
    out = []
    for wt in FABRICATION_WORK_TYPES:
        row = {k: v for k, v in wt.items() if k != "materials"}
        mats = []
        for name in wt.get("materials", []):
            cheapest = await _db.materials.find_one(
                {"status": "active", "category": "Fabrication", "name": name},
                {"_id": 0},
                sort=[("rate", 1)],
            )
            if cheapest:
                mats.append({
                    "name": name,
                    "unit": cheapest.get("unit"),
                    "from_rate": float(cheapest.get("rate", 0)),
                    "from_brand": cheapest.get("brand"),
                    "image": resolve_material_image("Fabrication", name, cheapest.get("image")),
                })
            else:
                mats.append({"name": name, "unit": None, "from_rate": None})
        row["material_items"] = mats
        out.append(row)
    return {"work_types": out, "vertical": next((v for v in INTERIOR_VERTICALS if v["id"] == "fabrication"), None)}


@public_router.get("/mart/interior-verticals")
async def list_interior_verticals():
    out = []
    for v in INTERIOR_VERTICALS:
        row = dict(v)
        mats = await _db.materials.find(
            {"status": "active", "category": v["category"]},
            {"_id": 0, "rate": 1, "unit": 1, "brand": 1, "name": 1},
        ).sort("rate", 1).to_list(500)
        row["brand_count"] = len(mats)
        row["product_count"] = len({m["name"] for m in mats}) if mats else 0
        if mats:
            cheapest = mats[0]
            row["from_rate"] = float(cheapest["rate"])
            row["from_unit"] = cheapest["unit"]
            row["from_brand"] = cheapest["brand"]
        out.append(row)
    return out


@public_router.get("/mart/catalog-showcase")
async def catalog_showcase():
    """Single payload for site-wide brand/catalog widgets (verticals + featured rates)."""
    verticals_out = []
    featured = []
    seen_names = set()

    for v in INTERIOR_VERTICALS:
        row = dict(v)
        mats = await _db.materials.find(
            {"status": "active", "category": v["category"]},
            {"_id": 0},
        ).sort("rate", 1).to_list(500)
        row["brand_count"] = len(mats)
        row["product_count"] = len({m["name"] for m in mats}) if mats else 0
        if mats:
            cheapest = mats[0]
            row["from_rate"] = float(cheapest["rate"])
            row["from_unit"] = cheapest["unit"]
            row["from_brand"] = cheapest["brand"]
        verticals_out.append(row)

        per_vertical = 0
        for m in mats:
            if m["name"] in seen_names:
                continue
            seen_names.add(m["name"])
            featured.append({
                "id": m["id"],
                "name": m["name"],
                "brand": m["brand"],
                "rate": float(m["rate"]),
                "unit": m["unit"],
                "category": v["category"],
                "image": resolve_material_image(v["category"], m["name"], m.get("image")),
                "vertical_id": v["id"],
                "link": f"/interior-boq/{v['id']}",
            })
            per_vertical += 1
            if per_vertical >= 2:
                break

    for cat in ["Cement", "Steel & TMT", "Tiles", "Paint"]:
        mat = await _db.materials.find_one({"status": "active", "category": cat}, {"_id": 0}, sort=[("rate", 1)])
        if not mat or mat["name"] in seen_names:
            continue
        seen_names.add(mat["name"])
        featured.append({
            "id": mat["id"],
            "name": mat["name"],
            "brand": mat["brand"],
            "rate": float(mat["rate"]),
            "unit": mat["unit"],
            "category": cat,
            "image": resolve_material_image(cat, mat["name"], mat.get("image")),
            "vertical_id": None,
            "link": "/mart",
        })

    total_brands = len(await _db.materials.distinct("brand", {"status": "active"}))
    return {
        "verticals": verticals_out,
        "featured": featured[:28],
        "total_brands": total_brands,
    }


@public_router.get("/store/meta")
async def store_meta():
    """Categories, brands and interior verticals for Myntra-style store filters."""
    product_cats = await _db.products.distinct("category")
    mart_cats = await _db.materials.distinct("category", {"status": "active"})
    brands = set(await _db.materials.distinct("brand", {"status": "active"}))
    for vn in await _db.products.distinct("vendor_name"):
        if vn:
            brands.add(vn)
    verticals_out = []
    for v in INTERIOR_VERTICALS:
        row = dict(v)
        cnt = await _db.materials.count_documents({"status": "active", "category": v["category"]})
        row["item_count"] = cnt
        verticals_out.append(row)
    return {
        "categories": sorted(set(product_cats + mart_cats)),
        "brands": sorted(brands),
        "verticals": verticals_out,
        "product_count": await _db.products.count_documents({}),
        "material_count": await _db.materials.count_documents({"status": "active"}),
    }


@public_router.get("/store/browse")
async def store_browse(
    category: Optional[str] = None,
    brand: Optional[str] = None,
    q: Optional[str] = None,
    sort: Optional[str] = "name",
    limit: int = 120,
):
    """Unified storefront: marketplace products + Super Mart / interior materials."""
    items = []

    pq = {}
    if category and category != "all":
        pq["category"] = category
    if q:
        pq["name"] = {"$regex": q, "$options": "i"}
    for p in await _db.products.find(pq, {"_id": 0}).to_list(500):
        vendor = p.get("vendor_name") or "Vendor"
        if brand and brand != "all" and brand not in (vendor, p.get("brand", "")):
            continue
        items.append({
            "id": p["id"],
            "name": p["name"],
            "brand": vendor,
            "category": p["category"],
            "price": float(p["price"]),
            "unit": p.get("unit", "unit"),
            "image": p.get("image"),
            "rating": float(p.get("rating", 4.5)),
            "source": "product",
            "stock": p.get("stock"),
            "description": p.get("description"),
        })

    mq = {"status": "active"}
    if category and category != "all":
        mq["category"] = category
    if brand and brand != "all":
        mq["brand"] = brand
    if q:
        mq["name"] = {"$regex": q, "$options": "i"}
    for m in await _db.materials.find(mq, {"_id": 0}).to_list(2000):
        items.append({
            "id": m["id"],
            "name": m["name"],
            "brand": m["brand"],
            "category": m["category"],
            "price": float(m["rate"]),
            "unit": m["unit"],
            "image": resolve_material_image(m["category"], m["name"], m.get("image")),
            "rating": 4.4,
            "source": "material",
            "description": f"{m['brand']} — {m['name']} at live market rate.",
        })

    if sort == "price_asc":
        items.sort(key=lambda x: x["price"])
    elif sort == "price_desc":
        items.sort(key=lambda x: -x["price"])
    elif sort == "brand":
        items.sort(key=lambda x: (x["brand"], x["name"]))
    else:
        items.sort(key=lambda x: x["name"])

    return {"items": items[:limit], "total": len(items)}


@public_router.get("/store/product/{item_id}")
async def store_product(item_id: str):
    p = await _db.products.find_one({"id": item_id}, {"_id": 0})
    if p:
        return {
            "id": p["id"],
            "name": p["name"],
            "brand": p.get("vendor_name") or "Vendor",
            "category": p["category"],
            "price": float(p["price"]),
            "unit": p.get("unit", "unit"),
            "image": p.get("image"),
            "rating": float(p.get("rating", 4.5)),
            "source": "product",
            "stock": p.get("stock"),
            "description": p.get("description") or f"Premium {p['name']} with GST invoice.",
            "vendor_name": p.get("vendor_name"),
        }
    m = await _db.materials.find_one({"id": item_id, "status": "active"}, {"_id": 0})
    if not m:
        raise HTTPException(404, "Product not found")
    return {
        "id": m["id"],
        "name": m["name"],
        "brand": m["brand"],
        "category": m["category"],
        "price": float(m["rate"]),
        "unit": m["unit"],
        "image": resolve_material_image(m["category"], m["name"], m.get("image")),
        "rating": 4.4,
        "source": "material",
        "description": f"{m['brand']} {m['name']} — brand-wise live rate from 2click Super Mart catalog.",
    }


@public_router.get("/mart/boq-builder/sections")
async def boq_builder_sections():
    out = []
    for s in BOQ_SECTIONS:
        row = dict(s)
        cats = s["categories"]
        cnt = await _db.materials.count_documents({"status": "active", "category": {"$in": cats}})
        row["item_count"] = cnt
        row.pop("presets", None)
        out.append(row)
    return out


@public_router.get("/mart/boq-builder/sections/{sid}/catalog")
async def boq_section_catalog(sid: str):
    sec = next((x for x in BOQ_SECTIONS if x["id"] == sid), None)
    if not sec:
        raise HTTPException(404, "Section not found")
    mats = await _db.materials.find(
        {"status": "active", "category": {"$in": sec["categories"]}},
        {"_id": 0},
    ).sort([("category", 1), ("name", 1), ("rate", 1)]).to_list(800)
    products = []
    by_name = {}
    for m in mats:
        key = f"{m['category']}|{m['name']}"
        by_name.setdefault(key, {"name": m["name"], "category": m["category"], "unit": m["unit"], "brands": []})
        by_name[key]["brands"].append({
            "id": m["id"], "brand": m["brand"], "rate": float(m["rate"]),
            "unit": m["unit"], "image": resolve_material_image(m["category"], m["name"], m.get("image")),
        })
    for pdata in by_name.values():
        brands = sorted(pdata["brands"], key=lambda x: x["rate"])
        products.append({
            "name": pdata["name"],
            "category": pdata["category"],
            "unit": pdata["unit"],
            "image": brands[0]["image"] if brands else None,
            "from_rate": brands[0]["rate"] if brands else None,
            "brands": brands,
            "cheapest_id": brands[0]["id"] if brands else None,
        })
    products.sort(key=lambda x: (x["category"], x["name"]))
    return {"section": sec, "products": products}


@public_router.get("/mart/boq-builder/sections/{sid}/presets")
async def boq_section_presets(sid: str):
    sec = next((x for x in BOQ_SECTIONS if x["id"] == sid), None)
    if not sec:
        raise HTTPException(404, "Section not found")
    lines = []
    for p in sec.get("presets", []):
        mat = await _resolve_cheapest_material(p["category"], p["name"])
        if not mat:
            continue
        lines.append(await _material_to_line(mat, p["qty"], sid, sec["name"]))
    total = round(sum(l["amount"] for l in lines), 2)
    return {"section": sec, "lines": lines, "total": total}


@public_router.post("/mart/boq-builder/generate")
async def boq_builder_generate(body: dict):
    """Build grouped BOQ from selected lines across room/trade stores."""
    lines_in = body.get("lines") or []
    section_ids = body.get("sections") or []
    resolved = []
    section_totals = {}

    for row in lines_in:
        mid = row.get("material_id")
        qty = float(row.get("qty") or 0)
        sid = row.get("section_id")
        if not mid or qty <= 0:
            continue
        mat = await _db.materials.find_one({"id": mid, "status": "active"}, {"_id": 0})
        if not mat:
            continue
        sec = next((x for x in BOQ_SECTIONS if x["id"] == sid), None)
        sec_name = sec["name"] if sec else mat.get("category")
        line = await _material_to_line(mat, qty, sid, sec_name)
        resolved.append(line)
        if sid:
            section_totals[sid] = round(section_totals.get(sid, 0) + line["amount"], 2)

    # Auto-load presets for selected sections with no manual lines
    if section_ids:
        for sid in section_ids:
            if section_totals.get(sid):
                continue
            sec = next((x for x in BOQ_SECTIONS if x["id"] == sid), None)
            if not sec:
                continue
            for p in sec.get("presets", []):
                mat = await _resolve_cheapest_material(p["category"], p["name"])
                if not mat:
                    continue
                line = await _material_to_line(mat, p["qty"], sid, sec["name"])
                resolved.append(line)
                section_totals[sid] = round(section_totals.get(sid, 0) + line["amount"], 2)

    grouped = {}
    for line in resolved:
        key = line.get("section_id") or "general"
        grouped.setdefault(key, {"section_id": line.get("section_id"), "section_name": line.get("section_name") or "General", "lines": [], "total": 0})
        grouped[key]["lines"].append(line)
        grouped[key]["total"] = round(grouped[key]["total"] + line["amount"], 2)

    total = round(sum(g["total"] for g in grouped.values()), 2)
    return {
        "groups": list(grouped.values()),
        "lines": resolved,
        "section_totals": section_totals,
        "total": total,
        "line_count": len(resolved),
    }


@public_router.get("/mart/interior-verticals/{vid}/catalog")
async def vertical_catalog(vid: str):
    """Products grouped by name with brand options sorted by rate (for brand comparison UI)."""
    v = next((x for x in INTERIOR_VERTICALS if x["id"] == vid), None)
    if not v:
        raise HTTPException(404, "Vertical not found")
    mats = await _db.materials.find(
        {"status": "active", "category": v["category"]},
        {"_id": 0},
    ).sort([("name", 1), ("rate", 1)]).to_list(500)
    by_name = {}
    for m in mats:
        entry = {
            "id": m["id"], "brand": m["brand"], "rate": float(m["rate"]),
            "unit": m["unit"], "name": m["name"],
            "image": resolve_material_image(m["category"], m["name"], m.get("image")),
        }
        by_name.setdefault(m["name"], {"name": m["name"], "unit": m["unit"], "brands": []})
        by_name[m["name"]]["brands"].append(entry)
    products = []
    for pname, pdata in by_name.items():
        brands = sorted(pdata["brands"], key=lambda x: x["rate"])
        product_image = brands[0]["image"] if brands else None
        products.append({
            "name": pname,
            "unit": pdata["unit"],
            "image": product_image,
            "from_rate": brands[0]["rate"] if brands else None,
            "brands": brands,
            "cheapest": brands[0] if brands else None,
        })
    products.sort(key=lambda x: x["name"])
    all_brands = sorted({m["brand"] for m in mats})
    payload = {"vertical": v, "products": products, "brands": all_brands}
    if vid == "fabrication":
        work_resp = await fabrication_work_types()
        payload["work_types"] = work_resp.get("work_types", [])
    return payload


@public_router.get("/mart/interior-verticals/{vid}/materials")
async def vertical_materials(vid: str, brand: Optional[str] = None):
    v = next((x for x in INTERIOR_VERTICALS if x["id"] == vid), None)
    if not v:
        raise HTTPException(404, "Vertical not found")
    q = {"status": "active", "category": v["category"]}
    if brand and brand != "all":
        q["brand"] = brand
    mats = await _db.materials.find(q, {"_id": 0}).sort([("name", 1), ("rate", 1)]).to_list(500)
    brands = sorted({m["brand"] for m in mats})
    return {"vertical": v, "materials": mats, "brands": brands}


@public_router.post("/mart/interior-boq/estimate")
async def interior_boq_estimate(body: dict):
    """Resolve line items with brand-wise rates; returns column totals per vertical."""
    lines_in = body.get("lines") or []
    resolved = []
    column_totals = {v["id"]: 0.0 for v in INTERIOR_VERTICALS}
    for row in lines_in:
        vid = row.get("vertical_id")
        cat = row.get("category")
        name = row.get("name")
        brand = row.get("brand")
        qty = float(row.get("qty") or 0)
        if not name or qty <= 0:
            continue
        q = {"status": "active", "name": name}
        if cat:
            q["category"] = cat
        if brand:
            q["brand"] = brand
        mat = await _db.materials.find_one(q, {"_id": 0}, sort=[("rate", 1)])
        if not mat:
            continue
        rate = float(mat["rate"])
        amount = round(rate * qty, 2)
        v = next((x for x in INTERIOR_VERTICALS if x["id"] == vid), None)
        line = {
            "vertical_id": vid or (v["id"] if v else None),
            "vertical": v["name"] if v else mat.get("category"),
            "category": mat["category"], "name": mat["name"], "brand": mat["brand"],
            "unit": mat["unit"], "rate": rate, "qty": qty, "amount": amount,
        }
        resolved.append(line)
        key = vid or next((x["id"] for x in INTERIOR_VERTICALS if x["category"] == mat["category"]), None)
        if key and key in column_totals:
            column_totals[key] = round(column_totals[key] + amount, 2)
    total = round(sum(column_totals.values()), 2)
    return {"lines": resolved, "column_totals": column_totals, "total": total}


@public_router.get("/mart/boq-templates/{tid}")
async def get_boq_template(tid: str):
    t = next((x for x in SEED_TEMPLATES if x["id"] == tid), None)
    if not t:
        raise HTTPException(404, "Template not found")
    lines = []
    for it in t["items"]:
        mat = await _db.materials.find_one(
            {"category": it["category"], "name": it["name"], "status": "active"},
            {"_id": 0}, sort=[("rate", 1)])
        if not mat:
            continue
        rate = float(mat["rate"])
        qty = float(it["qty"])
        lines.append({"name": mat["name"], "category": mat["category"], "brand": mat["brand"],
                      "unit": mat["unit"], "rate": rate, "qty": qty, "amount": round(rate * qty, 2)})
    total = round(sum(l["amount"] for l in lines), 2)
    return {"id": t["id"], "name": t["name"], "description": t["description"],
            "area": t["area"], "image": t["image"], "lines": lines, "total": total}


# ---------------------------------------------------------------------------
# Super-Admin managed CRUD (rates editable, rate history tracked)
# ---------------------------------------------------------------------------
@admin_router.get("/mart/materials")
async def admin_list_materials(user=Depends(rbac.rbac_admin)):
    return await _db.materials.find({}, {"_id": 0}).sort([("category", 1), ("name", 1), ("brand", 1)]).to_list(5000)


@admin_router.post("/mart/materials")
async def admin_create_material(body: MaterialIn, request: Request, user=Depends(rbac.rbac_admin)):
    data = body.model_dump()
    if not data.get("image"):
        data["image"] = resolve_material_image(data["category"], data["name"])
    doc = {"id": new_id("mat"), **data,
           "rate_history": [{"date": now_utc().date().isoformat(), "rate": float(data["rate"])}],
           "created_at": iso(now_utc()), "updated_at": iso(now_utc())}
    await _db.materials.insert_one(dict(doc))
    await rbac.audit_log("CREATE", "materials", doc["id"], None, {"name": body.name, "brand": body.brand, "rate": body.rate}, user=user, request=request)
    doc.pop("_id", None)
    return doc


@admin_router.put("/mart/materials/{mid}")
async def admin_update_material(mid: str, body: MaterialUpdate, request: Request, user=Depends(rbac.rbac_admin)):
    old = await _db.materials.find_one({"id": mid}, {"_id": 0})
    if not old:
        raise HTTPException(404, "Material not found")
    upd = body.model_dump(exclude_unset=True)
    if not upd:
        return {"ok": True}
    upd["updated_at"] = iso(now_utc())
    await _db.materials.update_one({"id": mid}, {"$set": upd})
    if "rate" in upd and float(old.get("rate", 0)) != float(upd["rate"]):
        await _db.materials.update_one(
            {"id": mid},
            {"$push": {"rate_history": {"date": now_utc().date().isoformat(), "rate": float(upd["rate"])}}})
    await rbac.audit_log("EDIT", "materials", mid, old, upd, user=user, request=request)
    return {"ok": True}


@admin_router.delete("/mart/materials/{mid}")
async def admin_delete_material(mid: str, request: Request, user=Depends(rbac.rbac_admin)):
    await _db.materials.delete_one({"id": mid})
    await rbac.audit_log("DELETE", "materials", mid, None, None, user=user, request=request)
    return {"ok": True}


# ---------------------------------------------------------------------------
# Indexes + Seed + Migrate
# ---------------------------------------------------------------------------
async def ensure_indexes():
    for f in ["category", "brand", "name", "status"]:
        try:
            await _db.materials.create_index(f)
        except Exception:
            pass


async def seed_mart():
    if await _db.materials.count_documents({}) > 0:
        return
    order = 0
    for category, items in SEED.items():
        for name, unit, brands in items:
            for brand, rate in brands:
                order += 1
                await _db.materials.insert_one({
                    "id": new_id("mat"), "category": category, "name": name,
                    "brand": brand, "unit": unit, "rate": float(rate), "hsn": None,
                    "image": resolve_material_image(category, name), "status": "active", "sort_order": order,
                    "rate_history": _gen_history(float(rate), f"{category}-{name}-{brand}"),
                    "created_at": iso(now_utc()), "updated_at": iso(now_utc()),
                })


async def seed_interior_verticals():
    """Idempotent seed for interior/finishing vertical categories + brand materials."""
    order = await _db.materials.count_documents({})
    vertical_cats = [v["category"] for v in INTERIOR_VERTICALS]
    for category in vertical_cats:
        items = SEED.get(category, [])
        for name, unit, brands in items:
            for brand, rate in brands:
                exists = await _db.materials.find_one(
                    {"category": category, "name": name, "brand": brand}, {"_id": 1})
                if exists:
                    continue
                order += 1
                await _db.materials.insert_one({
                    "id": new_id("mat"), "category": category, "name": name,
                    "brand": brand, "unit": unit, "rate": float(rate), "hsn": None,
                    "image": resolve_material_image(category, name), "status": "active", "sort_order": order,
                    "rate_history": _gen_history(float(rate), f"{category}-{name}-{brand}"),
                    "created_at": iso(now_utc()), "updated_at": iso(now_utc()),
                })


async def seed_boq_store_materials():
    """Idempotent: ensure materials for all BOQ builder room/trade stores exist."""
    order = await _db.materials.count_documents({})
    cats = set()
    for sec in BOQ_SECTIONS:
        cats.update(sec.get("categories", []))
        for p in sec.get("presets", []):
            cats.add(p["category"])
    for category in sorted(cats):
        items = SEED.get(category, [])
        for name, unit, brands in items:
            for brand, rate in brands:
                exists = await _db.materials.find_one(
                    {"category": category, "name": name, "brand": brand}, {"_id": 1})
                if exists:
                    continue
                order += 1
                await _db.materials.insert_one({
                    "id": new_id("mat"), "category": category, "name": name,
                    "brand": brand, "unit": unit, "rate": float(rate), "hsn": None,
                    "image": resolve_material_image(category, name), "status": "active", "sort_order": order,
                    "rate_history": _gen_history(float(rate), f"{category}-{name}-{brand}"),
                    "created_at": iso(now_utc()), "updated_at": iso(now_utc()),
                })


async def migrate_mart():
    """Idempotent backfill: product/category images + rate history on legacy docs."""
    async for m in _db.materials.find({}, {"_id": 0}):
        upd = {}
        resolved = resolve_material_image(m.get("category", ""), m.get("name", ""), m.get("image"))
        cat_only = CATEGORY_IMAGES.get(m.get("category"))
        if resolved and m.get("image") != resolved:
            # Upgrade category-only images to product-specific when available
            if not m.get("image") or (cat_only and m.get("image") == cat_only):
                upd["image"] = resolved
        if not m.get("rate_history"):
            upd["rate_history"] = _gen_history(float(m.get("rate", 0)), m["id"])
        if upd:
            await _db.materials.update_one({"id": m["id"]}, {"$set": upd})
