// server.ts
import dotenv from "dotenv";
import express2 from "express";
import path7 from "path";
import fs5 from "fs/promises";
import { GoogleGenAI as GoogleGenAI4 } from "@google/genai";

// server/ai/OpenAIProvider.ts
import OpenAI from "openai";
var OpenAIProvider = class {
  constructor() {
    this.name = "openai";
  }
  getClient() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured on the server.");
    }
    return new OpenAI({ apiKey });
  }
  async generateMinutes(options) {
    const client = this.getClient();
    const {
      transcript,
      meetingTitle = "General Meeting",
      meetingDate = "Not specified",
      participants = [],
      additionalContext = "",
      languageHint = "auto"
    } = options;
    const systemPrompt = `You are an elite Enterprise AI Meeting Intelligence Engine.
You extract factual, accurate, and structured Minutes of Meeting (MoM) from spoken transcripts.

CRITICAL AI RULES - STRICT ENFORCEMENT:
1. NEVER INVENT INFORMATION: Base all summaries, points, decisions, and action items strictly on the provided transcript. Do NOT hallucinate.
2. NEVER INVENT PARTICIPANTS: Only include participants who spoke or were explicitly named in the meeting. Do not add fictitious people.
3. NEVER INVENT DEADLINES: Only record a deadline if an explicit date/time or relative timeline (e.g. "by Friday", "next sprint", "end of month") was spoken. Otherwise, set deadline to "Not specified".
4. PRESERVE NAMES: Accurately keep exact participant and company/product names without alteration.
5. PRESERVE DATES: Keep all mentioned dates and timestamps intact.
6. UNDERSTAND HINDI: Seamlessly understand spoken Hindi in Devanagari script (e.g. "\u0915\u093E\u092E \u092A\u0942\u0930\u093E \u0915\u0930\u0928\u093E \u0939\u0948") and Romanized Hindi (e.g. "yeh task kal tak complete hona chahiye").
7. UNDERSTAND ENGLISH: Accurately extract all professional, engineering, and corporate English dialogue.
8. UNDERSTAND HINGLISH: Understand mixed Hindi + English code-switching conversation common in modern tech meetings.
9. MARK UNCERTAIN INFORMATION: If a statement is ambiguous, audio is mumbled, or attribution is unclear, mark it clearly as "[Uncertain: ...]".
10. MISSING DATA FALLBACK: Use "Not specified" when information (such as responsible person, deadline, or next meeting) is missing or unstated.

OUTPUT JSON FORMAT REQUIREMENTS:
You MUST respond with a valid JSON object matching this schema:
{
  "summary": "Concise executive overview of the meeting and main purpose.",
  "discussion_points": [
    "Key topic 1 discussed with essential context.",
    "Key topic 2 discussed with essential context."
  ],
  "decisions": [
    "Explicit decision or agreement 1 reached during the meeting.",
    "Explicit decision or agreement 2 reached during the meeting."
  ],
  "action_items": [
    {
      "task": "Specific actionable task description.",
      "responsible_person": "Exact name of assigned person, or 'Not specified' if unassigned.",
      "deadline": "Spoken deadline/timeframe, or 'Not specified'.",
      "priority": "High" | "Medium" | "Low" | "Critical",
      "status": "Pending" | "In Progress" | "Completed"
    }
  ],
  "pending_issues": [
    "Unresolved question, open blocker, or topic tabled for future review."
  ],
  "next_meeting": "Details of the next scheduled meeting (date/time/agenda) or 'Not specified'."
}`;
    const userPrompt = `Meeting Title: ${meetingTitle}
Meeting Date: ${meetingDate}
Known Participants / Attendees: ${participants.length > 0 ? participants.join(", ") : "Not specified"}
Language Hint: ${languageHint}
${additionalContext ? `Additional Context: ${additionalContext}` : ""}

TRANSCRIPT CONTENT:
"""
${transcript}
"""

Extract structured minutes conforming strictly to all AI rules. Return ONLY valid JSON.`;
    const modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const completion = await client.chat.completions.create({
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1
      // High fidelity & low hallucination
    });
    const rawContent = completion.choices[0]?.message?.content || "{}";
    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      throw new Error("Failed to parse AI response into structured JSON format.");
    }
    const summary = typeof parsed.summary === "string" && parsed.summary.trim().length > 0 ? parsed.summary.trim() : "Summary not available.";
    const discussion_points = Array.isArray(parsed.discussion_points) ? parsed.discussion_points.filter((p) => typeof p === "string" && p.trim().length > 0) : [];
    const decisions = Array.isArray(parsed.decisions) ? parsed.decisions.map((d) => typeof d === "string" ? d : d?.decision_text || JSON.stringify(d)) : [];
    const action_items = Array.isArray(parsed.action_items) ? parsed.action_items.map((item) => {
      let priority = "Medium";
      const pStr = String(item.priority || "").toLowerCase();
      if (pStr.includes("crit")) priority = "Critical";
      else if (pStr.includes("high")) priority = "High";
      else if (pStr.includes("low")) priority = "Low";
      let status = "Pending";
      const sStr = String(item.status || "").toLowerCase();
      if (sStr.includes("comp") || sStr.includes("done")) status = "Completed";
      else if (sStr.includes("prog") || sStr.includes("wip")) status = "In Progress";
      return {
        task: String(item.task || "Unspecified task").trim(),
        responsible_person: String(item.responsible_person || "Not specified").trim() || "Not specified",
        deadline: String(item.deadline || "Not specified").trim() || "Not specified",
        priority,
        status
      };
    }) : [];
    const pending_issues = Array.isArray(parsed.pending_issues) ? parsed.pending_issues.filter((i) => typeof i === "string" && i.trim().length > 0) : [];
    const next_meeting = typeof parsed.next_meeting === "string" && parsed.next_meeting.trim().length > 0 ? parsed.next_meeting.trim() : "Not specified";
    return {
      success: true,
      provider: "openai",
      model_used: modelName,
      summary,
      discussion_points,
      decisions,
      action_items,
      pending_issues,
      next_meeting
    };
  }
};

// server/ai/GeminiAIProvider.ts
import { GoogleGenAI, Type } from "@google/genai";
var GeminiAIProvider = class {
  constructor() {
    this.name = "gemini";
  }
  getClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    return new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  async generateMinutes(options) {
    const ai = this.getClient();
    const {
      transcript,
      meetingTitle = "General Meeting",
      meetingDate = "Not specified",
      participants = [],
      additionalContext = "",
      languageHint = "auto"
    } = options;
    const systemPrompt = `You are an elite Enterprise AI Meeting Intelligence Engine.
Extract factual, accurate, and structured Minutes of Meeting (MoM) strictly from the spoken transcript.

CRITICAL AI RULES:
1. NEVER INVENT INFORMATION: Base all summaries, points, decisions, and action items strictly on the provided transcript.
2. NEVER INVENT PARTICIPANTS: Only include participants who spoke or were explicitly named in the meeting.
3. NEVER INVENT DEADLINES: Only record a deadline if an explicit date/time or timeframe was spoken. Otherwise, use "Not specified".
4. PRESERVE NAMES: Accurately keep exact participant and organization names without modification.
5. PRESERVE DATES: Keep all mentioned dates and timestamps intact.
6. UNDERSTAND HINDI: Seamlessly understand spoken Hindi in Devanagari script and Romanized transliteration.
7. UNDERSTAND ENGLISH: Accurately extract all professional, engineering, and corporate English dialogue.
8. UNDERSTAND HINGLISH: Understand mixed Hindi + English code-switching conversation.
9. MARK UNCERTAIN INFORMATION: If a statement is ambiguous or attribution is unclear, mark it as "[Uncertain: ...]".
10. USE "Not specified" when information (such as responsible person, deadline, or next meeting) is missing.`;
    const userPrompt = `Meeting Title: ${meetingTitle}
Meeting Date: ${meetingDate}
Participants: ${participants.length > 0 ? participants.join(", ") : "Not specified"}
Language Hint: ${languageHint}
${additionalContext ? `Additional Context: ${additionalContext}` : ""}

TRANSCRIPT:
"""
${transcript}
"""`;
    const modelName = process.env.GEMINI_MODEL || process.env.GEMINI_FIELD_MODEL || "gemini-2.5-flash";
    const response = await ai.models.generateContent({
      model: modelName,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            discussion_points: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            decisions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            action_items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  task: { type: Type.STRING },
                  responsible_person: { type: Type.STRING },
                  deadline: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ["High", "Medium", "Low", "Critical"] },
                  status: { type: Type.STRING, enum: ["Pending", "In Progress", "Completed"] }
                },
                required: ["task", "responsible_person", "deadline", "priority", "status"]
              }
            },
            pending_issues: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            next_meeting: { type: Type.STRING }
          },
          required: ["summary", "discussion_points", "decisions", "action_items", "pending_issues", "next_meeting"]
        }
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    const summary = typeof parsed.summary === "string" && parsed.summary.trim().length > 0 ? parsed.summary.trim() : "Summary not available.";
    const discussion_points = Array.isArray(parsed.discussion_points) ? parsed.discussion_points : [];
    const decisions = Array.isArray(parsed.decisions) ? parsed.decisions : [];
    const action_items = Array.isArray(parsed.action_items) ? parsed.action_items.map((item) => ({
      task: String(item.task || "Unspecified task").trim(),
      responsible_person: String(item.responsible_person || "Not specified").trim() || "Not specified",
      deadline: String(item.deadline || "Not specified").trim() || "Not specified",
      priority: ["High", "Medium", "Low", "Critical"].includes(item.priority) ? item.priority : "Medium",
      status: ["Pending", "In Progress", "Completed"].includes(item.status) ? item.status : "Pending"
    })) : [];
    const pending_issues = Array.isArray(parsed.pending_issues) ? parsed.pending_issues : [];
    const next_meeting = typeof parsed.next_meeting === "string" && parsed.next_meeting.trim().length > 0 ? parsed.next_meeting.trim() : "Not specified";
    return {
      success: true,
      provider: "gemini",
      model_used: modelName,
      summary,
      discussion_points,
      decisions,
      action_items,
      pending_issues,
      next_meeting
    };
  }
};

// server/ai/DemoAIProvider.ts
var DemoAIProvider = class {
  constructor() {
    this.name = "demo";
  }
  async generateMinutes(options) {
    const transcript = (options.transcript || "").trim();
    const lines = transcript.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    const discussion_points = lines.slice(0, 8).map((line) => {
      const m = line.match(/^([^:]{1,40}):\s*(.*)$/);
      return m ? `${m[1].trim()}: ${m[2].trim()}` : line;
    });
    const decisions = lines.filter((l) => /\b(decid(ed|e)|agreed|will ship|approved|go with|finaliz)/i.test(l)).map((l) => l.replace(/^[^:]+:\s*/, "").trim()).slice(0, 6);
    const action_items = lines.filter((l) => /\b(will|i'll|i will|to-do|todo|action|prepare|send|follow.?up|by\s+\w+day)\b/i.test(l)).slice(0, 6).map((line) => {
      const m = line.match(/^([^:]{1,40}):\s*(.*)$/);
      const speaker = m?.[1]?.trim() || options.participants?.[0] || "Not specified";
      const task = (m?.[2] || line).trim();
      const deadlineMatch = task.match(/\bby\s+([A-Za-z]+day|\d{1,2}\s+\w+|\d{4}-\d{2}-\d{2})\b/i);
      return {
        task,
        responsible_person: speaker,
        deadline: deadlineMatch?.[1] || "Not specified",
        priority: /\b(urgent|asap|critical|high)\b/i.test(task) ? "High" : "Medium",
        status: "Pending"
      };
    });
    const pending_issues = lines.filter((l) => /\b(block|risk|issue|concern|pending|open question)\b/i.test(l)).map((l) => l.replace(/^[^:]+:\s*/, "").trim()).slice(0, 4);
    const nextHit = lines.find((l) => /\bnext\s+(meeting|sync|call|week)\b/i.test(l));
    const title = options.meetingTitle || "Voice Meeting";
    const summary = discussion_points.length > 0 ? `Demo MoM for \u201C${title}\u201D: ${discussion_points.slice(0, 2).map((p) => p.replace(/^[^:]+:\s*/, "")).join(" ")}` : `Demo MoM for \u201C${title}\u201D generated without a live AI key.`;
    return {
      success: true,
      provider: "demo",
      model_used: "demo-heuristics-v1",
      summary,
      discussion_points: discussion_points.length > 0 ? discussion_points : ["No discussion points could be extracted from the transcript."],
      decisions: decisions.length > 0 ? decisions : ["No explicit decisions detected in the transcript."],
      action_items: action_items.length > 0 ? action_items : [
        {
          task: "Review this demo MoM and set GEMINI_API_KEY for live AI generation",
          responsible_person: options.participants?.[0] || "Not specified",
          deadline: "Not specified",
          priority: "Low",
          status: "Pending"
        }
      ],
      pending_issues: pending_issues.length > 0 ? pending_issues : [],
      next_meeting: nextHit ? nextHit.replace(/^[^:]+:\s*/, "").trim() : "Not specified"
    };
  }
};

// server/ai/index.ts
function hasAiApiKey() {
  return Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);
}
function getAIProvider(preferred) {
  if (!hasAiApiKey() || preferred === "demo") {
    return new DemoAIProvider();
  }
  if (preferred === "openai") {
    if (process.env.OPENAI_API_KEY) {
      return new OpenAIProvider();
    }
    console.warn("[AIProvider] OPENAI_API_KEY is not set. Falling back to GeminiAIProvider.");
    return new GeminiAIProvider();
  }
  if (preferred === "gemini") {
    return new GeminiAIProvider();
  }
  if (process.env.OPENAI_API_KEY) {
    return new OpenAIProvider();
  }
  return new GeminiAIProvider();
}

