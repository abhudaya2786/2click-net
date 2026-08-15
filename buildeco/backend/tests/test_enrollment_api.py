"""Enrollment auth dependency and agreement aliases."""
import requests
from auth_helpers import login, admin_login, CUSTOMER, API


def test_enrollment_me_ok():
    tok, _ = login(*CUSTOMER)
    r = requests.get(f"{API}/enrollment/me", headers={"Authorization": f"Bearer {tok}"}, timeout=15)
    assert r.status_code == 200, r.text
    d = r.json()
    assert "user_id" in d and "shops" in d


def test_enrollment_receipt_ok():
    tok, _ = login(*CUSTOMER)
    r = requests.get(f"{API}/enrollment/receipt", headers={"Authorization": f"Bearer {tok}"}, timeout=15)
    assert r.status_code == 200, r.text
    assert "user" in r.json()


def test_agreement_aliases():
    for code in ("platform_terms", "privacy_policy", "terms", "privacy", "client_agreement"):
        r = requests.get(f"{API}/enrollment/agreements/{code}", timeout=15)
        assert r.status_code == 200, f"{code} {r.status_code} {r.text}"


def test_admin_shops_list():
    tok, _ = admin_login("admin@buildecogroup.com", "Be@iLxPJXWdEp!", "827871")
    r = requests.get(f"{API}/enrollment/admin/shops", headers={"Authorization": f"Bearer {tok}"}, timeout=15)
    assert r.status_code == 200, r.text
    assert isinstance(r.json(), list)
