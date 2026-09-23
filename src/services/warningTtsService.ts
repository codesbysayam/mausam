// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// MAUSAM Warning Readout / TTS Engine Service (WarningTtsService)
// Truthful browser speech synthesis for meteorological warnings
// Grounded contract: IDLE | READY | PLAYING | PAUSED | UNAVAILABLE | ERROR
// Note: This is a MAUSAM-synthesized readout, NOT an official IMD audio recording.
// ====================================================================

export type WarningTtsStatus = 'IDLE' | 'READY' | 'PLAYING' | 'PAUSED' | 'UNAVAILABLE' | 'ERROR';

export type SupportedLanguageCode =
  | 'en'
  | 'hi'
  | 'or'
  | 'te'
  | 'bn'
  | 'ta'
  | 'kn'
  | 'ml'
  | 'mr'
  | 'gu'
  | 'pa'
  | 'as'
  | 'ne';

export interface LanguageMeta {
  code: SupportedLanguageCode;
  label: string;
  nativeLabel: string;
  locale: string;
  fallbackLocales: string[];
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', locale: 'en-IN', fallbackLocales: ['en-GB', 'en-US', 'en'] },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', locale: 'hi-IN', fallbackLocales: ['hi', 'en-IN'] },
  { code: 'or', label: 'Odia', nativeLabel: 'ଓଡ଼ିଆ', locale: 'or-IN', fallbackLocales: ['or', 'hi-IN', 'en-IN'] },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', locale: 'te-IN', fallbackLocales: ['te', 'hi-IN', 'en-IN'] },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা', locale: 'bn-IN', fallbackLocales: ['bn-BD', 'bn', 'en-IN'] },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', locale: 'ta-IN', fallbackLocales: ['ta-LK', 'ta', 'en-IN'] },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', locale: 'kn-IN', fallbackLocales: ['kn', 'en-IN'] },
  { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം', locale: 'ml-IN', fallbackLocales: ['ml', 'en-IN'] },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी', locale: 'mr-IN', fallbackLocales: ['mr', 'hi-IN', 'en-IN'] },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી', locale: 'gu-IN', fallbackLocales: ['gu', 'hi-IN', 'en-IN'] },
  { code: 'pa', label: 'Punjabi', nativeLabel: 'ਪੰਜਾਬੀ', locale: 'pa-IN', fallbackLocales: ['pa', 'hi-IN', 'en-IN'] },
  { code: 'as', label: 'Assamese', nativeLabel: 'অসমীয়া', locale: 'as-IN', fallbackLocales: ['as', 'bn-IN', 'en-IN'] },
  { code: 'ne', label: 'Nepali', nativeLabel: 'नेपाली', locale: 'ne-NP', fallbackLocales: ['ne', 'hi-IN', 'en-IN'] },
];

export interface WarningAudioSegments {
  title: string;
  severity: string;
  affectedArea: string;
  validity: string;
  mainWarning: string;
  safetyInstruction: string;
}

export interface TtsVoiceInfo {
  name: string;
  lang: string;
  isNative: boolean;
  isFallback: boolean;
  warningNote?: string;
}

export class WarningTtsService {
  private static instance: WarningTtsService;

  private status: WarningTtsStatus = 'IDLE';
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentLanguage: SupportedLanguageCode = 'en';
  private voices: SpeechSynthesisVoice[] = [];
  private listeners: Set<(status: WarningTtsStatus, meta?: any) => void> = new Set();
  private watchdogTimer: any = null;
  private queue: string[] = [];
  private currentChunkIndex: number = 0;
  private currentWarningFingerprint: string | null = null;
  private isInitialized: boolean = false;

