import { AIProvider } from './AIProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { GeminiAIProvider } from './GeminiAIProvider';
import { DemoAIProvider } from './DemoAIProvider';

export * from './AIProvider';
export * from './OpenAIProvider';
export * from './GeminiAIProvider';
export * from './DemoAIProvider';

export function hasAiApiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);
}

export function getAIProvider(preferred?: string): AIProvider {
  // Offline / smoke-test path when no live keys are configured
  if (!hasAiApiKey() || preferred === 'demo') {
    return new DemoAIProvider();
  }

  if (preferred === 'openai') {
    if (process.env.OPENAI_API_KEY) {
      return new OpenAIProvider();
    }
    console.warn('[AIProvider] OPENAI_API_KEY is not set. Falling back to GeminiAIProvider.');
    return new GeminiAIProvider();
  }

  if (preferred === 'gemini') {
    return new GeminiAIProvider();
  }

  // Default: Prefer OpenAI if OPENAI_API_KEY is set, otherwise use Gemini
  if (process.env.OPENAI_API_KEY) {
    return new OpenAIProvider();
  }

  return new GeminiAIProvider();
}