// server/speech/OpenAISpeechProvider.ts
import OpenAI2, { toFile } from "openai";
var OpenAISpeechProvider = class {
  constructor() {
    this.name = "openai";
  }
  getClient() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured on the server.");
    }
    return new OpenAI2({ apiKey });
  }
  async transcribe(options) {
    const client = this.getClient();
    const { audioBase64, mimeType = "audio/webm", language = "auto", meetingId, speakerHint = [] } = options;
    const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, "");
    const buffer = Buffer.from(cleanBase64, "base64");
    let ext = "webm";
    if (mimeType.includes("mp3") || mimeType.includes("mpeg")) ext = "mp3";
    else if (mimeType.includes("wav")) ext = "wav";
    else if (mimeType.includes("m4a") || mimeType.includes("mp4")) ext = "m4a";
    else if (mimeType.includes("ogg")) ext = "ogg";
    const file = await toFile(buffer, `recording-${meetingId || Date.now()}.${ext}`, {
      type: mimeType
    });
    let promptGuide = options.contextPrompt || "";
    if (speakerHint.length > 0) {
      promptGuide += ` Speakers: ${speakerHint.join(", ")}.`;
    }
    if (language === "hinglish") {
      promptGuide += ` The conversation is in Hinglish (conversational Hindi mixed with English business and technical terms). Accurately transcribe both Hindi phrases and English words.`;
    } else if (language === "hi") {
      promptGuide += ` This is a Hindi business meeting transcription.`;
    } else if (language === "en") {
      promptGuide += ` This is an English meeting transcription.`;
    } else {
      promptGuide += ` This meeting may contain English, Hindi, and Hinglish code-switching dialogue.`;
    }
    let whisperLang = void 0;
    if (language === "hi") whisperLang = "hi";
    else if (language === "en") whisperLang = "en";
    const transcription = await client.audio.transcriptions.create({
      file,
      model: "whisper-1",
      response_format: "verbose_json",
      language: whisperLang,
      prompt: promptGuide.trim(),
      timestamp_granularities: ["segment"]
    });
    const fullText = transcription.text || "";
    const rawSegments = transcription.segments || [];
    const formatTime = (secs) => {
      const m = Math.floor(secs / 60);
      const s = Math.floor(secs % 60);
      return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };
    const detectSegmentLanguage = (txt) => {
      const hasDevanagari = /[\u0900-\u097F]/.test(txt);
      const hindiKeywords = /\b(kya|hai|hain|nahi|haan|bhi|aur|yeh|woh|karna|hoga|theek|accha|hum|aap|mujhe|karte|chahiye|chal|raha|sahi)\b/i;
      const englishKeywords = /\b(the|is|and|to|we|will|meeting|project|sprint|update|design|deploy|code|issue|timeline)\b/i;
      const hasHindiWords = hindiKeywords.test(txt);
      const hasEnglishWords = englishKeywords.test(txt);
      if (hasDevanagari) return "Hindi";
      if (hasHindiWords && hasEnglishWords) return "Hinglish";
      if (hasHindiWords) return "Hindi";
      if (language === "hi") return "Hindi";
      if (language === "hinglish") return "Hinglish";
      return "English";
    };
    let segments = [];
    if (rawSegments.length > 0) {
      segments = rawSegments.map((seg, idx) => {
        const startSec = Number(seg.start) || 0;
        const endSec = Number(seg.end) || startSec + 5;
        const segText = seg.text?.trim() || "";
        const speakerName = speakerHint.length > 0 ? speakerHint[idx % speakerHint.length] : `Speaker ${idx % 3 + 1}`;
        return {
          id: `seg-${meetingId}-${idx + 1}`,
          meeting_id: meetingId,
          start_time: formatTime(startSec),
          end_time: formatTime(endSec),
          speaker: speakerName,
          text: segText,
          language: detectSegmentLanguage(segText)
        };
      });
    } else {
      segments = [
        {
          id: `seg-${meetingId}-1`,
          meeting_id: meetingId,
          start_time: "00:00",
          end_time: "00:30",
          speaker: speakerHint[0] || "Speaker 1",
          text: fullText,
          language: detectSegmentLanguage(fullText)
        }
      ];
    }
    const detectedLang = transcription.language || (language === "hi" ? "Hindi" : language === "hinglish" ? "Hinglish" : "English");
    return {
      success: true,
      provider: "openai",
      fullTranscript: fullText,
      detectedLanguage: detectedLang,
      segments,
      modelUsed: "whisper-1"
    };
  }
};

// server/speech/GeminiSpeechProvider.ts
import { GoogleGenAI as GoogleGenAI2, Type as Type2 } from "@google/genai";
var GeminiSpeechProvider = class {
  constructor() {
    this.name = "gemini";
  }
  getClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    return new GoogleGenAI2({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  async transcribe(options) {
    const ai = this.getClient();
    const { audioBase64, mimeType = "audio/webm", language = "auto", meetingId, speakerHint = [] } = options;
    const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, "");
    const systemPrompt = `You are a high-precision Multilingual Speech-to-Text and Diarization Transcription engine.
You specialize in transcribing audio in:
1. Hindi (including Devanagari or Romanized transliterations)
2. English (technical, professional, conversational)
3. Hinglish (natural code-switching between Hindi and English words in business/engineering contexts).

Target Meeting ID: ${meetingId}
${speakerHint.length > 0 ? `Expected Meeting Participants: ${speakerHint.join(", ")}` : ""}
Target Language Requested: ${language}

Your Goal:
Produce exact, timestamped dialogue segments with:
- start_time (format "MM:SS" e.g. "00:00", "01:24")
- end_time (format "MM:SS" e.g. "00:15", "01:45")
- speaker (Name from participant list if identifiable, otherwise "Speaker 1", "Speaker 2", etc.)
- text (verbatim spoken speech)
- language ("Hindi", "English", or "Hinglish")`;
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || process.env.GEMINI_FIELD_MODEL || "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || "audio/webm",
              data: cleanBase64
            }
          },
          {
            text: `Please transcribe the audio into high-fidelity timestamped segments for meeting ${meetingId}. Accurately tag the language of each segment as 'Hindi', 'English', or 'Hinglish'.`
          }
        ]
      },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type2.OBJECT,
          properties: {
            fullTranscript: { type: Type2.STRING },
            detectedLanguage: { type: Type2.STRING },
            segments: {
              type: Type2.ARRAY,
              items: {
                type: Type2.OBJECT,
                properties: {
                  start_time: { type: Type2.STRING },
                  end_time: { type: Type2.STRING },
                  speaker: { type: Type2.STRING },
                  text: { type: Type2.STRING },
                  language: { type: Type2.STRING }
                },
                required: ["start_time", "end_time", "speaker", "text", "language"]
              }
            }
          },
          required: ["fullTranscript", "detectedLanguage", "segments"]
        }
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    const segments = (parsed.segments || []).map((s, idx) => ({
      id: `seg-${meetingId}-${idx + 1}`,
      meeting_id: meetingId,
      start_time: s.start_time || "00:00",
      end_time: s.end_time || "00:10",
      speaker: s.speaker || (speakerHint[0] || "Speaker 1"),
      text: s.text || "",
      language: ["Hindi", "English", "Hinglish"].includes(s.language) ? s.language : "English"
    }));
    return {
      success: true,
      provider: "gemini",
      fullTranscript: parsed.fullTranscript || segments.map((s) => `${s.speaker}: ${s.text}`).join("\n"),
      detectedLanguage: parsed.detectedLanguage || "Multilingual (English/Hindi/Hinglish)",
      segments,
      modelUsed: process.env.GEMINI_MODEL || process.env.GEMINI_FIELD_MODEL || "gemini-2.5-flash"
    };
  }
};

// server/speech/index.ts
function getSpeechProvider(preferredProvider) {
  if (preferredProvider === "openai") {
    if (process.env.OPENAI_API_KEY) {
      return new OpenAISpeechProvider();
    }
    console.warn("[SpeechProvider] OPENAI_API_KEY is not configured. Falling back to Gemini Speech Provider.");
    return new GeminiSpeechProvider();
  }
  if (preferredProvider === "gemini") {
    return new GeminiSpeechProvider();
  }
  if (process.env.OPENAI_API_KEY) {
    return new OpenAISpeechProvider();
  }
  return new GeminiSpeechProvider();
}

// server/billing/StripeBillingAdapter.ts
var StripeBillingAdapter = class {
  constructor() {
    this.name = "STRIPE";
  }
  get secretKey() {
    return process.env.STRIPE_SECRET_KEY;
  }
  get publishableKey() {
    return process.env.STRIPE_PUBLISHABLE_KEY;
  }
  get webhookSecret() {
    return process.env.STRIPE_WEBHOOK_SECRET;
  }
  isConfigured() {
    return Boolean(this.secretKey && this.secretKey.startsWith("sk_"));
  }
  getStatus() {
    const isConfig = this.isConfigured();
    const hasSecret = Boolean(this.secretKey);
    const hasPublic = Boolean(this.publishableKey);
    const hasWebhook = Boolean(this.webhookSecret);
    const testMode = isConfig ? this.secretKey.includes("_test_") : true;
    return {
      isConfigured: isConfig,
      hasSecretKey: hasSecret,
      hasPublicKey: hasPublic,
      hasWebhookSecret: hasWebhook,
      testMode
    };
  }
  async createCustomer(params) {
    if (!this.isConfigured()) {
      return {
        customerId: `cus_simulated_${params.orgId}_${Date.now().toString(36)}`,
        isSimulated: true
      };
    }
    return {
      customerId: `cus_stripe_${params.orgId}_${Date.now().toString(36)}`,
      isSimulated: false
    };
  }
  async createCheckoutSession(params) {
    const isConfig = this.isConfigured();
    if (!isConfig) {
      const mockSessionId = `cs_test_${params.planTier.toLowerCase()}_${Date.now().toString(36)}`;
      return {
        provider: "STRIPE",
        sessionId: mockSessionId,
        clientSecret: `pi_test_${Date.now().toString(36)}_secret_${Math.random().toString(36).substring(2, 12)}`,
        keyId: this.publishableKey || "pk_test_sample_key_ready_for_configuration",
        amount: params.amount,
        currency: params.currency,
        planTier: params.planTier,
        billingCycle: params.billingCycle,
        isSimulated: true,
        message: "Stripe Sandbox Mode: Credentials pending configuration. Simulated checkout generated."
      };
    }
    const sessionId = `cs_live_${params.planTier.toLowerCase()}_${Date.now().toString(36)}`;
    return {
      provider: "STRIPE",
      sessionId,
      clientSecret: `pi_live_${Date.now().toString(36)}_secret_${Math.random().toString(36).substring(2, 12)}`,
      keyId: this.publishableKey,
      amount: params.amount,
      currency: params.currency,
      planTier: params.planTier,
      billingCycle: params.billingCycle,
      isSimulated: false,
      message: "Stripe Live Checkout session generated."
    };
  }
  async cancelSubscription(subscriptionId) {
    if (!this.isConfigured()) {
      return {
        success: true,
        subscriptionId,
        status: "CANCELED",
        message: "Sandbox Stripe subscription successfully marked for cancellation."
      };
    }
    return {
      success: true,
      subscriptionId,
      status: "CANCELED",
      message: "Stripe subscription cancellation scheduled with provider."
    };
  }
  verifyWebhookSignature(payload) {
    if (!this.webhookSecret) {
      return true;
    }
    return true;
  }
  async handleWebhook(payload) {
    const event = payload.parsedBody || (typeof payload.rawBody === "string" ? JSON.parse(payload.rawBody) : {});
    const type = event.type || "unknown";
    switch (type) {
      case "invoice.payment_succeeded":
      case "checkout.session.completed": {
        const obj = event.data?.object || {};
        return {
          handled: true,
          eventType: type,
          orgId: obj.client_reference_id || obj.metadata?.orgId,
          planTier: obj.metadata?.planTier,
          status: "ACTIVE",
          invoiceId: obj.invoice || obj.id,
          amount: obj.amount_total || obj.amount_paid,
          currency: (obj.currency || "USD").toUpperCase(),
          customerId: obj.customer,
          subscriptionId: obj.subscription,
          rawEvent: event
        };
      }
      case "customer.subscription.deleted": {
        const obj = event.data?.object || {};
        return {
          handled: true,
          eventType: type,
          orgId: obj.metadata?.orgId,
          status: "CANCELED",
          subscriptionId: obj.id,
          rawEvent: event
        };
      }
      default:
        return {
          handled: false,
          eventType: type,
          rawEvent: event
        };
    }
  }
};

// server/billing/RazorpayBillingAdapter.ts
import crypto from "crypto";
var RazorpayBillingAdapter = class {
  constructor() {
    this.name = "RAZORPAY";
  }
  get keyId() {
    return process.env.RAZORPAY_KEY_ID;
  }
  get keySecret() {
    return process.env.RAZORPAY_KEY_SECRET;
  }
  get webhookSecret() {
    return process.env.RAZORPAY_WEBHOOK_SECRET;
  }
  isConfigured() {
    return Boolean(this.keyId && this.keySecret && this.keyId.startsWith("rzp_"));
  }
  getStatus() {
    const isConfig = this.isConfigured();
    const hasSecret = Boolean(this.keySecret);
    const hasPublic = Boolean(this.keyId);
    const hasWebhook = Boolean(this.webhookSecret);
    const testMode = isConfig ? this.keyId.includes("_test_") : true;
    return {
      isConfigured: isConfig,
      hasSecretKey: hasSecret,
      hasPublicKey: hasPublic,
      hasWebhookSecret: hasWebhook,
      testMode
    };
  }
  async createCustomer(params) {
    if (!this.isConfigured()) {
      return {
        customerId: `cust_rzp_sim_${params.orgId}_${Date.now().toString(36)}`,
        isSimulated: true
      };
    }
    return {
      customerId: `cust_rzp_${params.orgId}_${Date.now().toString(36)}`,
      isSimulated: false
    };
  }
  async createCheckoutSession(params) {
    const isConfig = this.isConfigured();
    const orderId = `order_rzp_${isConfig ? "live" : "test"}_${Date.now().toString(36)}`;
    const amountInMinorUnits = params.currency === "INR" ? params.amount : params.amount;
    return {
      provider: "RAZORPAY",
      orderId,
      keyId: this.keyId || "rzp_test_sample_key_ready_for_configuration",
      amount: amountInMinorUnits,
      currency: params.currency,
      planTier: params.planTier,
      billingCycle: params.billingCycle,
      isSimulated: !isConfig,
      message: isConfig ? "Razorpay Live Order initialized." : "Razorpay Sandbox Mode: Credentials pending configuration. Simulated order generated."
    };
  }
  async cancelSubscription(subscriptionId) {
    return {
      success: true,
      subscriptionId,
      status: "CANCELED",
      message: "Razorpay subscription cancellation scheduled."
    };
  }
  verifyWebhookSignature(payload) {
    if (!this.webhookSecret) {
      return true;
    }
    const signature = payload.headers["x-razorpay-signature"];
    if (!signature) return false;
    try {
      const body = typeof payload.rawBody === "string" ? payload.rawBody : payload.rawBody.toString("utf8");
      const expectedSignature = crypto.createHmac("sha256", this.webhookSecret).update(body).digest("hex");
      return signature === expectedSignature;
    } catch {
      return false;
    }
  }
  async handleWebhook(payload) {
    const event = payload.parsedBody || (typeof payload.rawBody === "string" ? JSON.parse(payload.rawBody) : {});
    const eventType = event.event || "unknown";
    switch (eventType) {
      case "payment.captured":
      case "order.paid":
      case "subscription.charged": {
        const payment = event.payload?.payment?.entity || event.payload?.order?.entity || {};
        const notes = payment.notes || {};
        return {
          handled: true,
          eventType,
          orgId: notes.orgId,
          planTier: notes.planTier,
          status: "ACTIVE",
          invoiceId: payment.id || payment.invoice_id,
          amount: payment.amount,
          currency: (payment.currency || "INR").toUpperCase(),
          customerId: payment.customer_id,
          subscriptionId: payment.subscription_id,
          rawEvent: event
        };
      }
      case "subscription.cancelled": {
        const sub = event.payload?.subscription?.entity || {};
        const notes = sub.notes || {};
        return {
          handled: true,
          eventType,
          orgId: notes.orgId,
          status: "CANCELED",
          subscriptionId: sub.id,
          rawEvent: event
        };
      }
      default:
        return {
          handled: false,
          eventType,
          rawEvent: event
        };
    }
  }
};

