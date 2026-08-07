"""
2Click.in — Solar EPC Engine: system sizing, 25-yr generation/degradation model,
tiered Bill of Quantities (Premium / Standard / Budget) with component specs,
PM Surya Ghar subsidy + Jan Samarth/C&I loan (EMI) engine, C&I 40% Accelerated
Depreciation + GST ITC, KYC document checklist + upload (object storage), and
downloadable Proposal + Bank-ready DPR PDFs (reportlab).

All figures are engineering estimates (clearly labelled). Deterministic — no LLM.
"""
import os
import io
import math
import uuid
import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional

import requests
from fastapi import APIRouter, Depends, HTTPException, Request, Response, UploadFile, File, Query, Header
from pydantic import BaseModel

logger = logging.getLogger("solar_epc")

_db = None
_get_current_user = None


def init(db, get_current_user):
    global _db, _get_current_user
    _db = db
    _get_current_user = get_current_user


def now_utc(): return datetime.now(timezone.utc)
def iso(dt): return dt.isoformat() if isinstance(dt, datetime) else dt
def new_id(p): return f"{p}_{uuid.uuid4().hex[:12]}"

router = APIRouter(prefix="/api/solar/epc", tags=["solar-epc"])

# --------------------------------------------------------------------------- #
# Engineering constants
# --------------------------------------------------------------------------- #
PEAK_SUN_HOURS = 4.5          # average across India
SYSTEM_EFFICIENCY = 0.8       # sizing derate
PERFORMANCE_RATIO = 0.8       # generation PR
AREA_PER_KWP = 80             # sq.ft per kWp (rooftop)
DEGRADATION = 0.0055          # 0.55% annual module degradation
GST_RATE = 0.138              # blended solar GST (~13.8%)
CO2_PER_KWH = 0.82            # kg CO2 offset per kWh (grid)
CORP_TAX_RATE = 0.25          # for C&I accelerated depreciation benefit
TARIFF_ESCALATION = 0.03      # 3% annual tariff escalation for savings model

TIERS = {
    "premium": {
        "label": "Tier-1 Premium",
        "module_wp": 585, "module_tech": "N-Type TOPCon Bifacial (>21.5% eff)",
        "module_brand": "Waaree / Adani", "module_rate_per_wp": 20,
        "inverter_brand": "Sungrow / SolarEdge", "inverter_rate_per_kw": 6500,
        "structure_brand": "Anodized Aluminium / Tata", "structure_rate_per_kw": 5500,
        "dc_rate_per_kw": 2200, "ac_rate_per_kw": 2300,
        "protection_brand": "Schneider / Havells", "protection_rate_per_kw": 2500,
        "earthing_pit_rate": 6000, "la_type": "ESE Lightning Arrester", "la_rate": 12000,
        "netmeter_rate": 8000, "install_rate_per_kw": 6000,
        "battery_brand": "Exide / Luminous LiFePO4", "battery_rate_per_kwh": 32000,
    },
    "standard": {
        "label": "Standard",
        "module_wp": 550, "module_tech": "Mono-PERC (>21% eff)",
        "module_brand": "Vikram / Premier", "module_rate_per_wp": 16,
        "inverter_brand": "Growatt / Luminous", "inverter_rate_per_kw": 5000,
        "structure_brand": "HDGI (Hot-dip Galvanised)", "structure_rate_per_kw": 4200,
        "dc_rate_per_kw": 1700, "ac_rate_per_kw": 1800,
        "protection_brand": "Havells", "protection_rate_per_kw": 2000,
        "earthing_pit_rate": 5000, "la_type": "Conventional Copper LA", "la_rate": 6000,
        "netmeter_rate": 7000, "install_rate_per_kw": 5000,
        "battery_brand": "Luminous LiFePO4", "battery_rate_per_kwh": 28000,
    },
    "budget": {
        "label": "Budget",
        "module_wp": 545, "module_tech": "Mono-PERC (ALMM)",
        "module_brand": "ALMM Approved (Local)", "module_rate_per_wp": 14,
        "inverter_brand": "Local MPPT String", "inverter_rate_per_kw": 4200,
        "structure_brand": "GI Structure", "structure_rate_per_kw": 3200,
        "dc_rate_per_kw": 1400, "ac_rate_per_kw": 1500,
        "protection_brand": "Standard", "protection_rate_per_kw": 1500,
        "earthing_pit_rate": 4000, "la_type": "Conventional LA", "la_rate": 4500,
        "netmeter_rate": 6000, "install_rate_per_kw": 4000,
        "battery_brand": "LiFePO4 (Local)", "battery_rate_per_kwh": 24000,
    },
}

