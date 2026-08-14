import { SpeechProvider } from './SpeechProvider';
import { OpenAISpeechProvider } from './OpenAISpeechProvider';
import { GeminiSpeechProvider } from './GeminiSpeechProvider';

export * from './SpeechProvider';
export * from './OpenAISpeechProvider';
export * from './GeminiSpeechProvider';

export function getSpeechProvider(preferredProvider?: string): SpeechProvider {
  if (preferredProvider === 'openai') {
    if (process.env.OPENAI_API_KEY) {
      return new OpenAISpeechProvider();
    }
    console.warn('[SpeechProvider] OPENAI_API_KEY is not configured. Falling back to Gemini Speech Provider.');
    return new GeminiSpeechProvider();
  }

  if (preferredProvider === 'gemini') {
    return new GeminiSpeechProvider();
  }

  // Default: Use OpenAI if key exists, otherwise Gemini
  if (process.env.OPENAI_API_KEY) {
    return new OpenAISpeechProvider();
  }

  return new GeminiSpeechProvider();
}
