# Voice Commands — 2Click.in

## Browser reality

Wake-word and voice commands work **while the app is open** and microphone / speech recognition permission is granted.  
We do **not** claim always-on background wake-word on the web.

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
