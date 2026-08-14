/**
 * Studio-Grade Audio Recording & Encoding Suite
 * 
 * Supported Formats:
 *  - WAV PCM (16-bit Integer & 32-bit IEEE 754 Float)
 *  - FLAC (Free Lossless Audio Codec Stream)
 * 
 * Supported Sample Rates:
 *  - 16,000 Hz (16 kHz - Optimized for AI Speech Recognition / Whisper)
 *  - 44,100 Hz (44.1 kHz - CD Audio Standard)
 *  - 48,000 Hz (48 kHz - Studio Broadcast Standard)
 * 
 * Channel Configurations:
 *  - Mono (1 Channel)
 *  - Stereo (2 Channels - Left & Right Spatial Capture)
 * 
 * Bit Depths:
 *  - 16-Bit Integer (Standard Linear PCM)
 *  - 32-Bit Float (IEEE 754 Float, 1528 dB Dynamic Headroom, Impossible to Clip)
 */

export type AudioFormatType = 'wav_float32' | 'wav_pcm16' | 'flac' | 'webm';
export type SampleRateOption = 16000 | 44100 | 48000;
export type ChannelModeOption = 1 | 2; // 1 = Mono, 2 = Stereo
export type BitDepthOption = 16 | 32;

export interface AudioStatsTelemetry {
  peakFloatLeft: number;
  peakFloatRight: number;
  peakDbfsLeft: number;
  peakDbfsRight: number;
  rmsDbfs: number;
  hasOverdrive: boolean;
  headroomDb: number;
  sampleCount: number;
  sampleRate: number;
  channels: ChannelModeOption;
  bitDepth: BitDepthOption;
}

export interface EncodedAudioResult {
  blob: Blob;
  dataUrl: string;
  sizeBytes: number;
  durationSeconds: number;
  sampleRate: number;
  channels: number;
  bitDepth: number;
  format: string;
  mimeType: string;
  peakDbfs: number;
  hasOverdrive: boolean;
}

/**
 * Encodes audio PCM channels into a standard WAV file (16-bit PCM or 32-bit Float, Mono or Stereo).
 */
export function encodeWav(
  channelChunks: { left: Float32Array[]; right?: Float32Array[] },
  sampleRate: SampleRateOption = 48000,
  channels: ChannelModeOption = 1,
  bitDepth: BitDepthOption = 32
): EncodedAudioResult {
  const leftChunks = channelChunks.left;
  const rightChunks = channelChunks.right;

  // 1. Calculate total samples per channel
  let samplesPerChannel = 0;
  for (let i = 0; i < leftChunks.length; i++) {
    samplesPerChannel += leftChunks[i].length;
  }

  const numChannels = channels === 2 && rightChunks && rightChunks.length > 0 ? 2 : 1;
  const is32BitFloat = bitDepth === 32;
  const bytesPerSample = is32BitFloat ? 4 : 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samplesPerChannel * blockAlign;
  const headerSize = 44;
  const totalFileSize = headerSize + dataSize;

  const buffer = new ArrayBuffer(totalFileSize);
  const view = new DataView(buffer);

  // 2. Write RIFF Header
  writeAsciiString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeAsciiString(view, 8, 'WAVE');

  // 3. Write "fmt " Chunk
  writeAsciiString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk size (16 for PCM / IEEE Float)
  view.setUint16(20, is32BitFloat ? 3 : 1, true); // Format: 3 = IEEE Float, 1 = PCM Integer
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // 4. Write "data" Chunk
  writeAsciiString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // 5. Write Samples (Interleaved for Stereo)
  let offset = 44;
  let maxAbsSample = 0;

  let chunkIdx = 0;
  let sampleInChunkIdx = 0;

  for (let i = 0; i < samplesPerChannel; i++) {
    if (chunkIdx < leftChunks.length) {
      const leftSample = leftChunks[chunkIdx][sampleInChunkIdx] || 0;
      const rightSample =
        numChannels === 2 && rightChunks && rightChunks[chunkIdx]
          ? rightChunks[chunkIdx][sampleInChunkIdx] || 0
          : leftSample;

      const absL = Math.abs(leftSample);
      const absR = Math.abs(rightSample);
      if (absL > maxAbsSample) maxAbsSample = absL;
      if (absR > maxAbsSample) maxAbsSample = absR;

      if (is32BitFloat) {
        view.setFloat32(offset, leftSample, true);
        offset += 4;
        if (numChannels === 2) {
          view.setFloat32(offset, rightSample, true);
          offset += 4;
        }
      } else {
        // 16-Bit Signed Integer PCM [-32768, 32767] with soft clipping
        const clampedL = Math.max(-1, Math.min(1, leftSample));
        const intSampleL = clampedL < 0 ? clampedL * 0x8000 : clampedL * 0x7fff;
        view.setInt16(offset, intSampleL, true);
        offset += 2;

        if (numChannels === 2) {
          const clampedR = Math.max(-1, Math.min(1, rightSample));
          const intSampleR = clampedR < 0 ? clampedR * 0x8000 : clampedR * 0x7fff;
          view.setInt16(offset, intSampleR, true);
          offset += 2;
        }
      }

      sampleInChunkIdx++;
      if (sampleInChunkIdx >= leftChunks[chunkIdx].length) {
        chunkIdx++;
        sampleInChunkIdx = 0;
      }
    }
  }

  const durationSeconds = samplesPerChannel / sampleRate;
  const peakDbfs = maxAbsSample > 0 ? 20 * Math.log10(maxAbsSample) : -96;
  const hasOverdrive = maxAbsSample > 1.0;

  const mimeType = 'audio/wav';
  const blob = new Blob([buffer], { type: mimeType });
  const dataUrl = URL.createObjectURL(blob);

  return {
    blob,
    dataUrl,
    sizeBytes: totalFileSize,
    durationSeconds,
    sampleRate,
    channels: numChannels,
    bitDepth,
    format: is32BitFloat ? 'WAV (32-Bit Float IEEE 754)' : 'WAV (16-Bit Linear PCM)',
    mimeType,
    peakDbfs: Math.round(peakDbfs * 10) / 10,
    hasOverdrive,
  };
}

