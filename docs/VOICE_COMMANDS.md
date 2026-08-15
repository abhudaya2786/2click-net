# Voice Commands — 2Click.in

## Quick use (mobile)

1. Tap mic on the Voice Assistant pill → status must become **Active** (green).  
2. Say **“Meeting shuru karo”** or **“2Click Start”** (Chrome often hears “to click start” — that is accepted).  
3. Or tap the blue **Start** button if speech fails.  
4. To finish: say **“Meeting khatam”** / **“2Click Stop”** or tap **Stop**.

If pill stays Idle after mic tap, allow microphone permission and prefer Chrome. APK/WebView without Web Speech: use **Start/Stop** buttons.

## Default wake phrases

- Namaskar / Namaste
- Hello / Hello Meeting
- Minutes of Meeting
- Meeting Start
- 2Click Start

## Default commands

| Phrase (examples) | Action |
|-------------------|--------|
| Meeting Start / 2Click Start / मीटिंग शुरू | Start recording session |
| Meeting Stop / Save Note / मीटिंग खत्म | Stop + Instant Save |
| Cancel Recording | Discard |
| Generate Minutes / Make Minutes | Open MoM flow |
| Open Settings / Open Meetings / New Meeting | Navigation |

Configure more at `/settings/voice` (add / edit / enable / disable / test).

## Privacy

Command trigger phrases are redacted from saved transcripts and MoM text (`wakeWordRedaction.ts`).

## Native future

Capacitor Android can later host a dedicated wake-word plugin. Until then, use in-app listening only.