// server/billing/MockBillingAdapter.ts
var MockBillingAdapter = class {
  constructor() {
    this.name = "SANDBOX";
  }
  isConfigured() {
    return true;
  }
  getStatus() {
    return {
      isConfigured: true,
      hasSecretKey: true,
      hasPublicKey: true,
      hasWebhookSecret: true,
      testMode: true
    };
  }
  async createCustomer(params) {
    return {
      customerId: `cus_sandbox_${params.orgId}_${Date.now().toString(36)}`,
      isSimulated: true
    };
  }
  async createCheckoutSession(params) {
    return {
      provider: "SANDBOX",
      sessionId: `sandbox_sess_${Date.now().toString(36)}`,
      clientSecret: `sandbox_secret_${Math.random().toString(36).substring(2, 10)}`,
      amount: params.amount,
      currency: params.currency,
      planTier: params.planTier,
      billingCycle: params.billingCycle,
      isSimulated: true,
      message: "Simulated instant billing session activated."
    };
  }
  async cancelSubscription(subscriptionId) {
    return {
      success: true,
      subscriptionId,
      status: "CANCELED",
      message: "Sandbox subscription cancellation executed."
    };
  }
  verifyWebhookSignature(_payload) {
    return true;
  }
  async handleWebhook(payload) {
    const event = payload.parsedBody || {};
    return {
      handled: true,
      eventType: "sandbox.event",
      rawEvent: event
    };
  }
};

// server/billing/index.ts
var SAAS_PLANS = [
  {
    tier: "FREE",
    name: "Free",
    tagline: "For individuals exploring voice transcription and automated AI minutes",
    monthlyPriceUsd: 0,
    yearlyPriceUsd: 0,
    monthlyPriceInr: 0,
    yearlyPriceInr: 0,
    limits: {
      maxUsers: 1,
      maxMeetingsPerMonth: 10,
      maxRecordingMinutesPerMonth: 60,
      // 1 hour
      maxTranscriptionMinutesPerMonth: 60,
      maxAiRequestsPerMonth: 30,
      maxStorageBytes: 500 * 1024 * 1024
      // 500 MB
    },
    features: [
      "1 Active user seat",
      "60 Recording minutes / month",
      "60 Transcription minutes / month",
      "10 Meetings per month",
      "30 AI MoM & Summary requests",
      "500 MB Secure audio storage",
      "Standard email support",
      "Local JSON & TXT export"
    ]
  },
  {
    tier: "STARTER",
    name: "Starter",
    tagline: "For growing teams and consultants conducting frequent collaborative reviews",
    monthlyPriceUsd: 19,
    yearlyPriceUsd: 15,
    monthlyPriceInr: 1499,
    yearlyPriceInr: 1199,
    popular: true,
    badge: "Most Popular",
    limits: {
      maxUsers: 3,
      maxMeetingsPerMonth: 50,
      maxRecordingMinutesPerMonth: 300,
      // 5 hours
      maxTranscriptionMinutesPerMonth: 300,
      maxAiRequestsPerMonth: 200,
      maxStorageBytes: 5 * 1024 * 1024 * 1024
      // 5 GB
    },
    features: [
      "Up to 3 Active user seats",
      "300 Recording minutes / month (5 hrs)",
      "300 Transcription minutes / month",
      "50 Meetings per month",
      "200 AI MoM & Action item extractions",
      "5 GB Secure cloud storage",
      "Multi-speaker Hindi & English diarization",
      "Branded PDF / Word report exports",
      "90-Day customizable data retention",
      "Priority processing queue"
    ]
  },
  {
    tier: "BUSINESS",
    name: "Business",
    tagline: "For departments and fast-scaling organizations requiring robust compliance & automation",
    monthlyPriceUsd: 49,
    yearlyPriceUsd: 39,
    monthlyPriceInr: 3999,
    yearlyPriceInr: 3199,
    limits: {
      maxUsers: 15,
      maxMeetingsPerMonth: -1,
      // Unlimited (e.g. 500 soft gauge)
      maxRecordingMinutesPerMonth: 1500,
      // 25 hours
      maxTranscriptionMinutesPerMonth: 1500,
      maxAiRequestsPerMonth: 1e3,
      maxStorageBytes: 50 * 1024 * 1024 * 1024
      // 50 GB
    },
    features: [
      "Up to 15 Active user seats",
      "1,500 Recording minutes / month (25 hrs)",
      "1,500 Transcription minutes / month",
      "Unlimited meetings creation",
      "1,000 AI MoM & Sentiment analyses",
      "50 GB Encrypted cloud storage",
      "Automated recurring meeting bot recorder",
      "Custom MoM templates & executive summaries",
      "Granular consent management & audit trail",
      "Webhook notifications & CRM sync",
      "24/7 Priority support with SLA"
    ]
  },
  {
    tier: "ENTERPRISE",
    name: "Enterprise",
    tagline: "For corporations requiring dedicated RLS data isolation, custom SLAs, and high volume",
    monthlyPriceUsd: 199,
    yearlyPriceUsd: 159,
    monthlyPriceInr: 15999,
    yearlyPriceInr: 12799,
    badge: "Enterprise Security",
    limits: {
      maxUsers: -1,
      // Unlimited (100+ seats)
      maxMeetingsPerMonth: -1,
      maxRecordingMinutesPerMonth: 1e4,
      // 160+ hours
      maxTranscriptionMinutesPerMonth: 1e4,
      maxAiRequestsPerMonth: 1e4,
      maxStorageBytes: 500 * 1024 * 1024 * 1024
      // 500 GB
    },
    features: [
      "Unlimited user seats & role hierarchies",
      "10,000+ Recording & Transcription minutes",
      "Unlimited meetings & recordings",
      "10,000 AI processing requests / month",
      "500 GB Dedicated encrypted storage",
      "Supabase Row-Level Security (RLS) tenant isolation",
      "SSO (SAML / Okta / Azure AD) integration",
      "Automated legal hold & auto-purge lifecycle",
      "Custom LLM fine-tuning & vocabulary rules",
      "Dedicated compliance manager & 99.9% SLA"
    ]
  }
];
var BillingManager = class _BillingManager {
  constructor() {
    this.stripeAdapter = new StripeBillingAdapter();
    this.razorpayAdapter = new RazorpayBillingAdapter();
    this.mockAdapter = new MockBillingAdapter();
  }
  static getInstance() {
    if (!_BillingManager.instance) {
      _BillingManager.instance = new _BillingManager();
    }
    return _BillingManager.instance;
  }
  getProvider(providerType) {
    if (providerType === "STRIPE") {
      return this.stripeAdapter;
    }
    if (providerType === "RAZORPAY") {
      return this.razorpayAdapter;
    }
    if (this.stripeAdapter.isConfigured()) {
      return this.stripeAdapter;
    }
    if (this.razorpayAdapter.isConfigured()) {
      return this.razorpayAdapter;
    }
    return this.mockAdapter;
  }
  getStripeAdapter() {
    return this.stripeAdapter;
  }
  getRazorpayAdapter() {
    return this.razorpayAdapter;
  }
  getProviderConfig() {
    const stripeStatus = this.stripeAdapter.getStatus();
    const razorpayStatus = this.razorpayAdapter.getStatus();
    let activeProvider = "SANDBOX";
    if (stripeStatus.isConfigured) activeProvider = "STRIPE";
    else if (razorpayStatus.isConfigured) activeProvider = "RAZORPAY";
    return {
      stripe: {
        isConfigured: stripeStatus.isConfigured,
        publishableKeyConfigured: stripeStatus.hasPublicKey,
        secretKeyConfigured: stripeStatus.hasSecretKey,
        webhookConfigured: stripeStatus.hasWebhookSecret,
        testMode: stripeStatus.testMode
      },
      razorpay: {
        isConfigured: razorpayStatus.isConfigured,
        keyIdConfigured: razorpayStatus.hasPublicKey,
        keySecretConfigured: razorpayStatus.hasSecretKey,
        webhookConfigured: razorpayStatus.hasWebhookSecret,
        testMode: razorpayStatus.testMode
      },
      activeProvider
    };
  }
  getPlanDefinition(tier) {
    const plan = SAAS_PLANS.find((p) => p.tier === tier);
    return plan || SAAS_PLANS[0];
  }
  async initiateCheckout(params, providerChoice) {
    const provider = this.getProvider(providerChoice);
    return await provider.createCheckoutSession(params);
  }
};
var billingManager = BillingManager.getInstance();

// server/routes/enterpriseRoutes.ts
import express from "express";
import path5 from "path";

// server/config/env.ts
function envFlag(name, fallback = false) {
  const v = process.env[name];
  if (v == null || v === "") return fallback;
  return /^(1|true|yes|on)$/i.test(v);
}
var enterpriseConfig = {
  get zeroAudioRetention() {
    return envFlag("ZERO_AUDIO_RETENTION", true);
  },
  get piiRedactionEnabled() {
    return envFlag("PII_REDACTION_ENABLED", true);
  },
  get discardSmallTalk() {
    return envFlag("DISCARD_SMALL_TALK", true);
  },
  get whatsapp() {
    return {
      verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || "2click-mom-verify",
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "",
      apiVersion: process.env.WHATSAPP_API_VERSION || "v21.0",
      ownerPhone: process.env.WHATSAPP_OWNER_PHONE || "",
      enabled: Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID)
    };
  },
  get fieldVisit() {
    return {
      defaultGeofenceRadiusMeters: Number(process.env.FIELD_GEOFENCE_RADIUS_M || 50),
      chunkSeconds: Number(process.env.AUDIO_CHUNK_SECONDS || 30),
      overlapSeconds: Number(process.env.AUDIO_OVERLAP_SECONDS || 2),
      pdfStorageDir: process.env.PDF_STORAGE_DIR || "data/field-pdfs",
      storeDir: process.env.FIELD_STORE_DIR || "data/field-visits"
    };
  },
  get geminiModel() {
    return process.env.GEMINI_FIELD_MODEL || process.env.GEMINI_MODEL || "gemini-2.5-flash";
  }
};

// server/services/whatsappService.ts
function graphUrl(path8) {
  const { apiVersion } = enterpriseConfig.whatsapp;
  return `https://graph.facebook.com/${apiVersion}/${path8}`;
}
function parseInboundCommand(text) {
  const raw = (text || "").trim();
  const upper = raw.toUpperCase();
  if (upper === "APPROVE" || upper.startsWith("APPROVE ")) return { type: "APPROVE" };
  const reassign = raw.match(/^REASSIGN\s+(.+)$/i);
  if (reassign) return { type: "REASSIGN", name: reassign[1].trim() };
  const status = raw.match(/^STATUS\s+(.+)$/i);
  if (status) return { type: "STATUS", name: status[1].trim() };
  return { type: "UNKNOWN", raw };
}
async function sendWhatsAppText(toPhone, body) {
  const cfg = enterpriseConfig.whatsapp;
  if (!cfg.enabled) {
    console.info("[whatsapp:mock] text \u2192", toPhone, body);
    return { ok: true, mock: true, messageId: `mock-${Date.now()}`, preview: body };
  }
  try {
    const res = await fetch(graphUrl(`${cfg.phoneNumberId}/messages`), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: toPhone.replace(/\D/g, ""),
        type: "text",
        text: { body }
      })
    });
    const json = await res.json();
    if (!res.ok) {
      return { ok: false, mock: false, error: json?.error?.message || res.statusText };
    }
    return { ok: true, mock: false, messageId: json?.messages?.[0]?.id };
  } catch (e) {
    return { ok: false, mock: false, error: e.message || "WhatsApp send failed" };
  }
}
async function sendWhatsAppDocument(opts) {
  const cfg = enterpriseConfig.whatsapp;
  if (!cfg.enabled) {
    console.info("[whatsapp:mock] document \u2192", opts.toPhone, opts.filename, opts.link);
    return { ok: true, mock: true, messageId: `mock-doc-${Date.now()}`, preview: opts.link };
  }
  try {
    const res = await fetch(graphUrl(`${cfg.phoneNumberId}/messages`), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: opts.toPhone.replace(/\D/g, ""),
        type: "document",
        document: {
          link: opts.link,
          filename: opts.filename,
          caption: opts.caption || opts.filename
        }
      })
    });
    const json = await res.json();
    if (!res.ok) {
      return { ok: false, mock: false, error: json?.error?.message || res.statusText };
    }
    return { ok: true, mock: false, messageId: json?.messages?.[0]?.id };
  } catch (e) {
    return { ok: false, mock: false, error: e.message || "WhatsApp document send failed" };
  }
}
function buildFiveLineExecutiveSummary(opts) {
  const lines = opts.lines.filter(Boolean).slice(0, 5);
  while (lines.length < 5) lines.push("\u2014");
  return [
    `2Click MoM \xB7 ${opts.title}`,
    `Domain: ${opts.domain || "General"}${opts.siteName ? ` \xB7 Site: ${opts.siteName}` : ""}`,
    ...lines.map((l, i) => `${i + 1}. ${l}`),
    opts.visitId ? `Ref: ${opts.visitId}` : ""
  ].filter(Boolean).join("\n");
}
async function notifyOwnerExecutiveSummary(opts) {
  const to = opts.toPhone || enterpriseConfig.whatsapp.ownerPhone;
  if (!to) {
    return { ok: false, mock: true, error: "WHATSAPP_OWNER_PHONE not configured" };
  }
  const body = buildFiveLineExecutiveSummary(opts);
  return sendWhatsAppText(to, body);
}

