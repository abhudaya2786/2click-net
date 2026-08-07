"""Transactional email via Emergent-managed Resend integration (async, non-blocking)."""
import os
import logging
import httpx

logger = logging.getLogger("mailer")

# Emergent managed email proxy — CONSTANT (survives deploy), never read from env.
EMAIL_BASE_URL = "https://integrations.emergentagent.com"


async def send_email(to: str, subject: str, html: str, reply_to: str | None = None) -> bool:
    key = os.environ.get("EMERGENT_EMAIL_KEY")
    from_name = os.environ.get("EMAIL_FROM_NAME", "2click.in")
    if not key:
        logger.warning("EMERGENT_EMAIL_KEY missing; email to %s skipped", to)
        return False
    payload = {"to": [to], "subject": subject, "html": html, "from_name": from_name}
    if reply_to:
        payload["contact_email"] = reply_to
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{EMAIL_BASE_URL}/api/v1/email/send",
                headers={"X-Email-Key": key},
                json=payload,
            )
        resp.raise_for_status()
        return True
    except Exception as e:
        logger.error("Email send failed to %s: %s", to, str(e))
        return False


def _wrap(title: str, body_html: str) -> str:
    return f"""
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;font-family:Arial,Helvetica,sans-serif;">
      <tr><td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;">
          <tr><td style="background:#FF5A1F;padding:18px 24px;color:#fff;font-size:20px;font-weight:bold;">2click.in</td></tr>
          <tr><td style="padding:28px 24px;color:#111827;">
            <h2 style="margin:0 0 12px;font-size:18px;">{title}</h2>
            {body_html}
          </td></tr>
          <tr><td style="padding:16px 24px;color:#9ca3af;font-size:12px;border-top:1px solid #e5e7eb;">The operating system for India's construction economy.</td></tr>
        </table>
      </td></tr>
    </table>"""


def otp_email_html(name: str, code: str) -> str:
    body = f"""
      <p style="margin:0 0 16px;font-size:14px;">Hi {name or 'there'}, use this one-time code to finish signing in:</p>
      <div style="font-size:30px;font-weight:bold;letter-spacing:6px;background:#f4f4f5;padding:14px 0;text-align:center;border-radius:4px;">{code}</div>
      <p style="margin:16px 0 0;font-size:13px;color:#6b7280;">This code expires in 10 minutes. If you didn't request it, ignore this email.</p>"""
    return _wrap("Your login verification code", body)


def reset_email_html(name: str, link: str) -> str:
    body = f"""
      <p style="margin:0 0 16px;font-size:14px;">Hi {name or 'there'}, we received a request to reset your password.</p>
      <p style="margin:0 0 20px;"><a href="{link}" style="background:#FF5A1F;color:#fff;text-decoration:none;padding:12px 22px;border-radius:4px;display:inline-block;font-size:14px;">Reset password</a></p>
      <p style="margin:0;font-size:13px;color:#6b7280;">This link expires in 1 hour. If you didn't request it, you can safely ignore this email.</p>"""
    return _wrap("Reset your password", body)