KYC_CHECKLIST = {
    "residential": [
        {"key": "pan", "label": "PAN Card", "group": "Customer KYC", "required": True},
        {"key": "address_proof", "label": "Address Proof (Aadhaar/Passport)", "group": "Customer KYC", "required": True},
        {"key": "property_proof", "label": "Property Tax Receipt / Registered Lease", "group": "Customer KYC", "required": True},
        {"key": "electricity_bill", "label": "Latest 6–12 months Electricity Bills", "group": "Technical KYC", "required": True},
        {"key": "sanctioned_load", "label": "DISCOM Sanctioned Load Certificate", "group": "Technical KYC", "required": True},
        {"key": "site_geo", "label": "Site Geo-tagging & Shadow Analysis Report", "group": "Technical KYC", "required": False},
        {"key": "bank_statement", "label": "6 months Bank Statement (for loan)", "group": "Financial KYC", "required": False},
    ],
    "commercial": [
        {"key": "pan", "label": "Company PAN", "group": "Customer KYC", "required": True},
        {"key": "gst", "label": "GST Registration & Returns", "group": "Customer KYC", "required": True},
        {"key": "udyam", "label": "Udyam Registration (MSME)", "group": "Customer KYC", "required": False},
        {"key": "property_proof", "label": "Registered Lease / Property Tax", "group": "Customer KYC", "required": True},
        {"key": "electricity_bill", "label": "Latest 12 months Electricity Bills", "group": "Technical KYC", "required": True},
        {"key": "sanctioned_load", "label": "DISCOM Sanctioned Load Certificate", "group": "Technical KYC", "required": True},
        {"key": "site_geo", "label": "Site Geo-tagging & Drone/Shadow Analysis", "group": "Technical KYC", "required": False},
        {"key": "balance_sheet", "label": "3 Years CA-Audited Balance Sheet & P&L", "group": "Financial KYC", "required": True},
        {"key": "bank_statement", "label": "12 months Bank Statement (AA)", "group": "Financial KYC", "required": True},
    ],
}


# --------------------------------------------------------------------------- #
# Core calculation
# --------------------------------------------------------------------------- #
class EpcIn(BaseModel):
    monthly_bill: Optional[float] = None
    monthly_units: Optional[float] = None
    tariff: float = 8.0
    roof_area_sqft: Optional[float] = None
    capacity_override: Optional[float] = None
    segment: str = "residential"     # residential | commercial
    system_type: str = "ongrid"      # ongrid | hybrid | offgrid
    tier: str = "standard"           # premium | standard | budget
    autonomy_days: float = 1.0       # battery backup autonomy
    loan_enabled: bool = True
    down_payment_percent: float = 20.0
    tenure_years: Optional[int] = None
    interest_rate: Optional[float] = None
    customer_name: Optional[str] = None
    site_address: Optional[str] = None
    state: str = "Maharashtra"
    discom: Optional[str] = None
    contact: Optional[str] = None


def _emi(principal: float, annual_rate: float, years: int) -> float:
    r = annual_rate / 12 / 100
    n = years * 12
    if n <= 0:
        return 0.0
    if r == 0:
        return principal / n
    return principal * r * (1 + r) ** n / ((1 + r) ** n - 1)


def _residential_subsidy(cap_kwp: float) -> int:
    if cap_kwp <= 0:
        return 0
    s = min(cap_kwp, 2) * 30000 + max(min(cap_kwp, 3) - 2, 0) * 18000
    return int(round(min(s, 78000)))


