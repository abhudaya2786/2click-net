export type SupportedLanguage = 'en' | 'hi' | 'hinglish' | 'auto' | string;

export interface TranscribeRequestOptions {
  audioBase64: string;
  mimeType?: string;
  language?: SupportedLanguage;
  meetingId: string;
  meetingTitle?: string;
  speakerHint?: string[];
  contextPrompt?: string;
}

export interface TranscriptSegmentData {
  id?: string;
  meeting_id: string;
  start_time: string;
  end_time: string;
  speaker: string;
  text: string;
  language: 'Hindi' | 'English' | 'Hinglish' | string;
}

export interface TranscribeResult {
  success: boolean;
  provider: 'openai' | 'gemini';
  fullTranscript: string;
  detectedLanguage: string;
  segments: TranscriptSegmentData[];
  modelUsed?: string;
}

export interface SpeechProvider {
  name: string;
  transcribe(options: TranscribeRequestOptions): Promise<TranscribeResult>;
}
