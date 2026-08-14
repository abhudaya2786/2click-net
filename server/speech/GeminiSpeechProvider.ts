import { GoogleGenAI, Type } from '@google/genai';
import { SpeechProvider, TranscribeRequestOptions, TranscribeResult, TranscriptSegmentData } from './SpeechProvider';

export class GeminiSpeechProvider implements SpeechProvider {
  public name = 'gemini';

  private getClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    return new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  public async transcribe(options: TranscribeRequestOptions): Promise<TranscribeResult> {
    const ai = this.getClient();
    const { audioBase64, mimeType = 'audio/webm', language = 'auto', meetingId, speakerHint = [] } = options;

    const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, '');

    const systemPrompt = `You are a high-precision Multilingual Speech-to-Text and Diarization Transcription engine.
You specialize in transcribing audio in:
1. Hindi (including Devanagari or Romanized transliterations)
2. English (technical, professional, conversational)
3. Hinglish (natural code-switching between Hindi and English words in business/engineering contexts).

Target Meeting ID: ${meetingId}
${speakerHint.length > 0 ? `Expected Meeting Participants: ${speakerHint.join(', ')}` : ''}
Target Language Requested: ${language}

Your Goal:
Produce exact, timestamped dialogue segments with:
- start_time (format "MM:SS" e.g. "00:00", "01:24")
- end_time (format "MM:SS" e.g. "00:15", "01:45")
- speaker (Name from participant list if identifiable, otherwise "Speaker 1", "Speaker 2", etc.)
- text (verbatim spoken speech)
- language ("Hindi", "English", or "Hinglish")`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'audio/webm',
              data: cleanBase64,
            },
          },
          {
            text: `Please transcribe the audio into high-fidelity timestamped segments for meeting ${meetingId}. Accurately tag the language of each segment as 'Hindi', 'English', or 'Hinglish'.`,
          },
        ],
      },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fullTranscript: { type: Type.STRING },
            detectedLanguage: { type: Type.STRING },
            segments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  start_time: { type: Type.STRING },
                  end_time: { type: Type.STRING },
                  speaker: { type: Type.STRING },
                  text: { type: Type.STRING },
                  language: { type: Type.STRING },
                },
                required: ['start_time', 'end_time', 'speaker', 'text', 'language'],
              },
            },
          },
          required: ['fullTranscript', 'detectedLanguage', 'segments'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const segments: TranscriptSegmentData[] = (parsed.segments || []).map((s: any, idx: number) => ({
      id: `seg-${meetingId}-${idx + 1}`,
      meeting_id: meetingId,
      start_time: s.start_time || '00:00',
      end_time: s.end_time || '00:10',
      speaker: s.speaker || (speakerHint[0] || 'Speaker 1'),
      text: s.text || '',
      language: ['Hindi', 'English', 'Hinglish'].includes(s.language) ? s.language : 'English',
    }));

    return {
      success: true,
      provider: 'gemini',
      fullTranscript: parsed.fullTranscript || segments.map((s) => `${s.speaker}: ${s.text}`).join('\n'),
      detectedLanguage: parsed.detectedLanguage || 'Multilingual (English/Hindi/Hinglish)',
      segments,
      modelUsed: 'gemini-3.7-flash',
    };
  }
}