def _build_boq(cap_kwp, tier, system_type, daily_kwh, autonomy_days):
    t = TIERS[tier]
    mod_count = max(1, math.ceil(cap_kwp * 1000 / t["module_wp"]))
    actual_wp = mod_count * t["module_wp"]
    items = []

    def add(item, spec, brand, qty, unit, rate):
        items.append({"item": item, "spec": spec, "brand": brand, "qty": round(qty, 2),
                      "unit": unit, "rate": round(rate, 2), "amount": round(qty * rate, 2)})

    add("Solar PV Modules", f'{t["module_wp"]} Wp {t["module_tech"]} · ALMM · IEC 61215/61730',
        t["module_brand"], mod_count, "nos", t["module_rate_per_wp"] * t["module_wp"])
    inv_kw = max(1, round(cap_kwp))
    inv_type = "Hybrid" if system_type in ("hybrid", "offgrid") else "On-Grid"
    add(f"Solar {inv_type} Inverter", "MPPT >98.5% · IEC 62109 · IP65/66",
        t["inverter_brand"], inv_kw, "kW", t["inverter_rate_per_kw"])
    add("Mounting Structure", f'{t["structure_brand"]} ≥80 micron · wind 150 km/h · seasonal tilt',
        t["structure_brand"], cap_kwp, "kWp", t["structure_rate_per_kw"])
    add("DC Cables & Connectors", "Tinned Cu · EN 50618 · 4/6 mm² · MC4",
        "Polycab / Lapp", cap_kwp, "kWp", t["dc_rate_per_kw"])
    add("AC Cables (Armoured)", "Armoured XLPE Cu/Al",
        "Polycab / Havells", cap_kwp, "kWp", t["ac_rate_per_kw"])
    add("Protection (AJB/SPD/MCB)", "IP65 AJB · SPD Class II · MCB/MCCB",
        t["protection_brand"], cap_kwp, "kWp", t["protection_rate_per_kw"])
    add("Chemical Earthing (3 Pits)", "AC / DC / LA pits + chemical compound",
        "Ashlok / JMV", 3, "pits", t["earthing_pit_rate"])
    add("Lightning Arrester", t["la_type"], "JMV / OBO", 1, "nos", t["la_rate"])
    add("Net-Meter / Bi-Directional Kit", "DISCOM-approved bi-directional meter",
        "Genus / Secure", 1, "set", t["netmeter_rate"])
    add("Installation, Civil & Freight", "Erection · commissioning · civil · transport",
        "2click EPC", cap_kwp, "kWp", t["install_rate_per_kw"])

    battery_kwh = 0
    if system_type in ("hybrid", "offgrid"):
        battery_kwh = max(1, math.ceil(daily_kwh * autonomy_days / 0.8))
        add("LiFePO4 Battery Bank", ">6000 cycles @80% DoD · integrated BMS",
            t["battery_brand"], battery_kwh, "kWh", t["battery_rate_per_kwh"])

    for i, it in enumerate(items, 1):
        it["sr"] = i
    subtotal = round(sum(it["amount"] for it in items), 2)
    return items, subtotal, actual_wp, mod_count, battery_kwh