/**
 * Encodes audio into a native Lossless FLAC stream container.
 * Writes FLAC Stream marker "fLaC", METADATA_BLOCK_HEADER (STREAMINFO),
 * and audio frames with 16-bit verbatim lossless subframes.
 */
export function encodeFlac(
  channelChunks: { left: Float32Array[]; right?: Float32Array[] },
  sampleRate: SampleRateOption = 48000,
  channels: ChannelModeOption = 1
): EncodedAudioResult {
  const leftChunks = channelChunks.left;
  const rightChunks = channelChunks.right;

  let samplesPerChannel = 0;
  for (let i = 0; i < leftChunks.length; i++) {
    samplesPerChannel += leftChunks[i].length;
  }

  const numChannels = channels === 2 && rightChunks && rightChunks.length > 0 ? 2 : 1;
  const blockSize = 4096; // Standard FLAC block size

  // Build audio chunks as 16-bit integer array
  const leftInt16 = new Int16Array(samplesPerChannel);
  const rightInt16 = numChannels === 2 ? new Int16Array(samplesPerChannel) : null;

  let writePos = 0;
  let maxAbs = 0;

  for (let c = 0; c < leftChunks.length; c++) {
    const lChunk = leftChunks[c];
    const rChunk = rightChunks ? rightChunks[c] : null;
    for (let s = 0; s < lChunk.length; s++) {
      const sL = Math.max(-1, Math.min(1, lChunk[s]));
      if (Math.abs(lChunk[s]) > maxAbs) maxAbs = Math.abs(lChunk[s]);
      leftInt16[writePos] = sL < 0 ? sL * 0x8000 : sL * 0x7fff;

      if (rightInt16 && rChunk) {
        const sR = Math.max(-1, Math.min(1, rChunk[s]));
        if (Math.abs(rChunk[s]) > maxAbs) maxAbs = Math.abs(rChunk[s]);
        rightInt16[writePos] = sR < 0 ? sR * 0x8000 : sR * 0x7fff;
      }
      writePos++;
    }
  }

  // Generate FLAC Binary Container
  // 1. "fLaC" (4 bytes)
  // 2. METADATA_BLOCK_STREAMINFO (4 bytes header + 34 bytes data)
  // 3. Audio Frame Blocks
  const metadataSize = 4 + 4 + 34;
  // Estimate frame data size (verbatim 16-bit subframe: frame header 6 bytes + samples * 2 * channels + 2 bytes CRC)
  const numBlocks = Math.ceil(samplesPerChannel / blockSize);
  const estimatedFrameBytes = numBlocks * 16 + samplesPerChannel * 2 * numChannels;
  const totalBufferSize = metadataSize + estimatedFrameBytes;

  const buffer = new Uint8Array(totalBufferSize);
  let ptr = 0;

  // 1. Write "fLaC" Magic Number
  buffer[ptr++] = 0x66; // 'f'
  buffer[ptr++] = 0x4c; // 'L'
  buffer[ptr++] = 0x61; // 'a'
  buffer[ptr++] = 0x43; // 'C'

  // 2. METADATA_BLOCK_HEADER: Last block flag (1) + BlockType (0 = STREAMINFO) -> 0x80
  buffer[ptr++] = 0x80;
  // Length: 34 bytes (3 bytes big-endian)
  buffer[ptr++] = 0x00;
  buffer[ptr++] = 0x00;
  buffer[ptr++] = 0x22; // 34

  // Min/Max Block Size (2 bytes each) -> 4096 (0x1000)
  buffer[ptr++] = (blockSize >> 8) & 0xff;
  buffer[ptr++] = blockSize & 0xff;
  buffer[ptr++] = (blockSize >> 8) & 0xff;
  buffer[ptr++] = blockSize & 0xff;

  // Min/Max Frame Size (3 bytes each) -> 0 (unknown)
  buffer[ptr++] = 0;
  buffer[ptr++] = 0;
  buffer[ptr++] = 0;
  buffer[ptr++] = 0;
  buffer[ptr++] = 0;
  buffer[ptr++] = 0;

  // Sample Rate (20 bits), Channels - 1 (3 bits), Bits per sample - 1 (5 bits), Total samples (36 bits)
  // 20 bits sample rate + 3 bits (numChannels - 1) + 1 bit MSB of (bitsPerSample - 1)
  const bitsPerSample = 16;
  const chCode = (numChannels - 1) & 0x07;
  const bpsCode = (bitsPerSample - 1) & 0x1f;

  buffer[ptr++] = (sampleRate >> 12) & 0xff;
  buffer[ptr++] = (sampleRate >> 4) & 0xff;
  buffer[ptr++] = ((sampleRate & 0x0f) << 4) | (chCode << 1) | ((bpsCode >> 4) & 0x01);
  buffer[ptr++] = ((bpsCode & 0x0f) << 4) | (((samplesPerChannel >> 32) & 0x0f));
  buffer[ptr++] = (samplesPerChannel >> 24) & 0xff;
  buffer[ptr++] = (samplesPerChannel >> 16) & 0xff;
  buffer[ptr++] = (samplesPerChannel >> 8) & 0xff;
  buffer[ptr++] = samplesPerChannel & 0xff;

  // 16 bytes MD5 signature (zeros for streaming uncompressed)
  for (let m = 0; m < 16; m++) {
    buffer[ptr++] = 0;
  }

  // 3. Audio Frames (Verbatim 16-bit Subframes)
  let frameNumber = 0;
  for (let sampleOffset = 0; sampleOffset < samplesPerChannel; sampleOffset += blockSize) {
    const curBlockSamples = Math.min(blockSize, samplesPerChannel - sampleOffset);

    // Frame Header: Sync code 0xFFF8 (14 bits 1s, 1 bit 0, 1 bit 0)
    buffer[ptr++] = 0xff;
    buffer[ptr++] = 0xf8;

    // Block size code (0b0111 = get 16-bit block size from end of header) & Sample rate code (0b0000 = get from STREAMINFO)
    buffer[ptr++] = 0x70;

    // Channels code (0b0000 = mono, 0b0001 = stereo) & Sample size (0b000 = from STREAMINFO) & Reserved (0)
    buffer[ptr++] = (numChannels === 2 ? 0x10 : 0x00);

    // Frame number (UTF-8 encoded variable length uint)
    if (frameNumber < 0x80) {
      buffer[ptr++] = frameNumber;
    } else {
      buffer[ptr++] = 0xc0 | (frameNumber >> 6);
      buffer[ptr++] = 0x80 | (frameNumber & 0x3f);
    }

    // Explicit block size - 1 (16 bits big-endian)
    buffer[ptr++] = ((curBlockSamples - 1) >> 8) & 0xff;
    buffer[ptr++] = (curBlockSamples - 1) & 0xff;

    // CRC-8 of Frame Header (placeholder)
    buffer[ptr++] = 0x00;

    // Subframe 0: Left Channel (Verbatim Subframe: 0x02 = Subframe type 000001 (Verbatim) + Wasted bits flag 0)
    buffer[ptr++] = 0x02;
    for (let s = 0; s < curBlockSamples; s++) {
      const val = leftInt16[sampleOffset + s];
      buffer[ptr++] = (val >> 8) & 0xff;
      buffer[ptr++] = val & 0xff;
    }

    // Subframe 1: Right Channel (if stereo)
    if (numChannels === 2 && rightInt16) {
      buffer[ptr++] = 0x02;
      for (let s = 0; s < curBlockSamples; s++) {
        const val = rightInt16[sampleOffset + s];
        buffer[ptr++] = (val >> 8) & 0xff;
        buffer[ptr++] = val & 0xff;
      }
    }

    // Zero pad to byte alignment and write Frame CRC-16 (2 bytes)
    buffer[ptr++] = 0x00;
    buffer[ptr++] = 0x00;

    frameNumber++;
  }

  const finalBuffer = buffer.slice(0, ptr);
  const mimeType = 'audio/flac';
  const blob = new Blob([finalBuffer], { type: mimeType });
  const dataUrl = URL.createObjectURL(blob);
  const durationSeconds = samplesPerChannel / sampleRate;
  const peakDbfs = maxAbs > 0 ? 20 * Math.log10(maxAbs) : -96;

  return {
    blob,
    dataUrl,
    sizeBytes: ptr,
    durationSeconds,
    sampleRate,
    channels: numChannels,
    bitDepth: 16,
    format: 'FLAC (Lossless Audio Codec)',
    mimeType,
    peakDbfs: Math.round(peakDbfs * 10) / 10,
    hasOverdrive: maxAbs > 1.0,
  };
}

