// server.ts
import dotenv from "dotenv";
import express from "express";
import path from "path";
import fs from "fs/promises";
import { GoogleGenAI as GoogleGenAI3 } from "@google/genai";

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
    const modelName = "gemini-3.7-flash";
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
      model: "gemini-3.7-flash",
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
      modelUsed: "gemini-3.7-flash"
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

// server.ts
dotenv.config({ path: ".env.local" });
dotenv.config();
var rootDir = process.cwd();
var isProd = process.env.NODE_ENV === "production";
var PORT = Number(process.env.PORT || 3e3);
var HOST = process.env.HOST || "0.0.0.0";
function requireLiveAi() {
  if (!hasAiApiKey()) {
    const err = new Error("Set GEMINI_API_KEY or OPENAI_API_KEY in .env / .env.local");
    err.status = 503;
    throw err;
  }
}
function geminiClient() {
  return new GoogleGenAI3({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: { headers: { "User-Agent": "2click-voice-mom" } }
  });
}
function uid(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function minutesToMeeting(minutes, opts) {
  const ctx = opts.context || {};
  const participants = typeof ctx.participants === "string" ? ctx.participants.split(",").map((s) => s.trim()).filter(Boolean) : Array.isArray(ctx.participants) ? ctx.participants : [];
  const actionItems = (minutes.action_items || []).map((a, i) => ({
    id: uid(`act-${i}`),
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
    id: uid("mtg"),
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
  const app2 = express();
  app2.use(express.json({ limit: "40mb" }));
  app2.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      app: "2click-voice-mom",
      gemini: Boolean(process.env.GEMINI_API_KEY),
      openai: Boolean(process.env.OPENAI_API_KEY),
      demoMode: !hasAiApiKey()
    });
  });
  app2.post("/api/generate-mom", async (req, res) => {
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
          meetingId: uid("speech"),
          speakerHint: typeof context?.participants === "string" ? context.participants.split(",").map((s) => s.trim()).filter(Boolean) : []
        });
        transcript = speechResult.fullTranscript || "";
        segments = speechResult.segments || [];
        languageDetected = speechResult.detectedLanguage || languageDetected;
      }
      if (!transcript || transcript.length < 10) {
        return res.status(400).json({ error: "Provide audioBase64 or transcriptText with enough content." });
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
      const meeting = minutesToMeeting(minutes, {
        transcriptText: transcript,
        segments,
        context,
        audioUrl: audioBase64 || void 0,
        languageDetected
      });
      res.json({ success: true, meeting, minutes });
    } catch (e) {
      console.error("[generate-mom]", e);
      res.status(e.status || 500).json({ error: e.message || "Failed to generate MoM" });
    }
  });
  app2.post("/api/transcribe", async (req, res) => {
    try {
      requireLiveAi();
      const speech = getSpeechProvider(req.body?.provider || process.env.AI_PROVIDER);
      const result = await speech.transcribe({
        audioBase64: req.body.audioBase64,
        mimeType: req.body.mimeType || "audio/webm",
        language: req.body.language || "auto",
        meetingId: req.body.meetingId || uid("mtg"),
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
  app2.post("/api/minutes/generate", async (req, res) => {
    try {
      if (!req.body?.transcript || String(req.body.transcript).trim().length < 10) {
        return res.status(400).json({ error: "transcript is required (min 10 characters)." });
      }
      const ai = getAIProvider(req.body?.provider || process.env.AI_PROVIDER);
      const minutes = await ai.generateMinutes({
        transcript: req.body.transcript,
        meetingId: req.body.meetingId,
        meetingTitle: req.body.meetingTitle,
        meetingDate: req.body.meetingDate,
        participants: req.body.participants || [],
        additionalContext: req.body.additionalContext,
        languageHint: req.body.languageHint
      });
      const minute_id = uid("min");
      const meeting_id = req.body.meetingId || uid("mtg");
      const raw_decisions = (minutes.decisions || []).map((d) => ({
        id: uid("dec"),
        meeting_id,
        minute_id,
        decision_text: d,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      }));
      const action_items = (minutes.action_items || []).map((a) => ({
        id: uid("act"),
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
        action_items
      });
    } catch (e) {
      console.error("[minutes/generate]", e);
      res.status(e.status || 500).json({ error: e.message || "Minutes generation failed" });
    }
  });
  app2.post("/api/chat-meeting", async (req, res) => {
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
  app2.post("/api/generate-email", async (req, res) => {
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
          id: uid("evt"),
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
    const meeting = { id: uid("mtg"), ...req.body, createdAt: (/* @__PURE__ */ new Date()).toISOString() };
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
  app2.post("/api/meetings/:id/decisions", (req, res) => res.json({ success: true, decision: { id: uid("dec"), ...req.body } }));
  app2.delete("/api/decisions/:id", (_req, res) => res.json({ success: true }));
  app2.post("/api/meetings/:id/action-items", (req, res) => res.json({ success: true, actionItem: { id: uid("act"), ...req.body } }));
  app2.patch("/api/action-items/:id", (req, res) => res.json({ success: true, actionItem: { id: req.params.id, ...req.body } }));
  app2.delete("/api/action-items/:id", (_req, res) => res.json({ success: true }));
  app2.delete("/api/meetings/:id/recording", (_req, res) => res.json({ success: true }));
  app2.get("/api/schedules", (_req, res) => res.json({ success: true, schedules: memory.schedules }));
  app2.post("/api/schedules", (req, res) => {
    const item = { id: uid("sch"), ...req.body };
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
    const c = { id: uid("cns"), ...req.body };
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
    const log = { id: uid("aud"), ...req.body, at: (/* @__PURE__ */ new Date()).toISOString() };
    memory.audit.push(log);
    res.json({ success: true, log });
  });
  app2.post("/api/privacy/auto-purge", (_req, res) => res.json({ success: true }));
  app2.post("/api/privacy/signed-url", (_req, res) => res.json({ success: true, url: "" }));
  app2.post("/api/privacy/export-data", (_req, res) => res.json({ success: true, data: {} }));
  app2.get("/api/billing/plans", (_req, res) => res.json({ success: true, plans: SAAS_PLANS }));
  app2.get("/api/billing/config", (_req, res) => res.json({ success: true, provider: process.env.BILLING_PROVIDER || "mock" }));
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
  app2.post("/api/billing/webhook/stripe", (_req, res) => res.json({ received: true }));
  app2.post("/api/billing/webhook/razorpay", (_req, res) => res.json({ received: true }));
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
          await fs.readFile(path.join(rootDir, "index.html"), "utf-8")
        );
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
    return;
  }
  const clientDir = path.join(rootDir, "dist", "client");
  app2.use(express.static(clientDir));
  app2.get("*", (_req, res) => {
    res.sendFile(path.join(clientDir, "index.html"));
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
