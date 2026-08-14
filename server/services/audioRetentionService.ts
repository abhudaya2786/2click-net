/**
 * Zero-Audio Retention helpers — drop raw audio after AI processing.
 */

import { enterpriseConfig } from '../config/env.ts';

export function stripAudioPayload<T extends Record<string, any>>(payload: T): T {
  if (!enterpriseConfig.zeroAudioRetention) return payload;
  const clone: Record<string, any> = { ...payload };
  delete clone.audioBase64;
  delete clone.audioUrl;
  delete clone.audioData;
  if (clone.meeting && typeof clone.meeting === 'object') {
    clone.meeting = { ...clone.meeting };
    delete clone.meeting.audioUrl;
    delete clone.meeting.audioBase64;
  }
  return clone as T;
}

export function shouldRetainAudio(): boolean {
  return !enterpriseConfig.zeroAudioRetention;
}