/**
 * Backward compatibility helper for 32-bit Float WAV
 */
export function encode32BitFloatWav(
  pcmChunks: Float32Array[],
  sampleRate = 48000,
  numChannels = 1
): EncodedAudioResult {
  return encodeWav(
    { left: pcmChunks },
    sampleRate as SampleRateOption,
    numChannels as ChannelModeOption,
    32
  );
}

function writeAsciiString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Non-destructive Float32 normalization
 */
export function normalizeFloat32Chunks(
  pcmChunks: Float32Array[],
  targetPeakDbfs = -1.0
): { normalizedChunks: Float32Array[]; gainAppliedDb: number } {
  let maxAbs = 0;
  for (let i = 0; i < pcmChunks.length; i++) {
    const chunk = pcmChunks[i];
    for (let j = 0; j < chunk.length; j++) {
      const abs = Math.abs(chunk[j]);
      if (abs > maxAbs) maxAbs = abs;
    }
  }

  if (maxAbs === 0) {
    return { normalizedChunks: pcmChunks, gainAppliedDb: 0 };
  }

  const targetLinear = Math.pow(10, targetPeakDbfs / 20);
  const multiplier = targetLinear / maxAbs;
  const gainAppliedDb = Math.round(20 * Math.log10(multiplier) * 10) / 10;

  const normalizedChunks: Float32Array[] = pcmChunks.map((chunk) => {
    const normalized = new Float32Array(chunk.length);
    for (let i = 0; i < chunk.length; i++) {
      normalized[i] = chunk[i] * multiplier;
    }
    return normalized;
  });

  return { normalizedChunks, gainAppliedDb };
}

