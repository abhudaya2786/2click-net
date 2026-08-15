const DEMO_ITEMS = [
  {
    id: "c1",
    type: "phone_call",
    title: "फोन कॉल — राजेश जी (सीमेंट वेंडर)",
    when: "आज, 04:15 PM",
    duration: "2 मिनट 40 सेकंड",
    dialect: "शिष्ट / हिंग्लिश",
    pure_hindi:
      "राजेश जी से कल सुबह 10 बजे तक 100 बैग अल्ट्राटेक सीमेंट साइट पर भेजने और 50,000 रुपये का चेक देने पर सहमति बनी।",
    pure_english:
      "It was agreed with Rajesh ji to deliver 100 bags of UltraTech cement to the site by 10:00 AM tomorrow and to provide a cheque of ₹50,000.",
    auto_task: "कल सुबह 10:00 AM — चेक तैयार रखना",
    has_audio: true,
  },
  {
    id: "c2",
    type: "in_person_meeting",
    title: "मीटिंग — 2Click सॉफ्टवेयर डिस्कशन",
    when: "कल, 11:30 AM",
    duration: "18 मिनट",
    dialect: "हिंग्लिश",
    decision: "मुख्य निर्णय: API गेटवे और होस्टिंगर DNS सेटअप पूरा हुआ।",
    pure_hindi:
      "2Click सॉफ्टवेयर चर्चा में API गेटवे कॉन्फ़िगरेशन और Hostinger DNS सेटअप पूर्ण करने का निर्णय लिया गया।",
    pure_english:
      "In the 2Click software discussion, it was decided to complete the API gateway configuration and Hostinger DNS setup.",
    auto_task: null,
    has_audio: false,
  },
];

const feed = document.getElementById("feed");
const empty = document.getElementById("empty");
const q = document.getElementById("q");
const toastEl = document.getElementById("toast");

let items = [...DEMO_ITEMS];

function typeMeta(type) {
  if (type === "phone_call") return { cls: "call", label: "📞 फोन कॉल" };
  if (type === "in_person_meeting") return { cls: "meet", label: "🎙️ मीटिंग" };
  return { cls: "note", label: "🔊 वॉइस नोट" };
}

function toast(msg) {
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    toastEl.hidden = true;
  }, 2200);
}

function matches(item, query) {
  if (!query) return true;
  const blob = [
    item.title,
    item.pure_hindi,
    item.pure_english,
    item.decision,
    item.auto_task,
    item.dialect,
    item.when,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return blob.includes(query.toLowerCase());
}

function render(list) {
  feed.innerHTML = "";
  if (!list.length) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  list.forEach((item, i) => {
    const t = typeMeta(item.type);
    const card = document.createElement("article");
    card.className = "card";
    card.style.animationDelay = `${0.05 + i * 0.06}s`;
    card.setAttribute("role", "listitem");

    const taskHtml = item.auto_task
      ? `<div class="task">⏰ ऑटो-टास्क: ${escapeHtml(item.auto_task)}</div>`
      : "";

    const bodyHtml = item.decision
      ? `<p class="section-label">मुख्य निर्णय</p><p class="decision">${escapeHtml(item.decision)}</p>`
      : `<p class="section-label">📝 शुद्ध हिंदी ट्रांसक्रिप्ट</p><p class="transcript">${escapeHtml(item.pure_hindi || "")}</p>`;

    card.innerHTML = `
      <div class="card-head">
        <div>
          <div class="title-row">
            <span class="type-pill ${t.cls}">${t.label}</span>
          </div>
          <h2>${escapeHtml(item.title)}</h2>
          <p class="meta">🕒 ${escapeHtml(item.when)} (अवधि: ${escapeHtml(item.duration)})${item.dialect ? ` · ${escapeHtml(item.dialect)}` : ""}</p>
        </div>
      </div>
      ${bodyHtml}
      ${taskHtml}
      <div class="actions">
        <button class="btn primary" data-act="pdf" type="button">📄 PDF डाउनलोड</button>
        <button class="btn" data-act="wa" type="button">💬 WhatsApp शेयर</button>
        <button class="btn" data-act="audio" type="button" ${item.has_audio ? "" : "disabled"}>${item.has_audio ? "🔊 ऑडियो सुनें" : "🔊 ऑडियो उपलब्ध नहीं"}</button>
      </div>
    `;

    card.querySelectorAll("button[data-act]").forEach((btn) => {
      btn.addEventListener("click", () => handleAction(btn.dataset.act, item));
    });

    feed.appendChild(card);
  });
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function handleAction(act, item) {
  if (act === "pdf") {
    const text = [
      item.title,
      item.when,
      "",
      item.pure_hindi || item.decision || "",
      "",
      item.pure_english || "",
      item.auto_task ? `Task: ${item.auto_task}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${item.id}-mom.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast("ट्रांस्क्रिप्ट डाउनलोड शुरू");
    return;
  }
  if (act === "wa") {
    const msg = encodeURIComponent(
      `${item.title}\n${item.pure_hindi || item.decision || ""}\n${item.auto_task ? "Task: " + item.auto_task : ""}`,
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank", "noopener");
    return;
  }
  if (act === "audio") {
    toast(item.has_audio ? "ऑडियो प्लेबैक जल्द उपलब्ध होगा" : "इस बातचीत में ऑडियो नहीं है");
  }
}

function applyFilter() {
  render(items.filter((it) => matches(it, q.value.trim())));
}

q.addEventListener("input", applyFilter);

async function loadFromApi() {
  const params = new URLSearchParams(location.search);
  const userId = params.get("user_id");
  if (!userId) return;
  try {
    const kw = params.get("q") || "";
    const url =
      `/api/v1/conversations?user_id=${encodeURIComponent(userId)}&group_by_date=false` +
      (kw ? `&q=${encodeURIComponent(kw)}` : "");
    const res = await fetch(url);
    if (!res.ok) return;
    const data = await res.json();
    const rows = data.conversations || [];
    if (!rows.length) return;
    items = rows.map((r) => ({
      id: r.id,
      type: r.type || "voice_note",
      title:
        r.type === "phone_call"
          ? `फोन कॉल — ${r.contact_name || "संपर्क"}`
          : r.type === "in_person_meeting"
            ? `मीटिंग — ${r.contact_name || "बैठक"}`
            : `वॉइस नोट — ${r.contact_name || "नोट"}`,
      when: r.created_at ? new Date(r.created_at).toLocaleString("hi-IN") : "",
      duration: r.duration_seconds ? `${Math.round(r.duration_seconds)} सेकंड` : "—",
      dialect: r.detected_dialect || "",
      pure_hindi: r.pure_hindi_text || "",
      pure_english: r.pure_english_text || "",
      decision: r.summary || null,
      auto_task: null,
      has_audio: false,
    }));
  } catch {
    /* keep demo */
  }
}

(async () => {
  await loadFromApi();
  applyFilter();
})();