def compute_epc(x: EpcIn) -> dict:
    tier = x.tier if x.tier in TIERS else "standard"
    system_type = x.system_type if x.system_type in ("ongrid", "hybrid", "offgrid") else "ongrid"
    segment = x.segment if x.segment in ("residential", "commercial") else "residential"
    tariff = max(float(x.tariff or 8.0), 1.0)

    if x.monthly_units and x.monthly_units > 0:
        daily = float(x.monthly_units) / 30.0
    elif x.monthly_bill and x.monthly_bill > 0:
        daily = float(x.monthly_bill) / (tariff * 30.0)
    else:
        daily = 0.0

    required_kwp = daily / (PEAK_SUN_HOURS * SYSTEM_EFFICIENCY) if daily else 0.0
    capacity = float(x.capacity_override) if x.capacity_override else required_kwp
    roof_cap = (float(x.roof_area_sqft) / AREA_PER_KWP) if x.roof_area_sqft else None
    roof_limited = bool(roof_cap and capacity > roof_cap)
    if roof_limited:
        capacity = roof_cap
    capacity = round(max(capacity, 0.5), 2)

    items, subtotal, actual_wp, mod_count, battery_kwh = _build_boq(
        capacity, tier, system_type, daily, x.autonomy_days)

    # Generation + 25-yr degradation
    daily_per_kwp = PEAK_SUN_HOURS * PERFORMANCE_RATIO
    annual_y1 = capacity * daily_per_kwp * 365
    yearly, lifetime_kwh, lifetime_savings, cum = [], 0.0, 0.0, 0.0
    for y in range(1, 26):
        factor = (1 - DEGRADATION) ** (y - 1)
        gen = annual_y1 * factor
        rate = tariff * ((1 + TARIFF_ESCALATION) ** (y - 1))
        sav = gen * rate
        lifetime_kwh += gen
        lifetime_savings += sav
        cum += sav
        yearly.append({"year": y, "generation_kwh": round(gen), "savings": round(sav),
                       "cumulative_savings": round(cum)})

    gst = round(subtotal * GST_RATE, 2)
    total = round(subtotal + gst, 2)

    subsidy = _residential_subsidy(capacity) if segment == "residential" else 0
    net_cost = round(total - subsidy, 2)

    # payback (vs net cost, using escalating savings)
    payback = None
    run = 0.0
    for row in yearly:
        run += row["savings"]
        if run >= net_cost:
            payback = row["year"]
            break
    payback = payback or 25

    # Financing
    financing = {"enabled": bool(x.loan_enabled)}
    if x.loan_enabled and net_cost > 0:
        if segment == "residential":
            rate = float(x.interest_rate) if x.interest_rate else 7.5
            tenure = int(x.tenure_years) if x.tenure_years else 10
            tenure = min(tenure, 10)
            scheme = "Jan Samarth / Bank Rooftop Solar Loan (collateral-free)"
        else:
            rate = float(x.interest_rate) if x.interest_rate else 10.0
            tenure = int(x.tenure_years) if x.tenure_years else 7
            scheme = "CGTMSE / SIDBI 4E / SBI Surya Shakti (MSME term loan)"
        down = round(net_cost * float(x.down_payment_percent) / 100, 2)
        principal = round(net_cost - down, 2)
        emi = round(_emi(principal, rate, tenure), 2)
        total_payment = round(emi * tenure * 12, 2)
        financing.update({
            "scheme": scheme, "down_payment": down, "principal": principal,
            "interest_rate": rate, "tenure_years": tenure, "emi": emi,
            "total_interest": round(total_payment - principal, 2), "total_payment": total_payment,
        })

    result = {
        "generated_at": iso(now_utc()),
        "inputs": {
            "segment": segment, "system_type": system_type, "tier": tier, "tier_label": TIERS[tier]["label"],
            "tariff": tariff, "monthly_bill": x.monthly_bill, "monthly_units": x.monthly_units,
            "roof_area_sqft": x.roof_area_sqft, "autonomy_days": x.autonomy_days,
            "customer_name": x.customer_name, "site_address": x.site_address,
            "state": x.state, "discom": x.discom, "contact": x.contact,
        },
        "sizing": {
            "daily_consumption_kwh": round(daily, 2),
            "required_capacity_kwp": round(required_kwp, 2),
            "recommended_capacity_kwp": capacity,
            "area_required_sqft": round(capacity * AREA_PER_KWP),
            "roof_area_sqft": x.roof_area_sqft, "roof_limited": roof_limited,
            "module_count": mod_count, "module_wp": TIERS[tier]["module_wp"],
            "installed_wp": actual_wp, "battery_kwh": battery_kwh,
            "peak_sun_hours": PEAK_SUN_HOURS, "performance_ratio": PERFORMANCE_RATIO,
        },
        "generation": {
            "daily_kwh": round(capacity * daily_per_kwp, 1),
            "monthly_kwh": round(annual_y1 / 12),
            "annual_kwh_y1": round(annual_y1),
            "lifetime_kwh": round(lifetime_kwh),
            "degradation_percent": round(DEGRADATION * 100, 2),
            "specific_yield": round(daily_per_kwp * 365),
            "yearly": yearly,
        },
        "environment": {
            "co2_offset_tonnes_year": round(annual_y1 * CO2_PER_KWH / 1000, 2),
            "co2_offset_tonnes_25yr": round(lifetime_kwh * CO2_PER_KWH / 1000, 1),
            "trees_equivalent": round(annual_y1 * CO2_PER_KWH / 22),
        },
        "boq": {"tier": tier, "tier_label": TIERS[tier]["label"], "items": items,
                "subtotal": subtotal, "gst_rate": GST_RATE, "gst": gst, "total": total},
        "pricing": {"total": total, "subsidy": subsidy, "net_cost": net_cost,
                    "per_watt": round(total / max(actual_wp, 1), 2)},
        "subsidy_detail": {
            "scheme": "PM Surya Ghar: Muft Bijli Yojana" if segment == "residential" else "Not applicable (C&I)",
            "amount": subsidy,
            "slabs": {"1kW": 30000, "2kW": 60000, "3kW+": 78000},
            "note": "Central subsidy for residential rooftop; capped at ₹78,000 for 3 kW & above."
        },
        "financing": financing,
        "payback_years": payback,
        "roi_25yr": round(lifetime_savings - net_cost, 2),
        "lifetime_savings": round(lifetime_savings),
        "kyc_checklist": KYC_CHECKLIST[segment],
    }

    if segment == "commercial":
        ad_benefit = round(subtotal * 0.40 * CORP_TAX_RATE, 2)  # 40% accelerated depreciation tax saving (yr-1)
        gst_itc = gst
        result["commercial"] = {
            "applicable": True,
            "accelerated_depreciation_benefit": ad_benefit,
            "accelerated_depreciation_percent": 40,
            "corporate_tax_rate": round(CORP_TAX_RATE * 100),
            "gst_itc": gst_itc,
            "net_effective_cost": round(total - gst_itc - ad_benefit, 2),
            "note": "40% Accelerated Depreciation (yr-1 tax shield) + full GST Input Tax Credit for C&I."
        }
    return result