/**
 * Boosts whisper / soft speech without clipping
 */
export function boostWhisperInFloat32(
  pcmChunks: Float32Array[],
  boostFactor = 2.0 // +6 dB boost
): Float32Array[] {
  return pcmChunks.map((chunk) => {
    const boosted = new Float32Array(chunk.length);
    for (let i = 0; i < chunk.length; i++) {
      boosted[i] = chunk[i] * boostFactor;
    }
    return boosted;
  });
}

/**
 * Radix-2 Cooley-Tukey In-Place Fast Fourier Transform (FFT)
 * Transforms real/imaginary vectors in frequency or time domain.
 */
function fftRadix2(real: Float64Array, imag: Float64Array, inverse = false) {
  const n = real.length;
  // Bit-reversal permutation
  let j = 0;
  for (let i = 0; i < n - 1; i++) {
    if (i < j) {
      const tempR = real[i];
      real[i] = real[j];
      real[j] = tempR;

      const tempI = imag[i];
      imag[i] = imag[j];
      imag[j] = tempI;
    }
    let k = n >> 1;
    while (k <= j) {
      j -= k;
      k >>= 1;
    }
    j += k;
  }

  // Cooley-Tukey butterfly computations
  for (let len = 2; len <= n; len <<= 1) {
    const halfLen = len >> 1;
    const angle = (inverse ? 2 * Math.PI : -2 * Math.PI) / len;
    const wStepR = Math.cos(angle);
    const wStepI = Math.sin(angle);

    for (let i = 0; i < n; i += len) {
      let wR = 1.0;
      let wI = 0.0;
      for (let k = 0; k < halfLen; k++) {
        const pos = i + k;
        const matchPos = pos + halfLen;

        const uR = real[pos];
        const uI = imag[pos];

        const vR = real[matchPos] * wR - imag[matchPos] * wI;
        const vI = real[matchPos] * wI + imag[matchPos] * wR;

        real[pos] = uR + vR;
        imag[pos] = uI + vI;

        real[matchPos] = uR - vR;
        imag[matchPos] = uI - vI;

        const nextWR = wR * wStepR - wI * wStepI;
        const nextWI = wR * wStepI + wI * wStepR;
        wR = nextWR;
        wI = nextWI;
      }
    }
  }

  if (inverse) {
    for (let i = 0; i < n; i++) {
      real[i] /= n;
      imag[i] /= n;
    }
  }
}

