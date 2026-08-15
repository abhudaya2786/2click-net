"""BuildEco Solar EPC consultant proposal — sizing, brands, BOP, ROI."""
from solar_epc import EpcIn, compute_epc, BRAND_RECS


def _lucknow(**kw):
    body = dict(
        monthly_bill=5000, tariff=8, roof_area_sqft=600,
        system_type="ongrid", tier="standard", segment="residential",
        state="Uttar Pradesh", city="Lucknow",
    )
    body.update(kw)
    return compute_epc(EpcIn(**body))


def test_lucknow_standard_roof_sufficient_and_five_sections():
    r = _lucknow()
    assert r["sizing"]["sqft_per_kwp"] == 100
    assert r["sizing"]["required_capacity_kwp"] > 5
    assert r["sizing"]["roof_limited"] is False
    p = r["consultant_proposal"]
    ids = [s["id"] for s in p["sections"]]
    assert ids == ["sizing", "brands", "boq", "finance", "environment"]
    brands = " ".join(p["sections"][1]["bullets"])
    assert "Waaree" in brands and "Growatt" in brands
    assert "Mono-PERC Half-cut" in brands
    assert "Lucknow" in p["intro"]
    assert r["payback_years"] >= 1
    assert r["lifetime_savings"] > r["pricing"]["net_cost"]


def test_premium_uses_80_sqft_and_topcon_brands():
    r = _lucknow(tier="premium")
    assert r["sizing"]["sqft_per_kwp"] == 80
    text = r["consultant_proposal"]["sections"][1]["body"]
    assert "TOPCon Bifacial" in text
    assert "Jinko" in " ".join(BRAND_RECS["premium"]["panels"])
    bullets = " ".join(r["consultant_proposal"]["sections"][1]["bullets"])
    assert "Jinko" in bullets and "SolarEdge" in bullets
    assert "HDGI" in text or "Polycab" in text


def test_small_roof_is_flagged_limited():
    r = _lucknow(roof_area_sqft=200)
    assert r["sizing"]["roof_limited"] is True
    assert r["sizing"]["recommended_capacity_kwp"] < r["sizing"]["required_capacity_kwp"]
    assert "roof-limited" in r["consultant_proposal"]["sections"][0]["body"]