# --------------------------------------------------------------------------- #
# Public estimate + config
# --------------------------------------------------------------------------- #
@router.get("/config")
async def epc_config():
    return {
        "tiers": {k: {"label": v["label"], "module_wp": v["module_wp"],
                      "module_tech": v["module_tech"], "module_brand": v["module_brand"]}
                  for k, v in TIERS.items()},
        "constants": {"peak_sun_hours": PEAK_SUN_HOURS, "area_per_kwp": AREA_PER_KWP,
                      "degradation_percent": round(DEGRADATION * 100, 2), "gst_rate": GST_RATE},
        "subsidy_slabs": {"1kW": 30000, "2kW": 60000, "3kW+": 78000},
        "kyc": KYC_CHECKLIST,
    }


@router.post("/estimate")
async def epc_estimate(body: EpcIn):
    return compute_epc(body)


# --------------------------------------------------------------------------- #
# Proposals (persisted per user)
# --------------------------------------------------------------------------- #
async def _proposal_number():
    year = now_utc().year
    n = await _db.solar_proposals.count_documents({}) + 1
    return f"SOL-{year}-{n:04d}"


@router.post("/proposals")
async def create_proposal(body: EpcIn, request: Request):
    user = await _get_current_user(request)
    result = compute_epc(body)
    doc = {
        "id": new_id("sol"), "proposal_no": await _proposal_number(),
        "user_id": user["id"], "user_email": user["email"],
        "company_id": user.get("company_id", "company_default"),
        "inputs": body.model_dump(), "result": result,
        "capacity_kwp": result["sizing"]["recommended_capacity_kwp"],
        "net_cost": result["pricing"]["net_cost"], "status": "draft",
        "created_at": iso(now_utc()), "updated_at": iso(now_utc()),
    }
    await _db.solar_proposals.insert_one(dict(doc))
    doc.pop("_id", None)
    return doc


@router.get("/proposals")
async def list_proposals(request: Request):
    user = await _get_current_user(request)
    q = {} if user.get("role") == "super_admin" else {"user_id": user["id"]}
    rows = await _db.solar_proposals.find(q, {"_id": 0}).sort("created_at", -1).to_list(200)
    return rows