  private constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initialize();
    } else {
      this.status = 'UNAVAILABLE';
    }
  }

  public static getInstance(): WarningTtsService {
    if (!WarningTtsService.instance) {
      WarningTtsService.instance = new WarningTtsService();
    }
    return WarningTtsService.instance;
  }

  /**
   * Initializes TTS engine and loads browser voices asynchronously
   */
  public initialize(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.status = 'UNAVAILABLE';
      this.notify();
      return;
    }

    try {
      this.loadVoices();

      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.loadVoices();
        };
      }

      this.isInitialized = true;
      if (this.status === 'IDLE' || this.status === 'UNAVAILABLE') {
        this.status = 'READY';
      }
      this.notify();
    } catch (e) {
      console.warn('[WarningTtsService] Initialization warning:', e);
      this.status = 'ERROR';
      this.notify();
    }
  }

  private loadVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      const v = window.speechSynthesis.getVoices();
      if (Array.isArray(v) && v.length > 0) {
        this.voices = v;
      }
    } catch {
      // Ignore getVoices errors
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0) {
      this.loadVoices();
    }
    return this.voices;
  }

  /**
   * Discovers the best matching voice for a language code.
   * Returns metadata indicating if native regional voice was found or if using fallback.
   */
  public selectVoice(langCode: SupportedLanguageCode): {
    voice: SpeechSynthesisVoice | null;
    info: TtsVoiceInfo;
  } {
    const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === langCode) || SUPPORTED_LANGUAGES[0];
    const available = this.getVoices();

    if (available.length === 0) {
      return {
        voice: null,
        info: {
          name: 'System Default',
          lang: langMeta.locale,
          isNative: false,
          isFallback: true,
          warningNote: 'No specialized voices exposed by browser. Using system synthesizer.',
        },
      };
    }

    // 1. Exact match on target locale (e.g. 'te-IN' or 'hi-IN')
    let found = available.find(
      (v) => v.lang.toLowerCase() === langMeta.locale.toLowerCase() || v.lang.toLowerCase().replace('_', '-') === langMeta.locale.toLowerCase()
    );

    if (found) {
      return {
        voice: found,
        info: {
          name: found.name,
          lang: found.lang,
          isNative: true,
          isFallback: false,
        },
      };
    }

    // 2. Match on primary language subtag (e.g. 'te' or 'hi')
    const primaryTag = langMeta.locale.split('-')[0].toLowerCase();
    found = available.find((v) => v.lang.toLowerCase().startsWith(primaryTag));
    if (found) {
      return {
        voice: found,
        info: {
          name: found.name,
          lang: found.lang,
          isNative: true,
          isFallback: false,
        },
      };
    }

    // 3. Match on configured fallbacks (e.g., 'en-IN' or 'en-US')
    for (const fb of langMeta.fallbackLocales) {
      const fbTag = fb.toLowerCase();
      found = available.find(
        (v) => v.lang.toLowerCase() === fbTag || v.lang.toLowerCase().startsWith(fbTag.split('-')[0])
      );
      if (found) {
        return {
          voice: found,
          info: {
            name: found.name,
            lang: found.lang,
            isNative: false,
            isFallback: true,
            warningNote: `Regional voice for ${langMeta.label} unavailable in this browser. Using ${found.name} (${found.lang}) fallback.`,
          },
        };
      }
    }

    // 4. Default voice
    const defaultVoice = available.find((v) => v.default) || available[0];
    return {
      voice: defaultVoice,
      info: {
        name: defaultVoice?.name || 'Default',
        lang: defaultVoice?.lang || 'en-US',
        isNative: false,
        isFallback: true,
        warningNote: `Regional voice for ${langMeta.label} unavailable in this browser. Using system fallback.`,
      },
    };
  }

  public hasNativeVoice(langCode: SupportedLanguageCode): boolean {
    const match = this.selectVoice(langCode);
    return match.info.isNative;
  }

  public getVoiceNote(langCode: SupportedLanguageCode): string | null {
    const match = this.selectVoice(langCode);
    return match.info.warningNote || null;
  }

  /**
   * Speaks structured warning segments sequentially through one controlled queue
   */
  public speakWarning(
    segments: WarningAudioSegments,
    language: SupportedLanguageCode,
    fingerprint?: string
  ): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.status = 'UNAVAILABLE';
      this.notify();
      return false;
    }

    // If already playing this warning, stop
    if (this.status === 'PLAYING' && this.currentWarningFingerprint === fingerprint) {
      this.stop();
      return false;
    }

    // Stop any active speech cleanly
    this.stop();

    // Prepare structured sentence chunks
    const chunks: string[] = [
      segments.title,
      `Severity: ${segments.severity}.`,
      `Affected Area: ${segments.affectedArea}.`,
      `Validity: ${segments.validity}.`,
      segments.mainWarning,
      `Safety Instruction: ${segments.safetyInstruction}`,
    ].filter((c) => c && c.trim().length > 0);

    if (chunks.length === 0) return false;

    this.queue = chunks;
    this.currentChunkIndex = 0;
    this.currentLanguage = language;
    this.currentWarningFingerprint = fingerprint || null;

    this.playNextChunk();
    return true;
  }

  /**
   * Plays single text or starts single-item queue
   */
  public speak(text: string, language: SupportedLanguageCode = 'en', fingerprint?: string): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.status = 'UNAVAILABLE';
      this.notify();
      return false;
    }

    this.stop();

    if (!text || text.trim().length === 0) return false;

    this.queue = [text.trim()];
    this.currentChunkIndex = 0;
    this.currentLanguage = language;
    this.currentWarningFingerprint = fingerprint || null;

    this.playNextChunk();
    return true;
  }

  private playNextChunk(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (this.currentChunkIndex >= this.queue.length) {
      // Completed all chunks
      this.finishPlayback();
      return;
    }

    const chunkText = this.queue[this.currentChunkIndex];
    const { voice, info } = this.selectVoice(this.currentLanguage);
    const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === this.currentLanguage) || SUPPORTED_LANGUAGES[0];

    try {
      const utterance = new SpeechSynthesisUtterance(chunkText);
      if (voice) {
        utterance.voice = voice;
      }
      utterance.lang = voice?.lang || langMeta.locale;
      utterance.rate = 0.95; // Clear meteorological cadence
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        this.status = 'PLAYING';
        this.notify({ chunkIndex: this.currentChunkIndex, totalChunks: this.queue.length, info });
        this.resetWatchdog();
      };

      utterance.onend = () => {
        this.clearWatchdog();
        this.currentChunkIndex++;
        if (this.status === 'PLAYING') {
          // Speak next chunk with a gentle pause
          setTimeout(() => {
            if (this.status === 'PLAYING') {
              this.playNextChunk();
            }
          }, 350);
        }
      };

      utterance.onerror = (e) => {
        console.warn('[WarningTtsService] Chunk speech error:', e);
        this.clearWatchdog();
        // Skip to next chunk or finish
        this.currentChunkIndex++;
        if (this.currentChunkIndex < this.queue.length && this.status === 'PLAYING') {
          this.playNextChunk();
        } else {
          this.finishPlayback();
        }
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('[WarningTtsService] Speak execution error:', err);
      this.status = 'ERROR';
      this.notify();
    }
  }

  private finishPlayback(): void {
    this.clearWatchdog();
    this.status = 'READY';
    this.currentUtterance = null;
    this.queue = [];
    this.currentChunkIndex = 0;
    this.notify();
  }

  public pause(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && this.status === 'PLAYING') {
      try {
        window.speechSynthesis.pause();
        this.status = 'PAUSED';
        this.notify();
      } catch (e) {
        console.warn('[WarningTtsService] Pause error:', e);
      }
    }
  }

  public resume(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && this.status === 'PAUSED') {
      try {
        window.speechSynthesis.resume();
        this.status = 'PLAYING';
        this.notify();
      } catch (e) {
        console.warn('[WarningTtsService] Resume error:', e);
      }
    }
  }

  /**
   * Stop cancels the entire queue and resets status immediately
   */
  public stop(): void {
    this.clearWatchdog();
    this.queue = [];
    this.currentChunkIndex = 0;
    this.currentUtterance = null;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // Ignore cancel errors
      }
    }

    this.status = this.isInitialized ? 'READY' : 'IDLE';
    this.notify();
  }

  public test(language: SupportedLanguageCode = 'en'): boolean {
    const testText =
      language === 'hi'
        ? 'मौसम चेतावनी ध्वनि परीक्षण। यह एक स्वतः जनित वाक् परीक्षण है।'
        : language === 'or'
        ? 'ପାଣିପାଗ ସତର୍କତା ଧ୍ୱନି ପରୀକ୍ଷଣ। ଏହା ଏକ ପରୀକ୍ଷାମୂଳକ ବାର୍ତ୍ତା।'
        : language === 'te'
        ? 'వాతావరణ హెచ్చరిక ధ్వని పరీక్ష. ఇది ఒక స్వయంచాలక పరీక్ష సందేశం.'
        : 'MAUSAM meteorological readout test. This is an automated speech synthesis test.';

    return this.speak(testText, language, 'mausam-tts-test');
  }

  public getStatus(): WarningTtsStatus {
    return this.status;
  }

  public getCurrentLanguage(): SupportedLanguageCode {
    return this.currentLanguage;
  }

  public subscribe(listener: (status: WarningTtsStatus, meta?: any) => void): () => void {
    this.listeners.add(listener);
    listener(this.status);
    return () => this.listeners.delete(listener);
  }

  private notify(meta?: any): void {
    for (const listener of this.listeners) {
      try {
        listener(this.status, meta);
      } catch (e) {
        console.error('[WarningTtsService] Listener notification error:', e);
      }
    }
  }

  /**
   * Chrome & WebKit sometimes freeze long utterances.
   * Watchdog automatically pauses/resumes or recovers if speech gets stuck.
   */
  private resetWatchdog(): void {
    this.clearWatchdog();
    this.watchdogTimer = setTimeout(() => {
      if (this.status === 'PLAYING' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        } catch {
          // Ignore
        }
      }
    }, 12000);
  }

  private clearWatchdog(): void {
    if (this.watchdogTimer) {
      clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }
  }
}

export const warningTtsService = WarningTtsService.getInstance();
