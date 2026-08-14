import OpenAI, { toFile } from 'openai';
import { SpeechProvider, TranscribeRequestOptions, TranscribeResult, TranscriptSegmentData } from './SpeechProvider';

export class OpenAISpeechProvider implements SpeechProvider {
  public name = 'openai';

  private getClient(): OpenAI {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured on the server.');
    }
    return new OpenAI({ apiKey });
  }

  public async transcribe(options: TranscribeRequestOptions): Promise<TranscribeResult> {
    const client = this.getClient();
    const { audioBase64, mimeType = 'audio/webm', language = 'auto', meetingId, speakerHint = [] } = options;

    const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    // Determine extension
    let ext = 'webm';
    if (mimeType.includes('mp3') || mimeType.includes('mpeg')) ext = 'mp3';
    else if (mimeType.includes('wav')) ext = 'wav';
    else if (mimeType.includes('m4a') || mimeType.includes('mp4')) ext = 'm4a';
    else if (mimeType.includes('ogg')) ext = 'ogg';

    const file = await toFile(buffer, `recording-${meetingId || Date.now()}.${ext}`, {
      type: mimeType,
    });

    // Build context prompt to optimize Whisper for Hindi, English, and Hinglish
    let promptGuide = options.contextPrompt || '';
    if (speakerHint.length > 0) {
      promptGuide += ` Speakers: ${speakerHint.join(', ')}.`;
    }

    if (language === 'hinglish') {
      promptGuide += ` The conversation is in Hinglish (conversational Hindi mixed with English business and technical terms). Accurately transcribe both Hindi phrases and English words.`;
    } else if (language === 'hi') {
      promptGuide += ` This is a Hindi business meeting transcription.`;
    } else if (language === 'en') {
      promptGuide += ` This is an English meeting transcription.`;
    } else {
      promptGuide += ` This meeting may contain English, Hindi, and Hinglish code-switching dialogue.`;
    }

    // Determine ISO language code for Whisper
    let whisperLang: string | undefined = undefined;
    if (language === 'hi') whisperLang = 'hi';
    else if (language === 'en') whisperLang = 'en';
    // For Hinglish or auto, leave undefined so Whisper auto-detects multilingual switches

    const transcription = (await client.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      response_format: 'verbose_json',
      language: whisperLang,
      prompt: promptGuide.trim(),
      timestamp_granularities: ['segment'],
    })) as any;

    const fullText = transcription.text || '';
    const rawSegments = transcription.segments || [];

    // Helper to format seconds to MM:SS
    const formatTime = (secs: number) => {
      const m = Math.floor(secs / 60);
      const s = Math.floor(secs % 60);
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    // Helper to classify language of segment
    const detectSegmentLanguage = (txt: string): 'Hindi' | 'English' | 'Hinglish' => {
      // Check Devanagari Unicode range
      const hasDevanagari = /[\u0900-\u097F]/.test(txt);
      const hindiKeywords = /\b(kya|hai|hain|nahi|haan|bhi|aur|yeh|woh|karna|hoga|theek|accha|hum|aap|mujhe|karte|chahiye|chal|raha|sahi)\b/i;
      const englishKeywords = /\b(the|is|and|to|we|will|meeting|project|sprint|update|design|deploy|code|issue|timeline)\b/i;

      const hasHindiWords = hindiKeywords.test(txt);
      const hasEnglishWords = englishKeywords.test(txt);

      if (hasDevanagari) return 'Hindi';
      if (hasHindiWords && hasEnglishWords) return 'Hinglish';
      if (hasHindiWords) return 'Hindi';
      if (language === 'hi') return 'Hindi';
      if (language === 'hinglish') return 'Hinglish';
      return 'English';
    };

    let segments: TranscriptSegmentData[] = [];

    if (rawSegments.length > 0) {
      segments = rawSegments.map((seg: any, idx: number) => {
        const startSec = Number(seg.start) || 0;
        const endSec = Number(seg.end) || startSec + 5;
        const segText = seg.text?.trim() || '';

        // Estimate speaker alternation or assign from hints
        const speakerName = speakerHint.length > 0 
          ? speakerHint[idx % speakerHint.length] 
          : `Speaker ${(idx % 3) + 1}`;

        return {
          id: `seg-${meetingId}-${idx + 1}`,
          meeting_id: meetingId,
          start_time: formatTime(startSec),
          end_time: formatTime(endSec),
          speaker: speakerName,
          text: segText,
          language: detectSegmentLanguage(segText),
        };
      });
    } else {
      // Single segment fallback if model didn't return verbose segments
      segments = [
        {
          id: `seg-${meetingId}-1`,
          meeting_id: meetingId,
          start_time: '00:00',
          end_time: '00:30',
          speaker: speakerHint[0] || 'Speaker 1',
          text: fullText,
          language: detectSegmentLanguage(fullText),
        },
      ];
    }

    const detectedLang = transcription.language || (language === 'hi' ? 'Hindi' : language === 'hinglish' ? 'Hinglish' : 'English');

    return {
      success: true,
      provider: 'openai',
      fullTranscript: fullText,
      detectedLanguage: detectedLang,
      segments,
      modelUsed: 'whisper-1',
    };
  }
}