async def _get_owned_proposal(pid, user):
    p = await _db.solar_proposals.find_one({"id": pid}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Proposal not found")
    if user.get("role") != "super_admin" and p["user_id"] != user["id"]:
        raise HTTPException(403, "Forbidden")
    return p


@router.get("/proposals/{pid}")
async def get_proposal(pid: str, request: Request):
    user = await _get_current_user(request)
    return await _get_owned_proposal(pid, user)


@router.delete("/proposals/{pid}")
async def delete_proposal(pid: str, request: Request):
    user = await _get_current_user(request)
    await _get_owned_proposal(pid, user)
    await _db.solar_proposals.delete_one({"id": pid})
    return {"ok": True}


# --------------------------------------------------------------------------- #
# PDF: Proposal + Bank-ready DPR (reportlab platypus)
# --------------------------------------------------------------------------- #
def _pdf(proposal: dict, kind: str) -> bytes:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.units import mm
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle)

    r = proposal["result"]
    inp, sz, gen = r["inputs"], r["sizing"], r["generation"]
    boq, pr, fin = r["boq"], r["pricing"], r["financing"]
    ORANGE = colors.HexColor("#FF5A1F")
    DARK = colors.HexColor("#111827")
    styles = getSampleStyleSheet()
    h1 = ParagraphStyle("h1", parent=styles["Title"], textColor=ORANGE, fontSize=20, spaceAfter=2)
    h2 = ParagraphStyle("h2", parent=styles["Heading2"], textColor=DARK, fontSize=12, spaceBefore=10, spaceAfter=4)
    small = ParagraphStyle("small", parent=styles["Normal"], fontSize=8, textColor=colors.HexColor("#6B7280"))
    body = ParagraphStyle("body", parent=styles["Normal"], fontSize=9)

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=16 * mm, bottomMargin=14 * mm,
                            leftMargin=16 * mm, rightMargin=16 * mm)
    el = []
    title = "Bank-Ready Detailed Project Report (DPR)" if kind == "dpr" else "Solar EPC Proposal"
    el.append(Paragraph("2click.in Solar", h1))
    el.append(Paragraph(f"{title} · {proposal.get('proposal_no','')}", body))
    el.append(Paragraph(f"Generated {now_utc().strftime('%d %b %Y')} · System-generated engineering estimate", small))
    el.append(Spacer(1, 6))

    def kv_table(rows):
        t = Table(rows, colWidths=[70 * mm, 100 * mm])
        t.setStyle(TableStyle([
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#6B7280")),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4), ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("LINEBELOW", (0, 0), (-1, -1), 0.4, colors.HexColor("#E5E7EB")),
        ]))
        return t

    def money(v): return f"Rs {v:,.0f}"

    el.append(Paragraph("Customer & Site", h2))
    el.append(kv_table([
        ["Customer", inp.get("customer_name") or "-"],
        ["Site / Address", inp.get("site_address") or "-"],
        ["State / DISCOM", f'{inp.get("state","-")} · {inp.get("discom") or "-"}'],
        ["Segment / System", f'{inp.get("segment","").title()} · {inp.get("system_type","").title()} · {boq["tier_label"]}'],
    ]))

    el.append(Paragraph("System Sizing", h2))
    el.append(kv_table([
        ["Recommended Capacity", f'{sz["recommended_capacity_kwp"]} kWp'],
        ["Modules", f'{sz["module_count"]} × {sz["module_wp"]} Wp ({sz["installed_wp"]} Wp installed)'],
        ["Rooftop Area Needed", f'{sz["area_required_sqft"]} sq.ft'],
        ["Daily Consumption", f'{sz["daily_consumption_kwh"]} kWh/day'],
    ] + ([["Battery Bank", f'{sz["battery_kwh"]} kWh LiFePO4']] if sz["battery_kwh"] else [])))

    el.append(Paragraph("Generation & Savings (25-yr, 0.55% degradation)", h2))
    el.append(kv_table([
        ["Year-1 Generation", f'{gen["annual_kwh_y1"]:,} kWh ({gen["monthly_kwh"]:,}/mo)'],
        ["Specific Yield", f'{gen["specific_yield"]:,} kWh/kWp/yr'],
        ["Lifetime Generation", f'{gen["lifetime_kwh"]:,} kWh'],
        ["Lifetime Savings", money(r["lifetime_savings"])],
        ["Payback Period", f'{r["payback_years"]} years'],
        ["CO2 Offset", f'{r["environment"]["co2_offset_tonnes_25yr"]} T over 25 yr'],
    ]))

    el.append(Paragraph(f"Bill of Quantities — {boq['tier_label']}", h2))
    data = [["#", "Component / Specification", "Brand", "Qty", "Rate", "Amount"]]
    for it in boq["items"]:
        data.append([str(it["sr"]),
                     Paragraph(f'<b>{it["item"]}</b><br/><font size=7 color="#6B7280">{it["spec"]}</font>', small),
                     it["brand"], f'{it["qty"]:g} {it["unit"]}', f'{it["rate"]:,.0f}', f'{it["amount"]:,.0f}'])
    t = Table(data, colWidths=[8 * mm, 74 * mm, 30 * mm, 22 * mm, 18 * mm, 22 * mm], repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), DARK), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTSIZE", (0, 0), (-1, -1), 8), ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ALIGN", (3, 0), (-1, -1), "RIGHT"), ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4), ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#E5E7EB")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F9FAFB")]),
    ]))
    el.append(t)

    el.append(Paragraph("Pricing & Financing", h2))
    price_rows = [
        ["Hardware + Installation (subtotal)", money(boq["subtotal"])],
        [f'GST ({round(boq["gst_rate"]*100,1)}%)', money(boq["gst"])],
        ["Total Project Cost", money(boq["total"])],
    ]
    if pr["subsidy"]:
        price_rows.append(["PM Surya Ghar Subsidy", f'- {money(pr["subsidy"])}'])
    price_rows.append(["Net Cost to Customer", money(pr["net_cost"])])
    if fin.get("enabled") and fin.get("emi"):
        price_rows += [
            ["Loan Scheme", fin["scheme"]],
            ["Down Payment", money(fin["down_payment"])],
            ["Loan Amount", money(fin["principal"])],
            [f'EMI @ {fin["interest_rate"]}% × {fin["tenure_years"]} yr', f'{money(fin["emi"])} / month'],
        ]
    if r.get("commercial", {}).get("applicable"):
        c = r["commercial"]
        price_rows += [
            ["40% Accelerated Depreciation (tax shield)", f'- {money(c["accelerated_depreciation_benefit"])}'],
            ["GST Input Tax Credit", f'- {money(c["gst_itc"])}'],
            ["Net Effective Cost (C&I)", money(c["net_effective_cost"])],
        ]
    el.append(kv_table(price_rows))

    if kind == "dpr":
        el.append(Paragraph("25-Year Cashflow (indicative)", h2))
        cf = [["Yr", "Generation (kWh)", "Savings (Rs)", "Cumulative (Rs)"]]
        for row in r["generation"]["yearly"][::2]:  # every 2nd year to fit
            cf.append([str(row["year"]), f'{row["generation_kwh"]:,}',
                       f'{row["savings"]:,}', f'{row["cumulative_savings"]:,}'])
        tt = Table(cf, colWidths=[16 * mm, 45 * mm, 45 * mm, 48 * mm], repeatRows=1)
        tt.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), DARK), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTSIZE", (0, 0), (-1, -1), 8), ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
            ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#E5E7EB")),
        ]))
        el.append(tt)
        el.append(Paragraph("Assumptions & Risk", h2))
        el.append(Paragraph(
            "Peak sun hours 4.5, performance ratio 0.8, tariff escalation 3%/yr, module degradation 0.55%/yr. "
            "Actual generation depends on site irradiance, shading and O&M. Subsidy subject to PM Surya Ghar norms and "
            "DISCOM approval. Loan terms indicative — subject to lender credit appraisal. This DPR is an engineering "
            "estimate for financing discussion and is not a PVSyst-certified simulation.", body))

    el.append(Spacer(1, 8))
    el.append(Paragraph(
        "This is a system-generated engineering estimate by 2click.in Solar. Figures are indicative and subject to "
        "site survey, PVSyst simulation and DISCOM/lender approval.", small))
    doc.build(el)
    return buf.getvalue()


