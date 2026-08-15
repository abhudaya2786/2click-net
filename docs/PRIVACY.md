# Privacy — 2Click.in

## Principles

- No covert recording
- No hidden microphone
- No secret call recording
- Explicit consent before MoM live capture
- Visible **RECORDING ACTIVE** indicator

## Consent

`RecordingService` + `RecordingConsentBanner` gate MoM microphone start. Users see:

> This meeting will be recorded and transcribed by AI.

## Retention

Settings UI supports retention preferences. Server `/api/privacy/auto-purge` is a stub until durable storage exists — do not treat it as compliance automation yet.

Recommended product policy examples:

| Artifact | Example retention |
|----------|-------------------|
| Audio | 30 days |
| Transcript | 90 days |
| MoM | 180 days |
| Exports | User-managed |

## PII

Server `piiFilterService` redacts common Indian PII patterns when enabled (`PII_REDACTION_ENABLED`). Applied on `/api/generate-mom` and `/api/minutes/generate`.

## Delete

Users can delete meetings, recordings (client library), and clear local data from Privacy Shield / settings.