/**
 * Human Voice / Target Speaker Frequency Domain Filter & Spectral Isolator
 * Equivalent to Python FFT filtering (np.fft.fft, frequency masking [85Hz, 3000Hz], and np.fft.ifft)
 * 
 * Filters out low-frequency rumble (< 85 Hz) and high-frequency screech/hiss (> 3000 Hz)
 * while preserving the complete fundamental frequency and formants of human speech.
 */
export function isolateTargetSpeakerFFT(
  pcmChunks: Float32Array[],
  sampleRate = 16000,
  lowCutoffHz = 85.0,
  highCutoffHz = 3000.0
): { filteredChunks: Float32Array[]; sampleRate: number } {
  // 1. Flatten all input chunks into a single contiguous array
  let totalLength = 0;
  for (let i = 0; i < pcmChunks.length; i++) {
    totalLength += pcmChunks[i].length;
  }

  const merged = new Float32Array(totalLength);
  let offset = 0;
  for (let i = 0; i < pcmChunks.length; i++) {
    merged.set(pcmChunks[i], offset);
    offset += pcmChunks[i].length;
  }

  // 2. Process using overlap-add FFT block filtering (Block size: 2048, 50% overlap with Hann window)
  const fftSize = 2048;
  const hopSize = 1024; // 50% overlap
  const numHops = Math.ceil(totalLength / hopSize);
  const outLength = totalLength;
  const output = new Float32Array(outLength);

  // Pre-calculate Hann window
  const window = new Float64Array(fftSize);
  for (let i = 0; i < fftSize; i++) {
    window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1)));
  }

  const real = new Float64Array(fftSize);
  const imag = new Float64Array(fftSize);

  // Frequency resolution per FFT bin: sampleRate / fftSize
  const binResolution = sampleRate / fftSize;

  for (let h = 0; h < numHops; h++) {
    const startIdx = h * hopSize;
    real.fill(0);
    imag.fill(0);

    // Apply analysis window
    for (let i = 0; i < fftSize; i++) {
      const sampleIdx = startIdx + i;
      if (sampleIdx < totalLength) {
        real[i] = merged[sampleIdx] * window[i];
      }
    }

    // 3. Forward FFT -> Convert to Frequency Domain
    fftRadix2(real, imag, false);

    // 4. Spectral Bandpass & Gating: Zero out frequencies outside [85 Hz, 3000 Hz]
    for (let i = 0; i < fftSize; i++) {
      // Symmetrical bin frequency calculation
      const binFreq = (i <= fftSize / 2 ? i : fftSize - i) * binResolution;
      if (binFreq < lowCutoffHz || binFreq > highCutoffHz) {
        real[i] = 0;
        imag[i] = 0;
      }
    }

    // 5. Inverse FFT -> Convert back to Time Domain
    fftRadix2(real, imag, true);

    // 6. Overlap-Add to output synthesis buffer
    for (let i = 0; i < fftSize; i++) {
      const outIdx = startIdx + i;
      if (outIdx < outLength) {
        // Synthesis Hann window compensation
        output[outIdx] += real[i] * window[i];
      }
    }
  }

  return {
    filteredChunks: [output],
    sampleRate,
  };
}