@router.get("/proposals/{pid}/pdf")
async def proposal_pdf(pid: str, request: Request):
    user = await _get_current_user(request)
    p = await _get_owned_proposal(pid, user)
    pdf = _pdf(p, "proposal")
    return Response(content=pdf, media_type="application/pdf",
                    headers={"Content-Disposition": f'inline; filename="Proposal-{p.get("proposal_no","")}.pdf"'})


@router.get("/proposals/{pid}/dpr")
async def proposal_dpr(pid: str, request: Request):
    user = await _get_current_user(request)
    p = await _get_owned_proposal(pid, user)
    pdf = _pdf(p, "dpr")
    return Response(content=pdf, media_type="application/pdf",
                    headers={"Content-Disposition": f'inline; filename="DPR-{p.get("proposal_no","")}.pdf"'})


# --------------------------------------------------------------------------- #
# KYC document upload (Emergent object storage)
# --------------------------------------------------------------------------- #
STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
APP_NAME = "2click-solar"
_storage_key = None

MIME = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "webp": "image/webp",
        "pdf": "application/pdf", "csv": "text/csv", "txt": "text/plain"}


def init_storage(force: bool = False):
    global _storage_key
    if _storage_key and not force:
        return _storage_key
    resp = requests.post(f"{STORAGE_URL}/init",
                         json={"emergent_key": os.environ.get("EMERGENT_LLM_KEY")}, timeout=30)
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key


