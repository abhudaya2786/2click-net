/** Print & share helpers for enrollment forms and agreements */

export function printHtml(title, bodyHtml) {
  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) {
    return false;
  }
  w.document.write(`<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>${escapeHtml(title)}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:system-ui,-apple-system,sans-serif;padding:28px;color:#111;line-height:1.55;max-width:720px;margin:0 auto}
  h1{font-size:22px;margin:0 0 8px} h2{font-size:15px;margin:24px 0 8px;border-bottom:1px solid #ddd;padding-bottom:4px}
  p{margin:8px 0} .muted{color:#555;font-size:12px} .brand{font-weight:800;color:#ea580c}
  table{width:100%;border-collapse:collapse;margin:12px 0;font-size:13px}
  td,th{border:1px solid #ddd;padding:8px 10px;text-align:left;vertical-align:top}
  th{background:#f5f5f5;font-size:11px;text-transform:uppercase;letter-spacing:.04em}
  .badge{display:inline-block;background:#f3f4f6;padding:2px 8px;border-radius:4px;font-size:11px;font-family:monospace}
  @media print{body{padding:12px}}
</style></head><body>${bodyHtml}</body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => {
    w.print();
    w.close();
  }, 300);
  return true;
}

export function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
  return Promise.resolve();
}

export function shareViaEmail(subject, body) {
  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function buildAgreementPrintHtml(agreement, lang = "en") {
  const hi = lang === "hi";
  const title = hi ? agreement.title_hi || agreement.title : agreement.title;
  const content = hi ? agreement.content_hi || agreement.content : agreement.content;
  return `
    <p class="muted"><span class="brand">2click.in</span> · Agreement · v${escapeHtml(agreement.version)}</p>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(content)}</p>
    <p class="muted">Printed ${new Date().toLocaleString()}</p>
  `;
}

export function buildEnrollmentReceiptHtml(data, lang = "en") {
  const hi = lang === "hi";
  const L = (en, h) => hi ? h : en;
  const user = data.user || {};
  const shop = data.shop || null;
  const agreements = data.agreements || [];
  const cats = (data.categories || []).map((c) => c.name || c).join(", ");

  let shopBlock = "";
  if (shop) {
    shopBlock = `
      <h2>${L("Shop enrollment", "दुकान पंजीकरण")}</h2>
      <table>
        <tr><th>${L("Shop name", "दुकान")}</th><td>${escapeHtml(shop.name)}</td></tr>
        <tr><th>${L("Type", "प्रकार")}</th><td>${escapeHtml(shop.shop_type)}</td></tr>
        <tr><th>GST</th><td>${escapeHtml(shop.gst_number || "—")}</td></tr>
        <tr><th>PAN</th><td>${escapeHtml(shop.pan_number || "—")}</td></tr>
        <tr><th>${L("City", "शहर")}</th><td>${escapeHtml(shop.city || "—")}, ${escapeHtml(shop.state || "")}</td></tr>
        <tr><th>${L("Status", "स्थिति")}</th><td><span class="badge">${escapeHtml(shop.status || data.enrollment_status || "—")}</span></td></tr>
      </table>
    `;
  }

  const agrRows = agreements.map((a) => `
    <tr>
      <td>${escapeHtml(a.title || a.agreement_code || a.code)}</td>
      <td>v${escapeHtml(a.version || "1.0")}</td>
      <td>${escapeHtml(a.accepted_at ? new Date(a.accepted_at).toLocaleString() : L("Accepted", "स्वीकृत"))}</td>
    </tr>
  `).join("");

  return `
    <p class="muted"><span class="brand">2click.in</span> · ${L("Enrollment receipt", "पंजीकरण रसीद")}</p>
    <h1>${L("Registration & enrollment summary", "पंजीकरण और नामांकन सारांश")}</h1>
    <p class="muted">${L("Generated", "जनरेट")}: ${new Date().toLocaleString()}</p>

    <h2>${L("Account holder", "खाताधारक")}</h2>
    <table>
      <tr><th>${L("Name", "नाम")}</th><td>${escapeHtml(user.name || data.name)}</td></tr>
      <tr><th>${L("Email", "ईमेल")}</th><td>${escapeHtml(user.email || data.email)}</td></tr>
      <tr><th>${L("Phone", "फ़ोन")}</th><td>${escapeHtml(user.phone || data.phone || "—")}</td></tr>
      <tr><th>${L("Mode", "प्रकार")}</th><td>${escapeHtml(data.mode || user.enrollment_mode || "user")}</td></tr>
      <tr><th>${L("User type", "यूज़र प्रकार")}</th><td>${escapeHtml(user.user_type || data.user_type || "—")}</td></tr>
      ${cats ? `<tr><th>${L("Categories", "श्रेणियाँ")}</th><td>${escapeHtml(cats)}</td></tr>` : ""}
      <tr><th>${L("Enrollment status", "स्थिति")}</th><td><span class="badge">${escapeHtml(user.enrollment_status || data.enrollment_status || "—")}</span></td></tr>
    </table>

    ${shopBlock}

    <h2>${L("Agreements accepted", "स्वीकृत समझौते")}</h2>
    <table>
      <thead><tr><th>${L("Agreement", "समझौता")}</th><th>${L("Version", "संस्करण")}</th><th>${L("When", "समय")}</th></tr></thead>
      <tbody>${agrRows || `<tr><td colspan="3">${L("None recorded", "कोई रिकॉर्ड नहीं")}</td></tr>`}</tbody>
    </table>

    <p class="muted">${L("This is a system-generated receipt. For support: www.2click.in/contact", "यह सिस्टम जनरेट रसीद है। सहायता: www.2click.in/contact")}</p>
  `;
}

export function buildEnrollmentShareText(data, lang = "en") {
  const hi = lang === "hi";
  const user = data.user || {};
  const shop = data.shop;
  const lines = hi
    ? [
        "2click.in पंजीकरण",
        `नाम: ${user.name || data.name || ""}`,
        shop ? `दुकान: ${shop.name}` : "",
        `ईमेल: ${user.email || data.email || ""}`,
        `स्थिति: ${user.enrollment_status || data.enrollment_status || ""}`,
        "www.2click.in",
      ]
    : [
        "2click.in Enrollment",
        `Name: ${user.name || data.name || ""}`,
        shop ? `Shop: ${shop.name}` : "",
        `Email: ${user.email || data.email || ""}`,
        `Status: ${user.enrollment_status || data.enrollment_status || ""}`,
        "www.2click.in",
      ];
  return lines.filter(Boolean).join("\n");
}

export function buildAgreementsBundleHtml(agreements, lang = "en") {
  const hi = lang === "hi";
  const parts = agreements.map((a) => {
    const title = hi ? a.title_hi || a.title : a.title;
    const content = hi ? a.content_hi || a.content : a.content;
    return `<h2>${escapeHtml(title)} <span class="badge">v${escapeHtml(a.version)}</span></h2><p>${escapeHtml(content)}</p>`;
  }).join("");
  return `
    <p class="muted"><span class="brand">2click.in</span> · ${hi ? "सभी समझौते" : "All agreements"}</p>
    <h1>${hi ? "पंजीकरण समझौते" : "Enrollment agreements"}</h1>
    ${parts}
    <p class="muted">${new Date().toLocaleString()}</p>
  `;
}
