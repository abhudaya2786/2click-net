import type { VoiceCommandItem, WakeWordItem, VoiceSystemConfig } from '../types';
import {
  DEFAULT_VOICE_COMMANDS,
  DEFAULT_WAKE_WORDS,
  DEFAULT_VOICE_CONFIG,
} from './voiceDefaults';

/** Union aliases / fields so users keep custom phrases but gain new defaults. */
export function mergeVoiceCommands(
  saved: VoiceCommandItem[] | null | undefined,
  defaults: VoiceCommandItem[] = DEFAULT_VOICE_COMMANDS,
): VoiceCommandItem[] {
  if (!Array.isArray(saved) || saved.length === 0) return [...defaults];

  const byId = new Map<string, VoiceCommandItem>();
  for (const d of defaults) {
    byId.set(d.id, { ...d });
  }
  for (const s of saved) {
    const base = byId.get(s.id);
    if (!base) {
      byId.set(s.id, s);
      continue;
    }
    const aliasSet = new Set<string>([
      ...(base.aliases || []),
      ...(s.aliases || []),
    ]);
    byId.set(s.id, {
      ...base,
      ...s,
      phrase: s.phrase || base.phrase,
      aliases: Array.from(aliasSet),
      action: s.action || base.action,
      // Prefer keeping user enable flag, but never drop default command presence
      enabled: s.enabled !== false,
      description: s.description || base.description,
      executionCount: s.executionCount ?? base.executionCount ?? 0,
    });
  }
  // Preserve default order first, then any custom extras
  const ordered: VoiceCommandItem[] = [];
  const seen = new Set<string>();
  for (const d of defaults) {
    const item = byId.get(d.id);
    if (item) {
      ordered.push(item);
      seen.add(d.id);
    }
  }
  for (const [id, item] of byId) {
    if (!seen.has(id)) ordered.push(item);
  }
  return ordered;
}

export function mergeWakeWords(
  saved: WakeWordItem[] | null | undefined,
  defaults: WakeWordItem[] = DEFAULT_WAKE_WORDS,
): WakeWordItem[] {
  if (!Array.isArray(saved) || saved.length === 0) return [...defaults];

  const byId = new Map<string, WakeWordItem>();
  for (const d of defaults) byId.set(d.id, { ...d });
  for (const s of saved) {
    const base = byId.get(s.id);
    if (!base) {
      byId.set(s.id, s);
      continue;
    }
    const aliasSet = new Set<string>([...(base.aliases || []), ...(s.aliases || [])]);
    byId.set(s.id, {
      ...base,
      ...s,
      word: s.word || base.word,
      aliases: Array.from(aliasSet),
      enabled: s.enabled !== false,
      detectedCount: s.detectedCount ?? base.detectedCount ?? 0,
    });
  }
  const ordered: WakeWordItem[] = [];
  const seen = new Set<string>();
  for (const d of defaults) {
    const item = byId.get(d.id);
    if (item) {
      ordered.push(item);
      seen.add(d.id);
    }
  }
  for (const [id, item] of byId) {
    if (!seen.has(id)) ordered.push(item);
  }
  return ordered;
}

export function mergeVoiceConfig(
  saved: Partial<VoiceSystemConfig> | null | undefined,
): VoiceSystemConfig {
  const merged: VoiceSystemConfig = {
    ...DEFAULT_VOICE_CONFIG,
    ...(saved || {}),
    isVoiceCommandEnabled:
      saved?.isVoiceCommandEnabled === undefined
        ? DEFAULT_VOICE_CONFIG.isVoiceCommandEnabled
        : Boolean(saved.isVoiceCommandEnabled),
    isWakeWordEnabled:
      saved?.isWakeWordEnabled === undefined
        ? DEFAULT_VOICE_CONFIG.isWakeWordEnabled
        : Boolean(saved.isWakeWordEnabled),
    autoStartListening:
      saved?.autoStartListening === undefined
        ? DEFAULT_VOICE_CONFIG.autoStartListening
        : Boolean(saved.autoStartListening),
    continuousListening:
      saved?.continuousListening === undefined
        ? DEFAULT_VOICE_CONFIG.continuousListening
        : Boolean(saved.continuousListening),
  };
  return merged;
}