def init_storage_safe():
    try:
        init_storage()
        logger.info("Solar KYC object storage initialized")
    except Exception as e:
        logger.warning("Solar storage init failed (uploads will retry): %s", str(e))


def _put_object(path, data, content_type):
    key = init_storage()
    resp = requests.put(f"{STORAGE_URL}/objects/{path}",
                        headers={"X-Storage-Key": key, "Content-Type": content_type}, data=data, timeout=120)
    if resp.status_code == 404:  # dead key — mint & retry once
        key = init_storage(force=True)
        resp = requests.put(f"{STORAGE_URL}/objects/{path}",
                            headers={"X-Storage-Key": key, "Content-Type": content_type}, data=data, timeout=120)
    resp.raise_for_status()
    return resp.json()


def _get_object(path):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


@router.post("/proposals/{pid}/kyc")
async def upload_kyc(pid: str, request: Request, doc_type: str = Query(...), file: UploadFile = File(...)):
    user = await _get_current_user(request)
    await _get_owned_proposal(pid, user)
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "bin"
    content_type = file.content_type or MIME.get(ext, "application/octet-stream")
    data = await file.read()
    if len(data) > 15 * 1024 * 1024:
        raise HTTPException(400, "File too large (max 15 MB)")
    path = f"{APP_NAME}/kyc/{user['id']}/{pid}/{uuid.uuid4().hex}.{ext}"
    try:
        result = await asyncio.to_thread(_put_object, path, data, content_type)
    except Exception as e:
        logger.error("KYC upload failed: %s", str(e))
        raise HTTPException(502, "Upload failed. Please try again.")
    doc = {
        "id": new_id("kyc"), "proposal_id": pid, "user_id": user["id"], "doc_type": doc_type,
        "storage_path": result["path"], "original_filename": file.filename,
        "content_type": content_type, "size": result.get("size", len(data)),
        "is_deleted": False, "created_at": iso(now_utc()),
    }
    await _db.solar_kyc.insert_one(dict(doc))
    doc.pop("_id", None)
    return doc


@router.get("/proposals/{pid}/kyc")
async def list_kyc(pid: str, request: Request):
    user = await _get_current_user(request)
    p = await _get_owned_proposal(pid, user)
    docs = await _db.solar_kyc.find({"proposal_id": pid, "is_deleted": False}, {"_id": 0}).to_list(200)
    segment = (p.get("inputs") or {}).get("segment", "residential")
    return {"checklist": KYC_CHECKLIST.get(segment, KYC_CHECKLIST["residential"]), "uploaded": docs}


@router.delete("/kyc/{file_id}")
async def delete_kyc(file_id: str, request: Request):
    user = await _get_current_user(request)
    rec = await _db.solar_kyc.find_one({"id": file_id}, {"_id": 0})
    if not rec or (user.get("role") != "super_admin" and rec["user_id"] != user["id"]):
        raise HTTPException(404, "Not found")
    await _db.solar_kyc.update_one({"id": file_id}, {"$set": {"is_deleted": True}})
    return {"ok": True}


@router.get("/kyc/{file_id}/download")
async def download_kyc(file_id: str, request: Request, auth: Optional[str] = Query(None),
                       authorization: Optional[str] = Header(None)):
    if auth and not request.headers.get("Authorization"):
        request.scope["headers"] = list(request.scope["headers"]) + [(b"authorization", f"Bearer {auth}".encode())]
    user = await _get_current_user(request)
    rec = await _db.solar_kyc.find_one({"id": file_id, "is_deleted": False}, {"_id": 0})
    if not rec or (user.get("role") != "super_admin" and rec["user_id"] != user["id"]):
        raise HTTPException(404, "Not found")
    try:
        data, ct = await asyncio.to_thread(_get_object, rec["storage_path"])
    except Exception:
        raise HTTPException(502, "Could not fetch file")
    return Response(content=data, media_type=rec.get("content_type", ct),
                    headers={"Content-Disposition": f'inline; filename="{rec["original_filename"]}"'})


async def ensure_indexes():
    for f in ["user_id", "created_at"]:
        try:
            await _db.solar_proposals.create_index(f)
        except Exception:
            pass
    for f in ["proposal_id", "user_id"]:
        try:
            await _db.solar_kyc.create_index(f)
        except Exception:
            pass
