/**
 * Central env accessors for enterprise field-workforce modules.
 * Existing dotenv bootstrap in server.ts remains the source of truth for loading.
 */

export type BusinessDomain = 'Software' | 'Construction' | 'Marketing' | 'Sales' | 'General';

export function envFlag(name: string, fallback = false): boolean {
  const v = process.env[name];
  if (v == null || v === '') return fallback;
  return /^(1|true|yes|on)$/i.test(v);
}

export const enterpriseConfig = {
  get zeroAudioRetention() {
    return envFlag('ZERO_AUDIO_RETENTION', true);
  },
  get piiRedactionEnabled() {
    return envFlag('PII_REDACTION_ENABLED', true);
  },
  get discardSmallTalk() {
    return envFlag('DISCARD_SMALL_TALK', true);
  },
  get whatsapp() {
    return {
      verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || '2click-mom-verify',
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
      apiVersion: process.env.WHATSAPP_API_VERSION || 'v21.0',
      ownerPhone: process.env.WHATSAPP_OWNER_PHONE || '',
      enabled: Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
    };
  },
  get fieldVisit() {
    return {
      defaultGeofenceRadiusMeters: Number(process.env.FIELD_GEOFENCE_RADIUS_M || 50),
      chunkSeconds: Number(process.env.AUDIO_CHUNK_SECONDS || 30),
      overlapSeconds: Number(process.env.AUDIO_OVERLAP_SECONDS || 2),
      pdfStorageDir: process.env.PDF_STORAGE_DIR || 'data/field-pdfs',
      storeDir: process.env.FIELD_STORE_DIR || 'data/field-visits',
    };
  },
  get geminiModel() {
    return process.env.GEMINI_FIELD_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  },
};