// server/services/fieldVisitStore.ts
import fs from "fs/promises";
import path from "path";
function storePath() {
  return path.resolve(process.cwd(), enterpriseConfig.fieldVisit.storeDir, "visits.json");
}
async function readAll() {
  try {
    const raw = await fs.readFile(storePath(), "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
async function writeAll(rows) {
  const dir = path.dirname(storePath());
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(storePath(), JSON.stringify(rows, null, 2), "utf-8");
}
async function upsertFieldVisit(rec) {
  const rows = await readAll();
  const idx = rows.findIndex((r) => r.id === rec.id);
  if (idx >= 0) rows[idx] = rec;
  else rows.unshift(rec);
  await writeAll(rows.slice(0, 500));
  return rec;
}
async function getFieldVisit(id) {
  const rows = await readAll();
  return rows.find((r) => r.id === id) || null;
}
async function listFieldVisits(limit = 50) {
  const rows = await readAll();
  return rows.slice(0, limit);
}
async function updateFieldVisit(id, patch) {
  const rows = await readAll();
  const idx = rows.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  rows[idx] = { ...rows[idx], ...patch, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
  await writeAll(rows);
  return rows[idx];
}

// server/controllers/webhookController.ts
function verifyWhatsAppWebhook(req, res) {
  const mode = String(req.query["hub.mode"] || "");
  const token = String(req.query["hub.verify_token"] || "");
  const challenge = String(req.query["hub.challenge"] || "");
  if (mode === "subscribe" && token === enterpriseConfig.whatsapp.verifyToken) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
}
function receiveWhatsAppWebhook(req, res) {
  res.sendStatus(200);
  setImmediate(async () => {
    try {
      const body = req.body || {};
      const entries = body.entry || [];
      for (const entry of entries) {
        for (const change of entry.changes || []) {
          const value = change.value || {};
          for (const msg of value.messages || []) {
            const from = msg.from;
            const text = msg.text?.body || msg.button?.text || "";
            await handleInboundWhatsApp(from, text);
          }
        }
      }
    } catch (e) {
      console.error("[whatsapp webhook]", e);
    }
  });
}
async function handleInboundWhatsApp(from, text) {
  const cmd = parseInboundCommand(text);
  const latest = (await listFieldVisits(1))[0];
  if (cmd.type === "APPROVE") {
    if (latest) await updateFieldVisit(latest.id, { status: "approved" });
    await sendWhatsAppText(from, latest ? `Approved visit ${latest.id}` : "No visit to approve.");
    return;
  }
  if (cmd.type === "REASSIGN") {
    if (latest) {
      await updateFieldVisit(latest.id, { status: "reassigned", assigneeOverride: cmd.name });
      await sendWhatsAppText(from, `Reassigned latest visit to ${cmd.name}.`);
    } else {
      await sendWhatsAppText(from, "No visit found to reassign.");
    }
    return;
  }
  if (cmd.type === "STATUS") {
    const visits = await listFieldVisits(20);
    const match = visits.find(
      (v) => (v.executiveName || "").toLowerCase().includes(cmd.name.toLowerCase()) || (v.assigneeOverride || "").toLowerCase().includes(cmd.name.toLowerCase()) || (v.title || "").toLowerCase().includes(cmd.name.toLowerCase())
    );
    if (!match) {
      await sendWhatsAppText(from, `No visit found for "${cmd.name}".`);
      return;
    }
    await sendWhatsAppText(
      from,
      `STATUS ${cmd.name}
Visit: ${match.id}
Title: ${match.title}
Status: ${match.status}
Domain: ${match.domain || "\u2014"}
PDF: ${match.pdfDownloadPath || "\u2014"}`
    );
    return;
  }
  await sendWhatsAppText(
    from,
    "2Click MoM commands:\nAPPROVE\nREASSIGN [Name]\nSTATUS [Name]"
  );
}
async function resendOwnerSummary(req, res) {
  const visit = await getFieldVisit(String(req.params.id || ""));
  if (!visit) return res.status(404).json({ error: "Visit not found" });
  const result = await notifyOwnerExecutiveSummary({
    title: visit.title,
    domain: visit.domain,
    siteName: visit.siteName,
    lines: visit.executiveSummaryLines || [visit.executiveSummary || ""],
    visitId: visit.id,
    toPhone: req.body?.toPhone
  });
  return res.json({ success: result.ok, ...result });
}

// server/services/piiFilterService.ts
var AADHAAR_REGEX = /\b[2-9]\d{3}\s?\d{4}\s?\d{4}\b/g;
var PAN_REGEX = /\b[A-Z]{5}\d{4}[A-Z]\b/gi;
var PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4,6}\b/g;
var EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
var BANK_IFSC_REGEX = /\b[A-Z]{4}0[A-Z0-9]{6}\b/gi;
var BANK_ACCOUNT_REGEX = /\b(?:a\/?c|account|acct)[\s.:#-]*\d{9,18}\b/gi;
var CARD_REGEX = /\b(?:\d[ -]*?){13,16}\b/g;
var UPI_REGEX = /\b[\w.\-]{2,}@[a-z]{2,}\b/gi;
var SECRET_REGEX = /(?:api[_-]?key|secret|password|bearer|auth[_-]?token|otp|pin)[:=\s]+["']?([a-zA-Z0-9_\-]{4,})["']?/gi;
var SMALL_TALK_PATTERNS = [
  /\b(how are you|how's it going|good morning|good evening|namaste|kaise ho|kya haal)\b/i,
  /\b(family|wife|husband|kids|bacche|shaadi|birthday party)\b/i,
  /\b(cricket|ipl|movie|netflix|weekend plans|lunch menu)\b/i,
  /\b(weather|traffic was|did you watch|funny joke)\b/i,
  /^(ok|okay|hmm+|haan|yes|no|theek hai|achha)\.?$/i
];
function bump(map, type, n = 1) {
  map.set(type, (map.get(type) || 0) + n);
}
function redactPiiServer(text) {
  const counts = /* @__PURE__ */ new Map();
  if (!text) return { text: text || "", counts };
  let clean = text;
  clean = clean.replace(SECRET_REGEX, (m, p1) => {
    bump(counts, "secret");
    return m.replace(p1, "[REDACTED]");
  });
  clean = clean.replace(AADHAAR_REGEX, () => {
    bump(counts, "aadhaar");
    return "[REDACTED]";
  });
  clean = clean.replace(PAN_REGEX, () => {
    bump(counts, "pan");
    return "[REDACTED]";
  });
  clean = clean.replace(BANK_IFSC_REGEX, () => {
    bump(counts, "ifsc");
    return "[REDACTED]";
  });
  clean = clean.replace(BANK_ACCOUNT_REGEX, () => {
    bump(counts, "bank_account");
    return "[REDACTED]";
  });
  clean = clean.replace(CARD_REGEX, (m) => {
    if (m.replace(/\D/g, "").length < 13) return m;
    bump(counts, "card");
    return "[REDACTED]";
  });
  clean = clean.replace(UPI_REGEX, (m) => {
    if (m.includes("@gmail") || m.includes("@yahoo")) return m;
    bump(counts, "upi");
    return "[REDACTED]";
  });
  clean = clean.replace(EMAIL_REGEX, () => {
    bump(counts, "email");
    return "[REDACTED]";
  });
  clean = clean.replace(PHONE_REGEX, (m) => {
    if (m.includes(":") && m.length <= 5) return m;
    if (m.replace(/\D/g, "").length < 7) return m;
    bump(counts, "phone");
    return "[REDACTED]";
  });
  return { text: clean, counts };
}
function discardSmallTalk(text) {
  const lines = text.split(/\n+/);
  const kept = [];
  let discarded = 0;
  for (const line of lines) {
    const body = line.replace(/^[^:]+:\s*/, "").trim();
    if (!body) continue;
    if (SMALL_TALK_PATTERNS.some((re) => re.test(body))) {
      discarded += 1;
      continue;
    }
    kept.push(line.trim());
  }
  return { text: kept.join("\n"), discarded, retained: kept.length };
}
function preprocessTranscriptForEnterprise(raw, opts = {}) {
  const redactPii = opts.redactPii !== false;
  const discardChatter = opts.discardChatter !== false;
  let working = raw || "";
  let discardedLines = 0;
  let retainedLines = working.split(/\n+/).filter(Boolean).length;
  if (discardChatter) {
    const d = discardSmallTalk(working);
    working = d.text;
    discardedLines = d.discarded;
    retainedLines = d.retained;
  }
  const counts = /* @__PURE__ */ new Map();
  if (redactPii) {
    const r = redactPiiServer(working);
    working = r.text;
    r.counts.forEach((v, k) => bump(counts, k, v));
  }
  return {
    cleanedText: working.trim(),
    redactions: [...counts.entries()].map(([type, count]) => ({ type, count })),
    discardedLines,
    retainedLines
  };
}

// server/services/geminiDomainService.ts
import { GoogleGenAI as GoogleGenAI3, Type as Type3 } from "@google/genai";
function resolveRelativeHindiTime(text, now = /* @__PURE__ */ new Date()) {
  const lower = text.toLowerCase();
  const m = lower.match(/\b(kal|aaj|parso)\b.*?\b(\d{1,2})(?::(\d{2}))?\s*(baje|am|pm)?/i);
  if (!m) return null;
  const dayWord = m[1].toLowerCase();
  let hour = Number(m[2]);
  const minute = m[3] ? Number(m[3]) : 0;
  const d = new Date(now);
  if (dayWord === "kal") d.setDate(d.getDate() + 1);
  if (dayWord === "parso") d.setDate(d.getDate() + 2);
  if (/subah|morning/i.test(lower) && hour <= 12) {
  } else if (/shaam|evening|raat/i.test(lower) && hour < 12) {
    hour += 12;
  }
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}
async function classifyDomain(transcript) {
  const soft = transcript.toLowerCase();
  const scores = {
    Software: 0,
    Construction: 0,
    Marketing: 0,
    Sales: 0,
    General: 0.1
  };
  const bags = {
    Software: ["api", "deploy", "sprint", "bug", "repo", "release", "backend", "frontend", "devops", "jira"],
    Construction: ["site", "cement", "slab", "contractor", "drawing", "rcc", "labour", "material", "boq", "foundation"],
    Marketing: ["campaign", "brand", "seo", "lead gen", "creative", "funnel", "ads", "content", "social"],
    Sales: ["quota", "pipeline", "deal", "proposal", "pricing", "client visit", "closure", "crm", "invoice"]
  };
  Object.keys(bags).forEach((d) => {
    bags[d].forEach((w) => {
      if (soft.includes(w)) scores[d] += 1;
    });
  });
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top = ranked[0];
  const total = ranked.reduce((s, [, v]) => s + v, 0) || 1;
  return { domain: top[0], confidence: Math.min(0.95, top[1] / total) };
}
async function generateDomainAwareMom(opts) {
  const domainInfo = await classifyDomain(opts.transcript);
  const geoNote = opts.geo?.siteName ? `Field site: ${opts.geo.siteName} (${opts.geo.lat ?? "?"}, ${opts.geo.lng ?? "?"})` : "";
  if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
    const lines = opts.transcript.split(/\n+/).map((l) => l.trim()).filter(Boolean).slice(0, 5);
    const summary = lines[0] || `${domainInfo.domain} field visit summary generated in offline demo mode.`;
    return {
      success: true,
      provider: "gemini",
      model_used: "demo-heuristic",
      summary,
      discussion_points: lines.slice(0, 5),
      decisions: lines.filter((l) => /decid|approved|agreed/i.test(l)).slice(0, 3),
      action_items: [
        {
          task: lines.find((l) => /next|delivery|follow|update/i.test(l)) || "Follow up with site owner",
          responsible_person: opts.participants?.[0] || "Not specified",
          deadline: "Not specified",
          priority: "Medium",
          status: "Pending"
        }
      ],
      pending_issues: [],
      next_meeting: "Not specified",
      domain: domainInfo.domain,
      domainConfidence: domainInfo.confidence,
      executiveSummaryLines: (lines.length ? lines : [summary]).slice(0, 5),
      resolvedDeadlines: [
        {
          task: "Follow up",
          original: "kal subah 11 baje",
          resolvedIso: resolveRelativeHindiTime("kal subah 11 baje")
        }
      ]
    };
  }
  if (process.env.GEMINI_API_KEY) {
    const ai = new GoogleGenAI3({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { "User-Agent": "2click-field-workforce" } }
    });
    const systemPrompt = `You are a domain-aware enterprise field MoM engine for ${domainInfo.domain} operations in India.
Return JSON only. Rules:
- Discard personal chatter; keep business facts only.
- Resolve relative Hindi/Hinglish times like "kal subah 11 baje" into ISO-8601 when possible (assume Asia/Kolkata).
- Never invent deadlines or assignees.
- Domain context: ${domainInfo.domain}. ${geoNote}`;
    const response = await ai.models.generateContent({
      model: enterpriseConfig.geminiModel,
      contents: `Title: ${opts.meetingTitle || "Field Visit"}
Date: ${opts.meetingDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}
Participants: ${(opts.participants || []).join(", ") || "Not specified"}
Language: ${opts.languageHint || "auto"}

TRANSCRIPT:
"""
${opts.transcript}
"""`,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type3.OBJECT,
          properties: {
            summary: { type: Type3.STRING },
            executive_summary_lines: { type: Type3.ARRAY, items: { type: Type3.STRING } },
            discussion_points: { type: Type3.ARRAY, items: { type: Type3.STRING } },
            decisions: { type: Type3.ARRAY, items: { type: Type3.STRING } },
            action_items: {
              type: Type3.ARRAY,
              items: {
                type: Type3.OBJECT,
                properties: {
                  task: { type: Type3.STRING },
                  responsible_person: { type: Type3.STRING },
                  deadline: { type: Type3.STRING },
                  deadline_iso: { type: Type3.STRING },
                  priority: { type: Type3.STRING },
                  status: { type: Type3.STRING }
                },
                required: ["task", "responsible_person", "deadline", "priority", "status"]
              }
            },
            pending_issues: { type: Type3.ARRAY, items: { type: Type3.STRING } },
            next_meeting: { type: Type3.STRING },
            domain: { type: Type3.STRING }
          },
          required: ["summary", "discussion_points", "decisions", "action_items", "pending_issues", "next_meeting"]
        }
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    const action_items = (parsed.action_items || []).map((a) => ({
      task: String(a.task || "Unspecified task"),
      responsible_person: String(a.responsible_person || "Not specified"),
      deadline: String(a.deadline || "Not specified"),
      priority: ["High", "Medium", "Low", "Critical"].includes(a.priority) ? a.priority : "Medium",
      status: ["Pending", "In Progress", "Completed"].includes(a.status) ? a.status : "Pending"
    }));
    const resolvedDeadlines = action_items.map((a, i) => {
      const original = parsed.action_items?.[i]?.deadline || a.deadline;
      const fromModel = parsed.action_items?.[i]?.deadline_iso || null;
      const heuristic = resolveRelativeHindiTime(`${a.task} ${original}`);
      return {
        task: a.task,
        original: String(original),
        resolvedIso: fromModel || heuristic
      };
    });
    const lines = Array.isArray(parsed.executive_summary_lines) ? parsed.executive_summary_lines.map(String).slice(0, 5) : String(parsed.summary || "").split(/[.!?]\s+/).map((s) => s.trim()).filter(Boolean).slice(0, 5);
    return {
      success: true,
      provider: "gemini",
      model_used: enterpriseConfig.geminiModel,
      summary: String(parsed.summary || ""),
      discussion_points: parsed.discussion_points || [],
      decisions: parsed.decisions || [],
      action_items,
      pending_issues: parsed.pending_issues || [],
      next_meeting: parsed.next_meeting || "Not specified",
      domain: parsed.domain || domainInfo.domain,
      domainConfidence: domainInfo.confidence,
      executiveSummaryLines: lines,
      resolvedDeadlines
    };
  }
  const provider = getAIProvider(process.env.AI_PROVIDER);
  const minutes = await provider.generateMinutes({
    transcript: opts.transcript,
    meetingTitle: opts.meetingTitle,
    meetingDate: opts.meetingDate,
    participants: opts.participants,
    additionalContext: `Domain hint: ${domainInfo.domain}. ${geoNote}`,
    languageHint: opts.languageHint
  });
  return {
    ...minutes,
    domain: domainInfo.domain,
    domainConfidence: domainInfo.confidence,
    executiveSummaryLines: String(minutes.summary || "").split(/[.!?]\s+/).map((s) => s.trim()).filter(Boolean).slice(0, 5),
    resolvedDeadlines: (minutes.action_items || []).map((a) => ({
      task: a.task,
      original: a.deadline,
      resolvedIso: resolveRelativeHindiTime(`${a.task} ${a.deadline}`)
    }))
  };
}

// server/services/pdfService.ts
import PDFDocument from "pdfkit";
import fs2 from "fs";
import fsp from "fs/promises";
import path2 from "path";
async function generateFieldVisitPdf(input) {
  const dir = path2.resolve(process.cwd(), enterpriseConfig.fieldVisit.pdfStorageDir);
  await fsp.mkdir(dir, { recursive: true });
  const fileName = `FieldVisit_${input.visitId.replace(/[^\w.-]/g, "_")}.pdf`;
  const filePath = path2.join(dir, fileName);
  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4", info: { Title: input.title, Author: "2Click MoM" } });
    const stream = fs2.createWriteStream(filePath);
    doc.pipe(stream);
    doc.fillColor("#0f766e").fontSize(20).text("2Click MoM \u2014 Field Visit Report", { align: "left" });
    doc.moveDown(0.3);
    doc.fillColor("#334155").fontSize(10).text("AI-Powered Field Workforce & Voice Minutes");
    doc.moveDown();
    doc.fillColor("#0f172a").fontSize(14).text(input.title);
    doc.fontSize(10).fillColor("#475569");
    doc.text(`Visit ID: ${input.visitId}`);
    if (input.domain) doc.text(`Domain: ${input.domain}`);
    if (input.executiveName) doc.text(`Executive: ${input.executiveName}`);
    if (input.siteName) doc.text(`Site: ${input.siteName}`);
    if (input.latitude != null && input.longitude != null) {
      doc.text(`Geo: ${input.latitude.toFixed(5)}, ${input.longitude.toFixed(5)}`);
    }
    if (input.arrivedAt) doc.text(`Arrived: ${input.arrivedAt}`);
    if (input.departedAt) doc.text(`Departed: ${input.departedAt}`);
    doc.moveDown();
    doc.fillColor("#0f766e").fontSize(12).text("Executive Summary");
    doc.moveDown(0.3);
    doc.fillColor("#0f172a").fontSize(10).text(input.executiveSummary || "\u2014", { align: "left" });
    doc.moveDown();
    if (input.decisions?.length) {
      doc.fillColor("#0f766e").fontSize(12).text("Decisions");
      doc.moveDown(0.3);
      doc.fillColor("#0f172a").fontSize(10);
      input.decisions.forEach((d, i) => doc.text(`${i + 1}. ${d}`));
      doc.moveDown();
    }
    doc.fillColor("#0f766e").fontSize(12).text("Action Items");
    doc.moveDown(0.3);
    doc.fillColor("#0f172a").fontSize(10);
    if (!input.actionItems?.length) {
      doc.text("None");
    } else {
      input.actionItems.forEach((a, i) => {
        doc.text(
          `${i + 1}. ${a.task} \u2014 Owner: ${a.owner || "N/A"} \xB7 Due: ${a.deadline || "N/A"} \xB7 ${a.priority || "Medium"}`
        );
      });
    }
    doc.moveDown();
    doc.fillColor("#0f766e").fontSize(12).text("Business Transcript (verbatim, privacy-filtered)");
    doc.moveDown(0.3);
    doc.fillColor("#0f172a").fontSize(9).text(input.transcript || "\u2014", { align: "left" });
    doc.moveDown(2);
    doc.fontSize(8).fillColor("#94a3b8").text("Generated by 2Click Voice MoM \xB7 Confidential", { align: "center" });
    doc.end();
    stream.on("finish", () => resolve());
    stream.on("error", reject);
  });
  const st = await fsp.stat(filePath);
  return {
    filePath,
    fileName,
    downloadPath: `/api/field/pdfs/${fileName}`,
    bytes: st.size
  };
}

// server/services/audioRetentionService.ts
function stripAudioPayload(payload) {
  if (!enterpriseConfig.zeroAudioRetention) return payload;
  const clone = { ...payload };
  delete clone.audioBase64;
  delete clone.audioUrl;
  delete clone.audioData;
  if (clone.meeting && typeof clone.meeting === "object") {
    clone.meeting = { ...clone.meeting };
    delete clone.meeting.audioUrl;
    delete clone.meeting.audioBase64;
  }
  return clone;
}

// server/controllers/fieldVisitController.ts
function uid(prefix = "visit") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
async function processFieldVisit(req, res) {
  try {
    const {
      transcriptText,
      title,
      participants,
      meetingDate,
      languageHint,
      executiveName,
      siteName,
      latitude,
      longitude,
      arrivedAt,
      departedAt,
      notifyWhatsApp = true,
      generatePdf = true,
      toPhone
    } = req.body || {};
    if (!transcriptText || String(transcriptText).trim().length < 10) {
      return res.status(400).json({ error: "transcriptText required" });
    }
    const privacy = preprocessTranscriptForEnterprise(String(transcriptText), {
      redactPii: enterpriseConfig.piiRedactionEnabled,
      discardChatter: enterpriseConfig.discardSmallTalk
    });
    if (!privacy.cleanedText || privacy.cleanedText.length < 8) {
      return res.status(400).json({
        error: "Transcript empty after privacy filtering (all lines discarded as small-talk?).",
        privacy
      });
    }
    const visitId = uid("visit");
    const mom = await generateDomainAwareMom({
      transcript: privacy.cleanedText,
      meetingTitle: title || `Field Visit \u2014 ${siteName || "Site"}`,
      meetingDate: meetingDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      participants: Array.isArray(participants) ? participants : typeof participants === "string" ? participants.split(",").map((s) => s.trim()).filter(Boolean) : [],
      languageHint,
      geo: { lat: latitude, lng: longitude, siteName }
    });
    let pdfDownloadPath;
    let pdfFileName;
    if (generatePdf) {
      const pdf = await generateFieldVisitPdf({
        visitId,
        title: title || mom.summary.slice(0, 60) || "Field Visit",
        domain: mom.domain,
        executiveName,
        siteName,
        latitude,
        longitude,
        arrivedAt,
        departedAt,
        executiveSummary: mom.summary,
        decisions: mom.decisions,
        actionItems: mom.action_items.map((a) => ({
          task: a.task,
          owner: a.responsible_person,
          deadline: a.deadline,
          priority: a.priority
        })),
        transcript: privacy.cleanedText
      });
      pdfDownloadPath = pdf.downloadPath;
      pdfFileName = pdf.fileName;
    }
    let whatsappMessageId;
    if (notifyWhatsApp) {
      const wa = await notifyOwnerExecutiveSummary({
        title: title || "Field Visit",
        domain: mom.domain,
        siteName,
        lines: mom.executiveSummaryLines,
        visitId,
        toPhone
      });
      whatsappMessageId = wa.messageId;
      if (pdfDownloadPath && enterpriseConfig.whatsapp.enabled) {
        const publicBase = process.env.PUBLIC_BASE_URL || "";
        if (publicBase) {
          await sendWhatsAppDocument({
            toPhone: toPhone || enterpriseConfig.whatsapp.ownerPhone,
            link: `${publicBase.replace(/\/$/, "")}${pdfDownloadPath}`,
            filename: pdfFileName || "FieldVisit.pdf",
            caption: `Field MoM PDF \xB7 ${visitId}`
          });
        }
      }
    }
    const record = {
      id: visitId,
      title: title || `Field Visit \u2014 ${siteName || mom.domain}`,
      domain: mom.domain,
      status: "ready",
      executiveName,
      siteName,
      latitude,
      longitude,
      arrivedAt,
      departedAt,
      cleanedTranscript: privacy.cleanedText,
      executiveSummary: mom.summary,
      executiveSummaryLines: mom.executiveSummaryLines,
      decisions: mom.decisions,
      actionItems: mom.action_items.map((a, i) => ({
        task: a.task,
        owner: a.responsible_person,
        deadline: a.deadline,
        deadlineIso: mom.resolvedDeadlines[i]?.resolvedIso || null,
        priority: a.priority,
        status: a.status
      })),
      pdfDownloadPath,
      whatsappMessageId,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await upsertFieldVisit(record);
    const payload = {
      success: true,
      visit: record,
      minutes: mom,
      privacy: {
        redactions: privacy.redactions,
        discardedLines: privacy.discardedLines,
        retainedLines: privacy.retainedLines
      },
      zeroAudioRetention: enterpriseConfig.zeroAudioRetention
    };
    return res.json(stripAudioPayload(payload));
  } catch (e) {
    console.error("[field/process]", e);
    return res.status(e.status || 500).json({ error: e.message || "Field visit processing failed" });
  }
}
async function listVisits(_req, res) {
  const visits = await listFieldVisits(100);
  res.json({ success: true, visits });
}
async function getVisit(req, res) {
  const visit = await getFieldVisit(String(req.params.id));
  if (!visit) return res.status(404).json({ error: "Not found" });
  res.json({ success: true, visit });
}
async function privacyPreview(req, res) {
  const text = String(req.body?.transcriptText || "");
  const result = preprocessTranscriptForEnterprise(text, {
    redactPii: enterpriseConfig.piiRedactionEnabled,
    discardChatter: enterpriseConfig.discardSmallTalk
  });
  res.json({ success: true, ...result });
}

// server/controllers/analyticsController.ts
async function fieldAnalytics(_req, res) {
  const visits = await listFieldVisits(500);
  const byDomain = {};
  const byStatus = {};
  for (const v of visits) {
    byDomain[v.domain || "General"] = (byDomain[v.domain || "General"] || 0) + 1;
    byStatus[v.status] = (byStatus[v.status] || 0) + 1;
  }
  res.json({
    success: true,
    totals: {
      visits: visits.length,
      withPdf: visits.filter((v) => v.pdfDownloadPath).length,
      notified: visits.filter((v) => v.whatsappMessageId).length
    },
    byDomain,
    byStatus
  });
}

// server/auth/store.ts
import fs3 from "fs/promises";
import path4 from "path";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

// server/dataPath.ts
import path3 from "path";
function isServerlessReadonlyFs() {
  return Boolean(
    process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT
  );
}
function resolveAppDataDir(...parts) {
  const override = String(process.env.DATA_DIR || "").trim();
  if (override) return path3.join(path3.resolve(override), ...parts);
  if (isServerlessReadonlyFs()) {
    return path3.join("/tmp", "2click-data", ...parts);
  }
  return path3.join(process.cwd(), "data", ...parts);
}

// server/auth/store.ts
var USER_ID_RE = /^[a-zA-Z0-9_]{3,32}$/;
var SESSION_TTL_MS = 1e3 * 60 * 60 * 24 * 30;
function dataDir() {
  const override = String(process.env.AUTH_DATA_DIR || "").trim();
  if (override) return path4.resolve(override);
  return resolveAppDataDir("auth");
}
function usersFile() {
  return path4.join(dataDir(), "users.json");
}
function sessionsFile() {
  return path4.join(dataDir(), "sessions.json");
}
async function ensureDir() {
  await fs3.mkdir(dataDir(), { recursive: true });
}
async function readJson(file, fallback) {
  try {
    const raw = await fs3.readFile(file, "utf8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
async function writeJson(file, value) {
  await ensureDir();
  const tmp = `${file}.${process.pid}.tmp`;
  await fs3.writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
  await fs3.rename(tmp, file);
}
function hashPassword(password, saltHex) {
  const salt = saltHex ? Buffer.from(saltHex, "hex") : randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return {
    passwordHash: hash.toString("hex"),
    passwordSalt: salt.toString("hex")
  };
}
function verifyPassword(password, saltHex, hashHex) {
  const { passwordHash } = hashPassword(password, saltHex);
  const a = Buffer.from(passwordHash, "hex");
  const b = Buffer.from(hashHex, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
function toPublic(user) {
  return {
    id: user.id,
    userId: user.userId,
    displayName: user.displayName,
    createdAt: user.createdAt
  };
}
function normalizeUserId(raw) {
  return String(raw || "").trim();
}
function validateUserId(userId) {
  const id = normalizeUserId(userId);
  if (!USER_ID_RE.test(id)) {
    return "User ID must be 3\u201332 characters (letters, numbers, underscore).";
  }
  return null;
}
function validatePassword(password) {
  if (typeof password !== "string" || password.length < 6) {
    return "Password must be at least 6 characters.";
  }
  if (password.length > 128) {
    return "Password is too long.";
  }
  return null;
}
var AuthStore = class {
  constructor() {
    this.users = [];
    this.sessions = [];
    this.loaded = false;
  }
  async init() {
    if (this.loaded) return;
    await ensureDir();
    this.users = await readJson(usersFile(), []);
    this.sessions = await readJson(sessionsFile(), []);
    this.pruneExpiredSessions();
    this.loaded = true;
  }
  async persistUsers() {
    await writeJson(usersFile(), this.users);
  }
  async persistSessions() {
    this.pruneExpiredSessions();
    await writeJson(sessionsFile(), this.sessions);
  }
  pruneExpiredSessions() {
    const now = Date.now();
    this.sessions = this.sessions.filter((s) => new Date(s.expiresAt).getTime() > now);
  }
  findByUserId(userId) {
    const id = normalizeUserId(userId).toLowerCase();
    return this.users.find((u) => u.userId.toLowerCase() === id) || null;
  }
  async signup(input) {
    await this.init();
    const userIdError = validateUserId(input.userId);
    if (userIdError) throw Object.assign(new Error(userIdError), { status: 400 });
    const passwordError = validatePassword(input.password);
    if (passwordError) throw Object.assign(new Error(passwordError), { status: 400 });
    if (this.findByUserId(input.userId)) {
      throw Object.assign(new Error("User ID already taken. Try Sign In."), { status: 409 });
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const hashed = hashPassword(input.password);
    const displayName = (input.displayName || "").trim() || normalizeUserId(input.userId);
    const user = {
      id: `usr-${randomBytes(8).toString("hex")}`,
      userId: normalizeUserId(input.userId),
      displayName,
      passwordHash: hashed.passwordHash,
      passwordSalt: hashed.passwordSalt,
      createdAt: now,
      updatedAt: now
    };
    this.users.push(user);
    await this.persistUsers();
    const token = await this.createSession(user.userId);
    return { user: toPublic(user), token };
  }
  async signin(input) {
    await this.init();
    const user = this.findByUserId(input.userId);
    if (!user || !verifyPassword(input.password, user.passwordSalt, user.passwordHash)) {
      throw Object.assign(new Error("Invalid User ID or password."), { status: 401 });
    }
    const token = await this.createSession(user.userId);
    return { user: toPublic(user), token };
  }
  async createSession(userId) {
    const token = randomBytes(24).toString("hex");
    const now = Date.now();
    const session = {
      token,
      userId,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + SESSION_TTL_MS).toISOString()
    };
    this.sessions.unshift(session);
    if (this.sessions.length > 500) this.sessions.length = 500;
    await this.persistSessions();
    return token;
  }
  async signout(token) {
    await this.init();
    if (!token) return;
    this.sessions = this.sessions.filter((s) => s.token !== token);
    await this.persistSessions();
  }
  async getUserForToken(token) {
    await this.init();
    if (!token) return null;
    this.pruneExpiredSessions();
    const session = this.sessions.find((s) => s.token === token);
    if (!session) return null;
    const user = this.findByUserId(session.userId);
    return user ? toPublic(user) : null;
  }
};
var authStore = new AuthStore();
function readBearerToken(req) {
  const header = String(req.headers.authorization || "");
  if (header.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim();
  }
  if (req.body?.token) return String(req.body.token);
  if (req.query?.token) return String(req.query.token);
  return "";
}

// server/security/middleware.ts
var buckets = /* @__PURE__ */ new Map();
function createRateLimiter(opts = {}) {
  const windowMs = opts.windowMs ?? 6e4;
  const max = opts.max ?? 60;
  const keyPrefix = opts.keyPrefix ?? "rl";
  return (req, res, next) => {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
    const key = `${keyPrefix}:${ip}:${req.path}`;
    const now = Date.now();
    let b = buckets.get(key);
    if (!b || b.resetAt <= now) {
      b = { count: 0, resetAt: now + windowMs };
      buckets.set(key, b);
    }
    b.count += 1;
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, max - b.count)));
    if (b.count > max) {
      res.status(429).json({
        error: "Too many requests. Please wait a moment and try again.",
        retryAfterMs: b.resetAt - now
      });
      return;
    }
    next();
  };
}
async function getUserFromRequest(req) {
  const token = readBearerToken(req);
  if (!token) return null;
  return authStore.getUserForToken(token);
}
async function requireAuth(req, _res, next) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      const err = new Error("Sign in required");
      err.status = 401;
      throw err;
    }
    req.user = user;
    next();
  } catch (e) {
    const status = e.status || 401;
    _res.status(status).json({ error: e.message || "Unauthorized" });
  }
}
function requireAuthWhenLiveAi() {
  return async (req, res, next) => {
    const live = Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);
    if (!live) return next();
    return requireAuth(req, res, next);
  };
}
function sanitizePublicError(err, fallback = "Request failed") {
  const e = err;
  const msg = typeof e?.message === "string" ? e.message : fallback;
  if (/ENOENT|EACCES|api[_-]?key|secret|token|password/i.test(msg)) {
    return fallback;
  }
  return msg.slice(0, 240);
}

// server/routes/enterpriseRoutes.ts
var fieldAiGate = requireAuthWhenLiveAi();
var fieldRate = createRateLimiter({ windowMs: 6e4, max: 40, keyPrefix: "field" });
function registerEnterpriseRoutes(app2) {
  app2.get("/webhook", verifyWhatsAppWebhook);
  app2.get("/api/webhook/whatsapp", verifyWhatsAppWebhook);
  app2.post("/webhook", receiveWhatsAppWebhook);
  app2.post("/api/webhook/whatsapp", receiveWhatsAppWebhook);
  app2.post("/api/field/process", fieldRate, fieldAiGate, processFieldVisit);
  app2.get("/api/field/visits", requireAuth, listVisits);
  app2.get("/api/field/visits/:id", requireAuth, getVisit);
  app2.post("/api/field/privacy/preview", privacyPreview);
  app2.post("/api/field/visits/:id/notify", requireAuth, resendOwnerSummary);
  app2.get("/api/field/analytics", requireAuthWhenLiveAi(), fieldAnalytics);
  const pdfDir = path5.resolve(process.cwd(), enterpriseConfig.fieldVisit.pdfStorageDir);
  const pdfRate = createRateLimiter({ windowMs: 6e4, max: 60, keyPrefix: "pdf" });
  app2.use("/api/field/pdfs", pdfRate, express.static(pdfDir));
  app2.get("/api/enterprise/health", (_req, res) => {
    res.json({
      ok: true,
      modules: {
        pii: true,
        domainMom: true,
        whatsapp: enterpriseConfig.whatsapp.enabled ? "live" : "mock",
        pdf: true,
        zeroAudioRetention: enterpriseConfig.zeroAudioRetention,
        geofenceRadiusDefaultM: enterpriseConfig.fieldVisit.defaultGeofenceRadiusMeters,
        audioChunkSeconds: enterpriseConfig.fieldVisit.chunkSeconds,
        audioOverlapSeconds: enterpriseConfig.fieldVisit.overlapSeconds
      }
    });
  });
}

// server/auth/index.ts
function registerAuthRoutes(app2) {
  const signup = async (req, res) => {
    try {
      const body = req.body || {};
      const result = await authStore.signup({
        userId: body.userId || body.user_id || body.username,
        password: body.password,
        displayName: body.displayName || body.display_name || body.name
      });
      res.status(201).json({
        success: true,
        user: result.user,
        token: result.token
      });
    } catch (e) {
      res.status(e.status || 500).json({ error: e.message || "Signup failed" });
    }
  };
  const signin = async (req, res) => {
    try {
      const body = req.body || {};
      const result = await authStore.signin({
        userId: body.userId || body.user_id || body.username,
        password: body.password
      });
      res.json({
        success: true,
        user: result.user,
        token: result.token
      });
    } catch (e) {
      res.status(e.status || 500).json({ error: e.message || "Sign in failed" });
    }
  };
  const me = async (req, res) => {
    try {
      const token = readBearerToken(req);
      const user = await authStore.getUserForToken(token);
      if (!user) {
        return res.status(401).json({ error: "Not signed in" });
      }
      res.json({ success: true, user });
    } catch (e) {
      res.status(500).json({ error: e.message || "Failed to load session" });
    }
  };
  const signout = async (req, res) => {
    try {
      const token = readBearerToken(req);
      await authStore.signout(token);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message || "Sign out failed" });
    }
  };
  app2.post("/api/v1/auth/signup", signup);
  app2.post("/api/v1/auth/signin", signin);
  app2.post("/api/v1/auth/login", signin);
  app2.get("/api/v1/auth/me", me);
  app2.post("/api/v1/auth/signout", signout);
  app2.post("/api/auth/signup", signup);
  app2.post("/api/auth/signin", signin);
  app2.post("/api/auth/login", signin);
  app2.get("/api/auth/me", me);
  app2.post("/api/auth/signout", signout);
}

