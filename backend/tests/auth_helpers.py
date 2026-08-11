"""Shared auth helpers for backend tests."""
import os
import requests

from conftest import get_backend_url

API = f"{get_backend_url()}/api"

ADMIN = ("abbhuadaya@gmail.com", "Admin@12345")
VENDOR = ("vendor@2click.in", "Demo@12345")
CUSTOMER = ("customer@2click.in", "Demo@12345")
CONTRACTOR = ("contractor@2click.in", "Demo@12345")


def login(email, password):
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": password}, timeout=30)
    assert r.status_code == 200, f"Login failed for {email}: {r.status_code} {r.text}"
    data = r.json()
    return data["token"], data["user"]


def admin_login(email=None, password=None, access_pin=None):
    email = email or ADMIN[0]
    password = password or ADMIN[1]
    pin = access_pin if access_pin is not None else os.environ.get("ADMIN_ACCESS_PIN")
    payload = {"email": email, "password": password}
    if pin:
        payload["access_pin"] = pin
    r = requests.post(f"{API}/auth/admin/login", json=payload, timeout=30)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    data = r.json()
    if data.get("requires_otp"):
        if os.environ.get("ENABLE_TEST_OTP") == "1":
            otp_r = requests.get(f"{API}/auth/dev/latest-otp", params={"email": email}, timeout=15)
            assert otp_r.status_code == 200, otp_r.text
            code = otp_r.json()["code"]
        else:
            raise AssertionError("Admin login requires OTP; set ENABLE_TEST_OTP=1 for tests")
        r2 = requests.post(f"{API}/auth/otp/verify", json={"email": email, "code": code}, timeout=30)
        assert r2.status_code == 200, r2.text
        data = r2.json()
    return data["token"], data["user"]
