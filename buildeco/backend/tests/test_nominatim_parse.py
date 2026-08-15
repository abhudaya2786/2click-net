"""Nominatim reverse-geocode parser (Lucknow sample)."""
from site_config import _parse_nominatim


def test_parse_lucknow_nominatim():
    row = _parse_nominatim({
        "display_name": "Lucknow, Uttar Pradesh, 226001, India",
        "address": {
            "city": "Lucknow",
            "state": "Uttar Pradesh",
            "postcode": "226001",
            "country": "India",
        },
    })
    assert row["city"] == "Lucknow"
    assert row["state"] == "Uttar Pradesh"
    assert row["pincode"] == "226001"
    assert row["source"] == "nominatim"


def test_parse_town_fallback():
    row = _parse_nominatim({"address": {"town": "Vapi", "state": "Gujarat", "postcode": "396191"}})
    assert row["city"] == "Vapi"


def test_parse_empty():
    assert _parse_nominatim(None) is None
    assert _parse_nominatim({}) is None