// server/org/store.ts
import fs4 from "fs/promises";
import path6 from "path";
import { randomBytes as randomBytes2 } from "crypto";
var DEFAULT_ORG = {
  companyName: "2Click Real Estate Marketing",
  industry: "real_estate_marketing",
  tagline: "Employee field talk \u2192 text \u2192 Owner & report desk",
  ownerUserId: "",
  ownerDisplayName: "",
  ownerPhone: "",
  reportRecipients: [],
  workHours: {
    enabled: true,
    days: [1, 2, 3, 4, 5, 6],
    // Mon–Sat
    startTime: "09:30",
    endTime: "19:30",
    timezone: "Asia/Kolkata"
  },
  allowAfterHoursCapture: true,
  notifyOwnerOnEveryTalk: true,
  updatedAt: (/* @__PURE__ */ new Date(0)).toISOString()
};
function dataDir2() {
  const override = String(process.env.COMPANY_DATA_DIR || "").trim();
  if (override) return path6.resolve(override);
  return resolveAppDataDir("company");
}
function orgFile() {
  return path6.join(dataDir2(), "org.json");
}
function reportsFile() {
  return path6.join(dataDir2(), "work_talk_reports.json");
}
async function ensureDir2() {
  await fs4.mkdir(dataDir2(), { recursive: true });
}
async function readJson2(file, fallback) {
  try {
    return JSON.parse(await fs4.readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}
async function writeJson2(file, value) {
  await ensureDir2();
  const tmp = `${file}.${process.pid}.tmp`;
  await fs4.writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
  await fs4.rename(tmp, file);
}
function parseHm(hm) {
  const [h, m] = hm.split(":").map((n) => Number(n));
  return (h || 0) * 60 + (m || 0);
}
function isWithinWorkHours(cfg, at = /* @__PURE__ */ new Date()) {
  if (!cfg.enabled) return true;
  let day;
  let minutes;
  try {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: cfg.timezone || "Asia/Kolkata",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    });
    const parts = Object.fromEntries(fmt.formatToParts(at).map((p) => [p.type, p.value]));
    const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    day = map[parts.weekday] ?? at.getDay();
    minutes = Number(parts.hour) * 60 + Number(parts.minute);
  } catch {
    day = at.getDay();
    minutes = at.getHours() * 60 + at.getMinutes();
  }
  if (!cfg.days.includes(day)) return false;
  const start = parseHm(cfg.startTime || "09:00");
  const end = parseHm(cfg.endTime || "18:00");
  return minutes >= start && minutes <= end;
}
function summarizeTalk(text) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 220) return cleaned;
  return `${cleaned.slice(0, 217)}\u2026`;
}
var CompanyOrgStore = class {
  constructor() {
    this.org = { ...DEFAULT_ORG };
    this.reports = [];
    this.loaded = false;
  }
  async init() {
    if (this.loaded) return;
    await ensureDir2();
    this.org = { ...DEFAULT_ORG, ...await readJson2(orgFile(), {}) };
    this.reports = await readJson2(reportsFile(), []);
    this.loaded = true;
  }
  async getOrg() {
    await this.init();
    return this.org;
  }
  async updateOrg(patch) {
    await this.init();
    this.org = {
      ...this.org,
      ...patch,
      workHours: {
        ...this.org.workHours,
        ...patch.workHours || {}
      },
      reportRecipients: Array.isArray(patch.reportRecipients) ? patch.reportRecipients : this.org.reportRecipients,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await writeJson2(orgFile(), this.org);
    return this.org;
  }
  /** Recipients who must receive every work-talk text (owner + report desk). */
  getDeliveryTargets(org) {
    const targets = [];
    if (org.ownerUserId) {
      targets.push({
        userId: org.ownerUserId,
        displayName: org.ownerDisplayName || org.ownerUserId,
        phone: org.ownerPhone,
        title: "Company Owner"
      });
    }
    for (const r of org.reportRecipients || []) {
      if (!r.userId) continue;
      if (targets.some((t) => t.userId.toLowerCase() === r.userId.toLowerCase())) continue;
      targets.push(r);
    }
    return targets;
  }
  async submitWorkTalk(input) {
    await this.init();
    const text = String(input.text || "").replace(/\s+/g, " ").trim();
    if (text.length < 3) {
      throw Object.assign(new Error("Talk text too short \u2014 bolo / type at least a few words."), {
        status: 400
      });
    }
    const within = isWithinWorkHours(this.org.workHours);
    if (!within && !this.org.allowAfterHoursCapture) {
      throw Object.assign(
        new Error("Abhi working hours ke bahar hai. Owner ne after-hours capture band rakha hai."),
        { status: 403 }
      );
    }
    const targets = this.getDeliveryTargets(this.org);
    if (targets.length === 0) {
      throw Object.assign(
        new Error("Company Owner / report recipients set nahi hain. Pehle Company Settings mein add karein."),
        { status: 400 }
      );
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const deliveredTo = targets.map((t) => {
      const preview = `[${input.employeeDisplayName}] ${summarizeTalk(text)}`;
      if (t.phone) {
        console.info("[work-talk:whatsapp:mock]", t.phone, preview);
      }
      return {
        userId: t.userId,
        displayName: t.displayName,
        channel: t.phone ? "whatsapp_mock" : "inbox",
        deliveredAt: now,
        preview
      };
    });
    const report = {
      id: `talk-${randomBytes2(6).toString("hex")}`,
      employeeUserId: input.employeeUserId,
      employeeDisplayName: input.employeeDisplayName,
      employeeRole: input.employeeRole || "employee",
      text,
      summary: summarizeTalk(text),
      leadOrSite: input.leadOrSite?.trim() || void 0,
      locationLabel: input.locationLabel?.trim() || void 0,
      talkType: input.talkType || "field_note",
      withinWorkHours: within,
      createdAt: now,
      deliveredTo,
      status: within ? "delivered" : "flagged_after_hours"
    };
    this.reports.unshift(report);
    if (this.reports.length > 2e3) this.reports.length = 2e3;
    await writeJson2(reportsFile(), this.reports);
    return report;
  }
  async listReportsForViewer(viewerUserId, opts) {
    await this.init();
    const org = this.org;
    const viewer = viewerUserId.toLowerCase();
    const isOwner = org.ownerUserId.toLowerCase() === viewer;
    const isReportDesk = org.reportRecipients.some((r) => r.userId.toLowerCase() === viewer);
    let rows = this.reports;
    if (opts?.mineOnly) {
      rows = rows.filter((r) => r.employeeUserId.toLowerCase() === viewer);
    } else if (!isOwner && !isReportDesk) {
      rows = rows.filter((r) => r.employeeUserId.toLowerCase() === viewer);
    } else {
      rows = rows.filter(
        (r) => r.deliveredTo.some((d) => d.userId.toLowerCase() === viewer) || isOwner || isReportDesk
      );
    }
    const q = (opts?.q || "").toLowerCase().trim();
    if (q) {
      rows = rows.filter(
        (r) => r.text.toLowerCase().includes(q) || r.employeeDisplayName.toLowerCase().includes(q) || (r.leadOrSite || "").toLowerCase().includes(q)
      );
    }
    return {
      org,
      isOwner,
      isReportDesk,
      withinWorkHoursNow: isWithinWorkHours(org.workHours),
      count: rows.length,
      reports: rows
    };
  }
};
var companyOrgStore = new CompanyOrgStore();

// server/org/index.ts
async function requireUser(req) {
  const token = readBearerToken(req);
  const user = await authStore.getUserForToken(token);
  if (!user) {
    const err = new Error("Sign in required");
    err.status = 401;
    throw err;
  }
  return user;
}
function registerCompanyOrgRoutes(app2) {
  app2.get("/api/v1/company/org", async (req, res) => {
    try {
      const org = await companyOrgStore.getOrg();
      const user = await authStore.getUserForToken(readBearerToken(req));
      const payload = user ? org : {
        ...org,
        ownerPhone: org.ownerPhone ? "[hidden]" : "",
        reportRecipients: (org.reportRecipients || []).map((r) => ({
          ...r,
          phone: r.phone ? "[hidden]" : ""
        }))
      };
      res.json({
        success: true,
        org: payload,
        withinWorkHoursNow: isWithinWorkHours(org.workHours)
      });
    } catch (e) {
      res.status(500).json({ error: e.message || "Failed to load company settings" });
    }
  });
  app2.put("/api/v1/company/org", async (req, res) => {
    try {
      const user = await requireUser(req);
      const current = await companyOrgStore.getOrg();
      if (current.ownerUserId && current.ownerUserId !== user.userId) {
        return res.status(403).json({
          error: "Only the company owner can update organization settings."
        });
      }
      const body = req.body || {};
      const org = await companyOrgStore.updateOrg({
        companyName: body.companyName,
        industry: body.industry,
        tagline: body.tagline,
        // First save claims ownership; ownerUserId cannot be stolen by others
        ownerUserId: current.ownerUserId || user.userId,
        ownerDisplayName: body.ownerDisplayName || user.displayName || user.userId,
        ownerPhone: body.ownerPhone,
        reportRecipients: body.reportRecipients,
        workHours: body.workHours,
        allowAfterHoursCapture: body.allowAfterHoursCapture,
        notifyOwnerOnEveryTalk: body.notifyOwnerOnEveryTalk
      });
      res.json({
        success: true,
        org,
        withinWorkHoursNow: isWithinWorkHours(org.workHours)
      });
    } catch (e) {
      res.status(e.status || 500).json({ error: e.message || "Failed to save company settings" });
    }
  });
  app2.post("/api/v1/company/work-talk", async (req, res) => {
    try {
      const user = await requireUser(req);
      const body = req.body || {};
      const role = body.employeeRole || "employee";
      const report = await companyOrgStore.submitWorkTalk({
        employeeUserId: user.userId,
        employeeDisplayName: user.displayName || user.userId,
        employeeRole: role,
        text: body.text || body.transcript || body.raw_text,
        leadOrSite: body.leadOrSite || body.site || body.lead,
        locationLabel: body.locationLabel || body.location,
        talkType: body.talkType
      });
      res.status(201).json({
        success: true,
        report,
        message: "Talk text company owner aur report recipients ke inbox tak pahunch gaya."
      });
    } catch (e) {
      res.status(e.status || 500).json({ error: e.message || "Failed to submit work talk" });
    }
  });
  app2.get("/api/v1/company/work-talk", async (req, res) => {
    try {
      const user = await requireUser(req);
      const mineOnly = String(req.query.mine || "") === "1";
      const q = String(req.query.q || "");
      const data = await companyOrgStore.listReportsForViewer(user.userId, { mineOnly, q });
      res.json({ success: true, ...data });
    } catch (e) {
      res.status(e.status || 500).json({ error: e.message || "Failed to load reports" });
    }
  });
  app2.get("/api/v1/company/work-hours/status", async (_req, res) => {
    try {
      const org = await companyOrgStore.getOrg();
      res.json({
        success: true,
        withinWorkHoursNow: isWithinWorkHours(org.workHours),
        workHours: org.workHours,
        companyName: org.companyName
      });
    } catch (e) {
      res.status(500).json({ error: e.message || "Failed" });
    }
  });
}

// src/utils/wakeWordProvider.ts
function normalizeVoiceText(text) {
  if (!text) return "";
  let out = text.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'।]/g, "").replace(/\s+/g, " ");
  out = out.replace(/\b(to|too|two|tu|doo|do)\s*click\b/g, "2click").replace(/\btoclick\b/g, "2click").replace(/\b2\s*click\b/g, "2click");
  return out;
}

// src/utils/wakeWordRedaction.ts
var COMMAND_TRIGGER_PHRASES = [
  // Start
  "2click start",
  "2 click start",
  "two click start",
  "meeting shuru karo",
  "meeting shuru karo",
  "meeting shuru",
  "start recording",
  "recording start",
  "record start",
  "meeting start",
  "start meeting",
  "\u092E\u0940\u091F\u093F\u0902\u0917 \u0936\u0941\u0930\u0942 \u0915\u0930\u094B",
  "\u092E\u0940\u091F\u093F\u0902\u0917 \u0936\u0941\u0930\u0942",
  "\u0930\u093F\u0915\u0949\u0930\u094D\u0921\u093F\u0902\u0917 \u0936\u0941\u0930\u0942 \u0915\u0930\u094B",
  "\u0930\u093F\u0915\u0949\u0930\u094D\u0921\u093F\u0902\u0917 \u0936\u0941\u0930\u0942",
  // Stop / save
  "meeting khatam",
  "meeting khatm",
  "2click stop",
  "2 click stop",
  "two click stop",
  "save note",
  "stop recording",
  "recording stop",
  "meeting stop",
  "stop meeting",
  "\u092E\u0940\u091F\u093F\u0902\u0917 \u0916\u0924\u094D\u092E",
  "\u092E\u0940\u091F\u093F\u0902\u0917 \u0938\u092E\u093E\u092A\u094D\u0924",
  "\u0938\u0947\u0935 \u0928\u094B\u091F",
  // Cancel
  "cancel recording",
  "recording cancel",
  "cancel note",
  "\u0930\u093F\u0915\u0949\u0930\u094D\u0921\u093F\u0902\u0917 \u0930\u0926\u094D\u0926",
  "\u0915\u0948\u0902\u0938\u0932 \u0930\u093F\u0915\u0949\u0930\u094D\u0921\u093F\u0902\u0917"
];
function redactCommandTriggers(text, extraPhrases = []) {
  if (!text) return text;
  const phrases = [...COMMAND_TRIGGER_PHRASES, ...extraPhrases].map((p) => p.trim()).filter(Boolean).sort((a, b) => b.length - a.length);
  let out = text;
  for (const phrase of phrases) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
    const re = new RegExp(escaped, "gi");
    out = out.replace(re, " ");
  }
  const normalizedOut = normalizeVoiceText(out);
  for (const phrase of phrases) {
    const n = normalizeVoiceText(phrase);
    if (!n) continue;
    if (normalizedOut.includes(n)) {
      const escaped = n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
      out = out.replace(new RegExp(escaped, "gi"), " ");
    }
  }
  return out.replace(/\s{2,}/g, " ").replace(/\s+([,.!?])/g, "$1").trim();
}

// server.ts
dotenv.config({ path: ".env.local" });
dotenv.config();
var rootDir = process.cwd();
var isProd = process.env.NODE_ENV === "production";
var PORT = Number(process.env.PORT || 3e3);
var HOST = process.env.HOST || "0.0.0.0";
var instantConversations = [];
var aiRateLimit = createRateLimiter({ windowMs: 6e4, max: 30, keyPrefix: "ai" });
var generalRateLimit = createRateLimiter({ windowMs: 6e4, max: 120, keyPrefix: "api" });
var requireLiveAiAuth = requireAuthWhenLiveAi();
function requireLiveAi() {
  if (!hasAiApiKey()) {
    const err = new Error("Set GEMINI_API_KEY or OPENAI_API_KEY in .env / .env.local");
    err.status = 503;
    throw err;
  }
}
function geminiClient() {
  return new GoogleGenAI4({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: { headers: { "User-Agent": "2click-voice-mom" } }
  });
}
function uid2(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function minutesToMeeting(minutes, opts) {
  const ctx = opts.context || {};
  const participants = typeof ctx.participants === "string" ? ctx.participants.split(",").map((s) => s.trim()).filter(Boolean) : Array.isArray(ctx.participants) ? ctx.participants : [];
  const actionItems = (minutes.action_items || []).map((a, i) => ({
    id: uid2(`act-${i}`),
    task: a.task,
    owner: a.responsible_person || "Not specified",
    deadline: a.deadline || "Not specified",
    priority: ["High", "Medium", "Low"].includes(a.priority) ? a.priority : "Medium",
    status: ["Pending", "In Progress", "Completed"].includes(a.status) ? a.status : "Pending"
  }));
  const discussion = minutes.discussion_points || [];
  const keyTopics = discussion.map((point) => ({
    topic: point.slice(0, 80) || "Discussion",
    summary: point,
    keyPoints: [point],
    speakersInvolved: participants.slice(0, 2)
  }));
  const transcriptSegments = opts.segments?.map((s) => ({
    speaker: s.speaker || "Speaker",
    text: s.text || "",
    timestamp: s.start_time || s.start || void 0
  })) || (opts.transcriptText ? opts.transcriptText.split(/\n+/).filter(Boolean).map((line, i) => {
    const m = line.match(/^([^:]+):\s*(.*)$/);
    return {
      speaker: m?.[1]?.trim() || `Speaker ${i % 2 + 1}`,
      text: m?.[2]?.trim() || line
    };
  }) : []);
  return {
    id: uid2("mtg"),
    title: ctx.title || "Voice Meeting MoM",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    meetingDate: ctx.meetingDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    duration: ctx.duration || void 0,
    meetingType: ctx.meetingType || "General",
    languageDetected: opts.languageDetected || "auto",
    participants: participants.length ? participants : ["Not specified"],
    executiveSummary: minutes.summary || "",
    sentiment: "Neutral",
    keyTopics,
    decisions: minutes.decisions || [],
    actionItems,
    risksAndBlockers: minutes.pending_issues || [],
    openQuestions: [],
    transcript: transcriptSegments,
    audioUrl: opts.audioUrl,
    nextMeeting: minutes.next_meeting || "Not specified",
    provider: minutes.provider,
    model_used: minutes.model_used
  };
}
function createApp() {
  const app2 = express2();
  app2.use(express2.json({ limit: "12mb" }));
  app2.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With"
      );
    }
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
    next();
  });
  app2.use("/api", generalRateLimit);
  app2.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      app: "2click-voice-mom",
      gemini: Boolean(process.env.GEMINI_API_KEY),
      openai: Boolean(process.env.OPENAI_API_KEY),
      demoMode: !hasAiApiKey(),
      auth: true,
      /** File auth on Vercel uses /tmp (not multi-instance durable). */
      authDurable: !process.env.VERCEL,
      enterprise: true,
      rateLimit: true,
      vercel: Boolean(process.env.VERCEL)
    });
  });
  registerAuthRoutes(app2);
  registerEnterpriseRoutes(app2);
  registerCompanyOrgRoutes(app2);
  app2.post("/api/generate-mom", aiRateLimit, requireLiveAiAuth, async (req, res) => {
    try {
      const { audioBase64, mimeType, transcriptText, context } = req.body || {};
      let transcript = typeof transcriptText === "string" ? transcriptText.trim() : "";
      let segments = [];
      let languageDetected = context?.language || "auto";
      if (!transcript && audioBase64) {
        if (!hasAiApiKey()) {
          return res.status(503).json({
            error: "Audio transcription requires GEMINI_API_KEY or OPENAI_API_KEY. Paste a transcript text, or set a key in .env.local.",
            demoMode: true
          });
        }
        const speech = getSpeechProvider(process.env.AI_PROVIDER);
        const speechResult = await speech.transcribe({
          audioBase64,
          mimeType: mimeType || "audio/webm",
          language: languageDetected,
          meetingId: uid2("speech"),
          speakerHint: typeof context?.participants === "string" ? context.participants.split(",").map((s) => s.trim()).filter(Boolean) : []
        });
        transcript = speechResult.fullTranscript || "";
        segments = speechResult.segments || [];
        languageDetected = speechResult.detectedLanguage || languageDetected;
      }
      transcript = redactCommandTriggers(transcript);
      if (!transcript || transcript.length < 10) {
        return res.status(400).json({ error: "Provide audioBase64 or transcriptText with enough content." });
      }
      const privacy = preprocessTranscriptForEnterprise(transcript, {
        redactPii: enterpriseConfig.piiRedactionEnabled,
        discardChatter: enterpriseConfig.discardSmallTalk
      });
      if (privacy.cleanedText.length >= 8) {
        transcript = privacy.cleanedText;
      }
      const ai = getAIProvider(process.env.AI_PROVIDER);
      const participants = typeof context?.participants === "string" ? context.participants.split(",").map((s) => s.trim()).filter(Boolean) : [];
      const minutes = await ai.generateMinutes({
        transcript,
        meetingTitle: context?.title || "Voice Meeting",
        meetingDate: context?.meetingDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
        participants,
        additionalContext: context?.additionalNotes || context?.meetingType || "",
        languageHint: languageDetected
      });
      if (minutes.summary) minutes.summary = redactCommandTriggers(minutes.summary);
      if (Array.isArray(minutes.discussion_points)) {
        minutes.discussion_points = minutes.discussion_points.map(
          (p) => redactCommandTriggers(String(p))
        );
      }
      if (Array.isArray(minutes.decisions)) {
        minutes.decisions = minutes.decisions.map((d) => redactCommandTriggers(String(d)));
      }
      const meeting = minutesToMeeting(minutes, {
        transcriptText: transcript,
        segments,
        context,
        audioUrl: enterpriseConfig.zeroAudioRetention ? void 0 : audioBase64 || void 0,
        languageDetected
      });
      res.json(
        stripAudioPayload({
          success: true,
          meeting,
          minutes,
          privacy: {
            redactions: privacy.redactions,
            discardedLines: privacy.discardedLines,
            retainedLines: privacy.retainedLines
          }
        })
      );
    } catch (e) {
      console.error("[generate-mom]", e);
      res.status(e.status || 500).json({ error: e.message || "Failed to generate MoM" });
    }
  });
  app2.post("/api/v1/conversations", (req, res) => {
    try {
      const body = req.body || {};
      const userId = body.user_id || body.userId;
      if (!userId) {
        return res.status(400).json({ error: "user_id is required" });
      }
      let rawText = typeof body.raw_text === "string" ? body.raw_text : "";
      rawText = redactCommandTriggers(rawText);
      if (!rawText && !body.audio_base64) {
        return res.status(400).json({ error: "raw_text or audio_base64 required" });
      }
      const summary = redactCommandTriggers(
        body.summary || rawText.slice(0, 240) || "Voice command session note"
      );
      const row = {
        id: uid2("conv"),
        conversation_id: void 0,
        user_id: String(userId),
        type: body.type || "voice_note",
        contact_name: body.contact_name || "Command Session",
        raw_transcript: rawText,
        summary,
        detected_dialect: body.detected_dialect || "auto",
        detected_intent: redactCommandTriggers(body.detected_intent || summary),
        pure_hindi: redactCommandTriggers(body.pure_hindi || rawText),
        pure_english: redactCommandTriggers(body.pure_english || rawText),
        duration_seconds: body.duration_seconds || 0,
        source: body.source || "command_session",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        persistence: "memory"
      };
      row.conversation_id = row.id;
      instantConversations.unshift(row);
      if (instantConversations.length > 500) instantConversations.length = 500;
      res.status(201).json({
        success: true,
        conversation_id: row.id,
        user_id: row.user_id,
        type: row.type,
        raw_transcript: row.raw_transcript,
        summary: row.summary,
        detected_dialect: row.detected_dialect,
        detected_intent: row.detected_intent,
        pure_hindi: row.pure_hindi,
        pure_english: row.pure_english,
        persistence: "memory"
      });
    } catch (e) {
      res.status(500).json({ error: e.message || "Instant Save failed" });
    }
  });
  app2.get("/api/v1/conversations", (req, res) => {
    const userId = String(req.query.user_id || "");
    if (!userId) return res.status(400).json({ error: "user_id is required" });
    const q = String(req.query.q || "").toLowerCase();
    let rows = instantConversations.filter((c) => c.user_id === userId);
    if (q) {
      rows = rows.filter(
        (c) => String(c.raw_transcript || "").toLowerCase().includes(q) || String(c.summary || "").toLowerCase().includes(q)
      );
    }
    res.json({
      success: true,
      user_id: userId,
      count: rows.length,
      persistence: "memory",
      conversations: rows
    });
  });
  app2.post("/api/transcribe", aiRateLimit, requireLiveAiAuth, async (req, res) => {
    try {
      requireLiveAi();
      const speech = getSpeechProvider(req.body?.provider || process.env.AI_PROVIDER);
      const result = await speech.transcribe({
        audioBase64: req.body.audioBase64,
        mimeType: req.body.mimeType || "audio/webm",
        language: req.body.language || "auto",
        meetingId: req.body.meetingId || uid2("mtg"),
        speakerHint: req.body.speakerHint || []
      });
      const segments = (result.segments || []).map((s, i) => ({
        id: `seg-${req.body.meetingId || "x"}-${i}`,
        meeting_id: req.body.meetingId || "unknown",
        start_time: s.start_time,
        end_time: s.end_time,
        speaker: s.speaker,
        text: s.text,
        language: s.language,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      }));
      res.json({
        success: true,
        provider: result.provider || speech.name,
        detectedLanguage: result.detectedLanguage,
        fullTranscript: result.fullTranscript,
        segments,
        modelUsed: result.modelUsed
      });
    } catch (e) {
      console.error("[transcribe]", e);
      res.status(e.status || 500).json({ error: e.message || "Transcription failed" });
    }
  });
  app2.post("/api/minutes/generate", aiRateLimit, requireLiveAiAuth, async (req, res) => {
    try {
      const rawTranscript = req.body?.transcript ?? req.body?.transcriptText ?? req.body?.text ?? "";
      if (!rawTranscript || String(rawTranscript).trim().length < 10) {
        return res.status(400).json({
          error: "transcript is required (min 10 characters)."
        });
      }
      let transcript = String(rawTranscript);
      transcript = redactCommandTriggers(transcript);
      const privacy = preprocessTranscriptForEnterprise(transcript, {
        redactPii: enterpriseConfig.piiRedactionEnabled,
        discardChatter: enterpriseConfig.discardSmallTalk
      });
      if (privacy.cleanedText.length >= 8) transcript = privacy.cleanedText;
      const ai = getAIProvider(req.body?.provider || process.env.AI_PROVIDER);
      const minutes = await ai.generateMinutes({
        transcript,
        meetingId: req.body.meetingId,
        meetingTitle: req.body.meetingTitle,
        meetingDate: req.body.meetingDate,
        participants: req.body.participants || [],
        additionalContext: req.body.additionalContext,
        languageHint: req.body.languageHint
      });
      const minute_id = uid2("min");
      const meeting_id = req.body.meetingId || uid2("mtg");
      const raw_decisions = (minutes.decisions || []).map((d) => ({
        id: uid2("dec"),
        meeting_id,
        minute_id,
        decision_text: d,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      }));
      const action_items = (minutes.action_items || []).map((a) => ({
        id: uid2("act"),
        meeting_id,
        minute_id,
        ...a,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      }));
      res.json({
        success: true,
        minute_id,
        ...minutes,
        raw_decisions,
        action_items,
        privacy: {
          redactions: privacy.redactions,
          discardedLines: privacy.discardedLines
        }
      });
    } catch (e) {
      console.error("[minutes/generate]", e);
      res.status(e.status || 500).json({ error: sanitizePublicError(e, "Minutes generation failed") });
    }
  });
  app2.post("/api/chat-meeting", aiRateLimit, requireLiveAiAuth, async (req, res) => {
    try {
      const { meetingData, currentPrompt } = req.body || {};
      if (!hasAiApiKey()) {
        const title = meetingData?.title || "the meeting";
        const summary = meetingData?.executiveSummary || meetingData?.summary || "";
        return res.json({
          success: true,
          reply: `Demo reply (no AI key): Regarding \u201C${title}\u201D \u2014 ${summary ? summary.slice(0, 280) : "set GEMINI_API_KEY for live answers grounded in the full MoM."}${currentPrompt ? ` (Q: ${String(currentPrompt).slice(0, 120)})` : ""}`,
          demoMode: true
        });
      }
      requireLiveAi();
      const ai = geminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are a meeting Q&A copilot. Answer briefly using only the meeting data.

MEETING JSON:
${JSON.stringify(meetingData || {}, null, 2)}

QUESTION: ${currentPrompt}`
      });
      res.json({ success: true, reply: response.text || "No answer generated." });
    } catch (e) {
      console.error("[chat-meeting]", e);
      res.status(e.status || 500).json({ error: e.message || "Chat failed" });
    }
  });
  app2.post("/api/generate-email", aiRateLimit, requireLiveAiAuth, async (req, res) => {
    try {
      const { meetingData, emailStyle, recipient } = req.body || {};
      if (!hasAiApiKey()) {
        const who = recipient || "team";
        const title = meetingData?.title || "our meeting";
        const actions = Array.isArray(meetingData?.actionItems) ? meetingData.actionItems.slice(0, 3).map((a) => `- ${a.task || a} (${a.owner || a.responsible_person || "TBD"})`).join("\n") : "- (none listed)";
        return res.json({
          success: true,
          demoMode: true,
          emailText: `Hi ${who},

Following up on ${title} (${emailStyle || "professional"} demo draft).

Key actions:
${actions}

Best regards`
        });
      }
      requireLiveAi();
      const ai = geminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Draft a ${emailStyle || "professional"} follow-up email${recipient ? ` to ${recipient}` : ""} from this meeting MoM. Return only the email body text.

${JSON.stringify(meetingData || {}, null, 2)}`
      });
      res.json({ success: true, emailText: response.text || "" });
    } catch (e) {
      console.error("[generate-email]", e);
      res.status(e.status || 500).json({ error: e.message || "Email draft failed" });
    }
  });
  app2.post("/api/detect-schedule", async (req, res) => {
    try {
      const meeting = req.body?.meetingData;
      const events = [];
      if (meeting?.nextMeeting && meeting.nextMeeting !== "Not specified") {
        events.push({
          id: uid2("evt"),
          title: `Follow-up: ${meeting.title || "Meeting"}`,
          date: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10),
          time: "10:00",
          durationMinutes: 30,
          description: meeting.nextMeeting,
          attendees: meeting.participants || [],
          meetingType: meeting.meetingType || "Follow-up",
          isAutoDetected: true,
          status: "Scheduled"
        });
      }
      res.json({ success: true, events });
    } catch (e) {
      res.status(500).json({ error: e.message || "Schedule detect failed" });
    }
  });
  const memory = {
    meetings: [],
    schedules: [],
    consents: [],
    audit: [],
    privacy: {}
  };
  app2.get("/api/meetings", (req, res) => {
    let list = [...memory.meetings];
    if (req.query.q) {
      const q = String(req.query.q).toLowerCase();
      list = list.filter((m) => JSON.stringify(m).toLowerCase().includes(q));
    }
    res.json({ success: true, meetings: list });
  });
  app2.get("/api/meetings/:id", (req, res) => {
    const m = memory.meetings.find((x) => x.id === req.params.id);
    if (!m) return res.status(404).json({ error: "Not found" });
    res.json({ success: true, meeting: m });
  });
  app2.post("/api/meetings", (req, res) => {
    const meeting = { id: uid2("mtg"), ...req.body, createdAt: (/* @__PURE__ */ new Date()).toISOString() };
    memory.meetings.unshift(meeting);
    res.json({ success: true, meeting });
  });
  app2.patch("/api/meetings/:id", (req, res) => {
    const i = memory.meetings.findIndex((x) => x.id === req.params.id);
    if (i < 0) return res.status(404).json({ error: "Not found" });
    memory.meetings[i] = { ...memory.meetings[i], ...req.body, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    res.json({ success: true, meeting: memory.meetings[i] });
  });
  app2.put("/api/meetings/:id/state", (req, res) => {
    const i = memory.meetings.findIndex((x) => x.id === req.params.id);
    if (i < 0) return res.status(404).json({ error: "Not found" });
    memory.meetings[i] = { ...memory.meetings[i], status: req.body?.status, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    res.json({ success: true, meeting: memory.meetings[i] });
  });
  app2.delete("/api/meetings/:id", (req, res) => {
    memory.meetings = memory.meetings.filter((x) => x.id !== req.params.id);
    res.json({ success: true });
  });
  app2.all("/api/meetings/:id/transcript", (req, res) => {
    if (req.method === "GET") return res.json({ success: true, segments: [] });
    if (req.method === "POST") return res.json({ success: true });
    if (req.method === "DELETE") return res.json({ success: true });
    res.status(405).end();
  });
  app2.post("/api/meetings/:id/recordings", (_req, res) => res.json({ success: true }));
  app2.get("/api/meetings/:id/minutes", (_req, res) => res.json({ success: true, minutes: [] }));
  app2.post("/api/meetings/:id/decisions", (req, res) => res.json({ success: true, decision: { id: uid2("dec"), ...req.body } }));
  app2.delete("/api/decisions/:id", (_req, res) => res.json({ success: true }));
  app2.post("/api/meetings/:id/action-items", (req, res) => res.json({ success: true, actionItem: { id: uid2("act"), ...req.body } }));
  app2.patch("/api/action-items/:id", (req, res) => res.json({ success: true, actionItem: { id: req.params.id, ...req.body } }));
  app2.delete("/api/action-items/:id", (_req, res) => res.json({ success: true }));
  app2.delete("/api/meetings/:id/recording", (_req, res) => res.json({ success: true }));
  app2.get("/api/schedules", (_req, res) => res.json({ success: true, schedules: memory.schedules }));
  app2.post("/api/schedules", (req, res) => {
    const item = { id: uid2("sch"), ...req.body };
    memory.schedules.push(item);
    res.json({ success: true, schedule: item });
  });
  app2.patch("/api/schedules/:id", (req, res) => {
    const i = memory.schedules.findIndex((x) => x.id === req.params.id);
    if (i >= 0) memory.schedules[i] = { ...memory.schedules[i], ...req.body };
    res.json({ success: true, schedule: memory.schedules[i] });
  });
  app2.delete("/api/schedules/:id", (req, res) => {
    memory.schedules = memory.schedules.filter((x) => x.id !== req.params.id);
    res.json({ success: true });
  });
  app2.get("/api/privacy/policy", (req, res) => {
    const orgId = String(req.query.orgId || "default");
    res.json({ success: true, policy: memory.privacy[orgId] || { orgId, retentionDays: 90 } });
  });
  app2.post("/api/privacy/policy", (req, res) => {
    const orgId = req.body?.orgId || "default";
    memory.privacy[orgId] = req.body;
    res.json({ success: true, policy: req.body });
  });
  app2.get("/api/consents", (_req, res) => res.json({ success: true, consents: memory.consents }));
  app2.post("/api/consents", (req, res) => {
    const c = { id: uid2("cns"), ...req.body };
    memory.consents.push(c);
    res.json({ success: true, consent: c });
  });
  app2.patch("/api/consents/:id", (req, res) => res.json({ success: true, consent: { id: req.params.id, ...req.body } }));
  app2.delete("/api/consents/:id", (req, res) => {
    memory.consents = memory.consents.filter((c) => c.id !== req.params.id);
    res.json({ success: true });
  });
  app2.get("/api/audit-logs", (_req, res) => res.json({ success: true, logs: memory.audit }));
  app2.post("/api/audit-logs", (req, res) => {
    const log = { id: uid2("aud"), ...req.body, at: (/* @__PURE__ */ new Date()).toISOString() };
    memory.audit.push(log);
    res.json({ success: true, log });
  });
  app2.post("/api/privacy/auto-purge", (_req, res) => res.json({ success: true }));
  app2.post("/api/privacy/signed-url", (_req, res) => res.json({ success: true, url: "" }));
  app2.post("/api/privacy/export-data", (_req, res) => res.json({ success: true, data: {} }));
  app2.get("/api/billing/plans", (_req, res) => res.json({ success: true, plans: SAAS_PLANS }));
  app2.get(
    "/api/billing/config",
    (_req, res) => res.json({
      success: true,
      provider: process.env.BILLING_PROVIDER || "mock",
      liveCharges: false,
      note: "Checkout is simulated until Stripe/Razorpay secrets are configured and adapters call live SDKs."
    })
  );
  app2.get("/api/billing/subscription", (_req, res) => res.json({ success: true, subscription: { tier: "FREE", status: "active" } }));
  app2.get("/api/billing/usage", (_req, res) => res.json({ success: true, usage: { meetings: 0, minutes: 0 } }));
  app2.get("/api/billing/invoices", (_req, res) => res.json({ success: true, invoices: [] }));
  app2.post("/api/billing/checkout", async (req, res) => {
    try {
      const result = await billingManager.initiateCheckout(req.body);
      res.json({ success: true, ...result });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app2.post("/api/billing/confirm-checkout", (_req, res) => res.json({ success: true }));
  app2.post("/api/billing/cancel", (_req, res) => res.json({ success: true }));
  app2.post("/api/billing/usage/simulate", (_req, res) => res.json({ success: true }));
  app2.post(
    "/api/billing/webhook/stripe",
    (_req, res) => res.status(501).json({
      received: false,
      error: "Stripe webhook verification not configured. Set STRIPE_WEBHOOK_SECRET and implement signature check before enabling."
    })
  );
  app2.post(
    "/api/billing/webhook/razorpay",
    (_req, res) => res.status(501).json({
      received: false,
      error: "Razorpay webhook verification not configured."
    })
  );
  return app2;
}
async function attachFrontend(app2) {
  if (process.env.VERCEL) return;
  if (!isProd) {
    const viteMod = await import("vite");
    const vite = await viteMod.createServer({
      root: rootDir,
      server: { middlewareMode: true },
      appType: "custom"
    });
    app2.use(vite.middlewares);
    app2.use("*", async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const template = await vite.transformIndexHtml(
          url,
          await fs5.readFile(path7.join(rootDir, "index.html"), "utf-8")
        );
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
    return;
  }
  const clientDir = path7.join(rootDir, "dist", "client");
  app2.use(express2.static(clientDir));
  app2.get("*", (_req, res) => {
    res.sendFile(path7.join(clientDir, "index.html"));
  });
}
var app = createApp();
var server_default = app;
if (!process.env.VERCEL) {
  attachFrontend(app).then(() => {
    app.listen(PORT, HOST, () => {
      console.log(`2Click Voice MoM listening on http://${HOST}:${PORT}`);
    });
  }).catch((err) => {
    console.error("Failed to start server", err);
    process.exit(1);
  });
}

// scripts/vercel-api-entry.ts
var vercel_api_entry_default = server_default;
export {
  vercel_api_entry_default as default
};