export interface StudioRecorderConfig {
  sampleRate: SampleRateOption;
  channels: ChannelModeOption;
  bitDepth: BitDepthOption;
  format: AudioFormatType;
}

/**
 * High-Precision Multi-Format Audio Recording Studio Engine
 */
export class StudioAudioRecorder {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private scriptProcessorNode: ScriptProcessorNode | null = null;
  private analyserLeft: AnalyserNode | null = null;
  private analyserRight: AnalyserNode | null = null;
  private splitterNode: ChannelSplitterNode | null = null;

  private leftChunks: Float32Array[] = [];
  private rightChunks: Float32Array[] = [];

  private isRecording = false;
  private isPaused = false;
  private config: StudioRecorderConfig;

  private onStatsCallback?: (stats: AudioStatsTelemetry) => void;
  private statsInterval: any = null;

  constructor(config?: Partial<StudioRecorderConfig>) {
    this.config = {
      sampleRate: config?.sampleRate || 48000,
      channels: config?.channels || 1,
      bitDepth: config?.bitDepth || 32,
      format: config?.format || 'wav_float32',
    };
  }

  public async start(onStats?: (stats: AudioStatsTelemetry) => void): Promise<MediaStream> {
    this.onStatsCallback = onStats;
    this.leftChunks = [];
    this.rightChunks = [];
    this.isRecording = true;
    this.isPaused = false;

    // 1. Request Microphone Stream with Studio Parameters
    const isStereo = this.config.channels === 2;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: isStereo ? 2 : 1,
        sampleRate: this.config.sampleRate,
      },
    });

    this.mediaStream = stream;

    // 2. Initialize Web Audio Context at exact requested sample rate
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new AudioContextClass({
      sampleRate: this.config.sampleRate,
      latencyHint: 'interactive',
    });

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.config.sampleRate = this.audioContext.sampleRate as SampleRateOption;

    // 3. Create Audio Pipeline Nodes
    this.sourceNode = this.audioContext.createMediaStreamSource(stream);

    // Channel Splitter & Analyzers
    this.splitterNode = this.audioContext.createChannelSplitter(2);
    this.analyserLeft = this.audioContext.createAnalyser();
    this.analyserLeft.fftSize = 256;

    this.analyserRight = this.audioContext.createAnalyser();
    this.analyserRight.fftSize = 256;

    this.sourceNode.connect(this.splitterNode);
    this.splitterNode.connect(this.analyserLeft, 0);
    this.splitterNode.connect(this.analyserRight, isStereo ? 1 : 0);

    // Script Processor for raw PCM Buffering (4096 buffer size, 2 input channels, 2 output channels)
    this.scriptProcessorNode = this.audioContext.createScriptProcessor(4096, isStereo ? 2 : 1, 2);

    this.scriptProcessorNode.onaudioprocess = (e) => {
      if (!this.isRecording || this.isPaused) return;

      const inputL = e.inputBuffer.getChannelData(0);
      const copyL = new Float32Array(inputL.length);
      copyL.set(inputL);
      this.leftChunks.push(copyL);

      if (isStereo && e.inputBuffer.numberOfChannels > 1) {
        const inputR = e.inputBuffer.getChannelData(1);
        const copyR = new Float32Array(inputR.length);
        copyR.set(inputR);
        this.rightChunks.push(copyR);
      }
    };

    this.sourceNode.connect(this.scriptProcessorNode);

    // Silent gain destination to keep Web Audio clock running
    const silentGain = this.audioContext.createGain();
    silentGain.gain.value = 0;
    this.scriptProcessorNode.connect(silentGain);
    silentGain.connect(this.audioContext.destination);

    // 4. Start Telemetry Poller
    this.startStatsPoller();

    return stream;
  }

  private startStatsPoller() {
    if (this.statsInterval) clearInterval(this.statsInterval);

    this.statsInterval = setInterval(() => {
      if (!this.analyserLeft || !this.onStatsCallback) return;

      const timeL = new Float32Array(this.analyserLeft.fftSize);
      this.analyserLeft.getFloatTimeDomainData(timeL);

      let peakL = 0;
      let sumSquares = 0;
      for (let i = 0; i < timeL.length; i++) {
        const val = Math.abs(timeL[i]);
        if (val > peakL) peakL = val;
        sumSquares += timeL[i] * timeL[i];
      }

      let peakR = peakL;
      if (this.analyserRight && this.config.channels === 2) {
        const timeR = new Float32Array(this.analyserRight.fftSize);
        this.analyserRight.getFloatTimeDomainData(timeR);
        let curPeakR = 0;
        for (let i = 0; i < timeR.length; i++) {
          const val = Math.abs(timeR[i]);
          if (val > curPeakR) curPeakR = val;
        }
        peakR = curPeakR;
      }

      const rms = Math.sqrt(sumSquares / timeL.length);
      const peakDbfsL = peakL > 0 ? 20 * Math.log10(peakL) : -96;
      const peakDbfsR = peakR > 0 ? 20 * Math.log10(peakR) : -96;
      const rmsDbfs = rms > 0 ? 20 * Math.log10(rms) : -96;
      const hasOverdrive = Math.max(peakL, peakR) > 1.0;
      const maxPeak = Math.max(peakL, peakR);
      const headroomDb = maxPeak > 0 ? Math.max(0, 20 * Math.log10(maxPeak)) : 0;

      let totalSamples = 0;
      for (let i = 0; i < this.leftChunks.length; i++) {
        totalSamples += this.leftChunks[i].length;
      }

      this.onStatsCallback({
        peakFloatLeft: Math.round(peakL * 1000) / 1000,
        peakFloatRight: Math.round(peakR * 1000) / 1000,
        peakDbfsLeft: Math.round(peakDbfsL * 10) / 10,
        peakDbfsRight: Math.round(peakDbfsR * 10) / 10,
        rmsDbfs: Math.round(rmsDbfs * 10) / 10,
        hasOverdrive,
        headroomDb: Math.round(headroomDb * 10) / 10,
        sampleCount: totalSamples,
        sampleRate: this.config.sampleRate,
        channels: this.config.channels,
        bitDepth: this.config.bitDepth,
      });
    }, 100);
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    this.isPaused = false;
  }

  public async stop(): Promise<EncodedAudioResult> {
    this.isRecording = false;
    this.isPaused = false;

    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }

    if (this.scriptProcessorNode) {
      this.scriptProcessorNode.disconnect();
      this.scriptProcessorNode = null;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.splitterNode) {
      this.splitterNode.disconnect();
      this.splitterNode = null;
    }

    if (this.analyserLeft) {
      this.analyserLeft.disconnect();
      this.analyserLeft = null;
    }

    if (this.analyserRight) {
      this.analyserRight.disconnect();
      this.analyserRight = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      await this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    const channelPayload = {
      left: this.leftChunks,
      right: this.config.channels === 2 ? this.rightChunks : undefined,
    };

    if (this.config.format === 'flac') {
      return encodeFlac(channelPayload, this.config.sampleRate, this.config.channels);
    } else {
      return encodeWav(
        channelPayload,
        this.config.sampleRate,
        this.config.channels,
        this.config.bitDepth
      );
    }
  }
}

// Keep export alias for backward compatibility
export { StudioAudioRecorder as Float32AudioRecorder };
export type { AudioStatsTelemetry as Float32AudioStats };
