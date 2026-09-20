// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Official Meteorological Warning Alert Audio System
// Real-time emergency broadcast audio service grounded in NDMA/IMD
// ====================================================================

export type AudioAlertStatus = 'ready' | 'playing' | 'muted' | 'unavailable';
export type AlertSeverityThreshold = 'yellow' | 'orange' | 'red';

export interface AlertAudioState {
  isEnabled: boolean;
  isPlaying: boolean;
  status: AudioAlertStatus;
  volume: number;
  minSeverity: AlertSeverityThreshold;
  lastPlayedReason: string | null;
  activeWarningBanner: {
    severity: 'red' | 'orange' | 'yellow';
    headline: string;
    hazard: string;
    timestamp: number;
  } | null;
}

class AlertAudioService {
  private audio: HTMLAudioElement | null = null;
  private isEnabled: boolean = false; // Require explicit user gesture to enable
  private isPlaying: boolean = false;
  private status: AudioAlertStatus = 'muted';
  private volume: number = 0.70; // Sensible 70% default
  private minSeverity: AlertSeverityThreshold = 'orange'; // Default: Orange and Red alerts
  private lastPlayedReason: string | null = null;
  private activeWarningBanner: AlertAudioState['activeWarningBanner'] = null;

  private alertedFingerprints: Set<string> = new Set();
  private listeners: Set<(state: AlertAudioState) => void> = new Set();
  private bannerTimeoutId: any = null;

  private readonly STORAGE_ENABLED_KEY = 'mausam_alert_audio_enabled';
  private readonly STORAGE_VOLUME_KEY = 'mausam_alert_audio_volume';
  private readonly STORAGE_THRESHOLD_KEY = 'mausam_alert_audio_threshold';
  private readonly STORAGE_FINGERPRINTS_KEY = 'mausam_alerted_warnings';

  // Canonical production audio asset paths
  public readonly PRIMARY_AUDIO_URL = '/audio/mausam-alert.mp3';
  public readonly FALLBACK_AUDIO_URL = '/audio/mausam-alert.wav';

  constructor() {
    if (typeof window !== 'undefined') {
      this.initFromStorage();
      this.setupVisibilityListener();
    }
  }

  /**
   * Restore user preferences and already-alerted fingerprints from storage
   */
  private initFromStorage(): void {
    try {
      // 1. Alert enabled preference (default to false if not explicitly activated by user)
      const storedEnabled = localStorage.getItem(this.STORAGE_ENABLED_KEY);
      this.isEnabled = storedEnabled === 'true';

      // 2. Volume preference
      const storedVol = localStorage.getItem(this.STORAGE_VOLUME_KEY);
      if (storedVol) {
        const v = parseFloat(storedVol);
        if (!isNaN(v) && v >= 0 && v <= 1) {
          this.volume = v;
        }
      }

      // 3. Severity threshold preference
      const storedThreshold = localStorage.getItem(this.STORAGE_THRESHOLD_KEY) as AlertSeverityThreshold;
      if (storedThreshold === 'yellow' || storedThreshold === 'orange' || storedThreshold === 'red') {
        this.minSeverity = storedThreshold;
      }

      // 4. In-session alerted fingerprints
      const storedFps = sessionStorage.getItem(this.STORAGE_FINGERPRINTS_KEY);
      if (storedFps) {
        const parsed = JSON.parse(storedFps);
        if (Array.isArray(parsed)) {
          this.alertedFingerprints = new Set(parsed);
        }
      }

      this.status = this.isEnabled ? 'ready' : 'muted';
    } catch (e) {
      console.warn('[MAUSAM Alert Audio] Storage initialization note:', e);
    }
  }

  /**
   * Lazy instantiate and preload the single HTMLAudioElement
   */
  private getOrCreateAudio(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    if (this.audio) return this.audio;

    try {
      const audioEl = new Audio();
      audioEl.preload = 'auto';
      audioEl.volume = this.volume;

      // Primary source with fallback
      audioEl.src = this.PRIMARY_AUDIO_URL;

      // Lifecycle event listeners
      audioEl.addEventListener('loadstart', () => {
        // Audio loading
      });

      audioEl.addEventListener('canplay', () => {
        if (this.status !== 'playing') {
          this.status = this.isEnabled ? 'ready' : 'muted';
          this.notify();
        }
      });

      audioEl.addEventListener('play', () => {
        this.isPlaying = true;
        this.status = 'playing';
        this.notify();
      });

      audioEl.addEventListener('pause', () => {
        this.isPlaying = false;
        this.status = this.isEnabled ? 'ready' : 'muted';
        this.notify();
      });

      audioEl.addEventListener('ended', () => {
        this.isPlaying = false;
        this.status = this.isEnabled ? 'ready' : 'muted';
        this.notify();
      });

      audioEl.addEventListener('error', (e) => {
        console.warn('[MAUSAM Alert Audio] Error on primary asset, trying fallback:', e);
        if (audioEl.src.endsWith('.mp3')) {
          audioEl.src = this.FALLBACK_AUDIO_URL;
          audioEl.load();
        } else {
          this.status = 'unavailable';
          this.isPlaying = false;
          this.notify();
        }
      });

      this.audio = audioEl;
      return this.audio;
    } catch (err) {
      console.error('[MAUSAM Alert Audio] Failed to instantiate audio element:', err);
      this.status = 'unavailable';
      this.notify();
      return null;
    }
  }

  /**
   * Preload the audio file without playing
   */
  public preload(): void {
    const el = this.getOrCreateAudio();
    if (el) {
      el.load();
    }
  }

  /**
   * User Activation: Enable audio alerts inside a user gesture
   */
  public async enable(): Promise<boolean> {
    const el = this.getOrCreateAudio();
    if (!el) {
      this.status = 'unavailable';
      this.notify();
      return false;
    }

    try {
      this.isEnabled = true;
      this.status = 'ready';
      localStorage.setItem(this.STORAGE_ENABLED_KEY, 'true');

      // Preload audio asset
      el.load();

      this.notify();
      return true;
    } catch (err) {
      console.error('[MAUSAM Alert Audio] Enable failed:', err);
      this.isEnabled = false;
      this.status = 'unavailable';
      this.notify();
      return false;
    }
  }

  /**
   * Disable audio alerts: stop current playback and mute
   */
  public disable(): void {
    this.stop();
    this.isEnabled = false;
    this.status = 'muted';
    try {
      localStorage.setItem(this.STORAGE_ENABLED_KEY, 'false');
    } catch {
      // Ignore
    }
    this.notify();
  }

  /**
   * Toggle audio alert state
   */
  public async toggle(): Promise<boolean> {
    if (this.isEnabled) {
      this.disable();
      return false;
    } else {
      return await this.enable();
    }
  }

  /**
   * Play the official MAUSAM alert tone
   */
  public async play(reason: string = 'manual_test'): Promise<boolean> {
    const el = this.getOrCreateAudio();
    if (!el) {
      this.status = 'unavailable';
      this.notify();
      return false;
    }

    try {
      el.volume = this.volume;
      el.currentTime = 0;
      this.lastPlayedReason = reason;

      const playPromise = el.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
      this.isPlaying = true;
      this.status = 'playing';
      this.notify();
      return true;
    } catch (err: any) {
      // Gracefully handle browser autoplay blocks or aborts
      if (err?.name === 'NotAllowedError') {
        console.warn('[MAUSAM Alert Audio] Playback blocked by browser autoplay policy.');
      } else {
        console.warn('[MAUSAM Alert Audio] Playback error:', err);
      }
      this.isPlaying = false;
      this.status = this.isEnabled ? 'ready' : 'muted';
      this.notify();
      return false;
    }
  }

  /**
   * Stop current alert playback
   */
  public stop(): void {
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
      } catch {
        // Ignore
      }
    }
    this.isPlaying = false;
    this.status = this.isEnabled ? 'ready' : 'muted';
    this.notify();
  }

  /**
   * Set alert playback volume (0.0 to 1.0)
   */
  public setVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1, vol));
    this.volume = clamped;
    if (this.audio) {
      this.audio.volume = clamped;
    }
    try {
      localStorage.setItem(this.STORAGE_VOLUME_KEY, clamped.toString());
    } catch {
      // Ignore
    }
    this.notify();
  }

  /**
   * Set minimum alert severity threshold for audio triggering
   */
  public setMinSeverity(threshold: AlertSeverityThreshold): void {
    this.minSeverity = threshold;
    try {
      localStorage.setItem(this.STORAGE_THRESHOLD_KEY, threshold);
    } catch {
      // Ignore
    }
    this.notify();
  }

  /**
   * Compute stable fingerprint for a warning record
   */
  public computeFingerprint(warning: {
    id?: string;
    bulletinNo?: string;
    title?: string;
    state?: string;
    stateCode?: string;
    hazardCategory?: string;
    hazardLabel?: string;
    severity?: string;
    issuedAt?: string;
    source?: string;
  }): string {
    const source = (warning.source || 'IMD').trim().toLowerCase();
    const id = (warning.id || warning.bulletinNo || warning.title || 'alert').trim().toLowerCase();
    const state = (warning.stateCode || warning.state || 'all').trim().toLowerCase();
    const hazard = (warning.hazardCategory || warning.hazardLabel || 'general').trim().toLowerCase();
    const issued = (warning.issuedAt || '').trim();

    return `${source}::${id}::${state}::${hazard}::${issued}`;
  }

  /**
   * Check if a warning meets the configured severity threshold
   */
  private meetsSeverityThreshold(severityRaw: string): boolean {
    const sev = severityRaw.toLowerCase();
    if (sev === 'green' || sev === 'none' || sev === 'info' || sev === 'normal') {
      return false; // Green never triggers emergency audio
    }

    if (this.minSeverity === 'yellow') {
      return sev === 'yellow' || sev === 'advisory' || sev === 'orange' || sev === 'severe' || sev === 'red' || sev === 'extreme';
    }

    if (this.minSeverity === 'orange') {
      return sev === 'orange' || sev === 'severe' || sev === 'warning' || sev === 'red' || sev === 'extreme';
    }

    // Default 'red'
    return sev === 'red' || sev === 'extreme';
  }

  /**
   * Real Warning Trigger: Trigger alert tone for a newly arrived active official warning
   */
  public triggerOfficialWarning(warning: {
    id?: string;
    bulletinNo?: string;
    title?: string;
    state?: string;
    stateCode?: string;
    hazardCategory?: string;
    hazardLabel?: string;
    severity?: string;
    issuedAt?: string;
    source?: string;
  }): boolean {
    const severity = (warning.severity || 'yellow').toLowerCase();

    // 1. Check severity threshold
    if (!this.meetsSeverityThreshold(severity)) {
      return false;
    }

    // 2. Calculate unique fingerprint
    const fp = this.computeFingerprint(warning);

    // 3. Prevent duplicate playback for already-alerted warning
    if (this.alertedFingerprints.has(fp)) {
      return false;
    }

    // 4. Mark fingerprint as alerted
    this.alertedFingerprints.add(fp);
    try {
      // Keep up to 100 recent fingerprints in session storage
      const fpArray = Array.from(this.alertedFingerprints).slice(-100);
      sessionStorage.setItem(this.STORAGE_FINGERPRINTS_KEY, JSON.stringify(fpArray));
    } catch {
      // Ignore session storage errors
    }

    // 5. If audio alerts are enabled, play the official alert tone
    if (this.isEnabled) {
      this.play(`official_warning:${fp}`);
    }

    // 6. Update high-priority warning banner in UI
    const mappedSeverity: 'red' | 'orange' | 'yellow' =
      severity === 'red' || severity === 'extreme'
        ? 'red'
        : severity === 'orange' || severity === 'severe'
        ? 'orange'
        : 'yellow';

    this.activeWarningBanner = {
      severity: mappedSeverity,
      headline: warning.title || 'Official Meteorological Warning Bulletin',
      hazard: warning.hazardLabel || warning.hazardCategory || 'Severe Weather',
      timestamp: Date.now(),
    };

    if (this.bannerTimeoutId) {
      clearTimeout(this.bannerTimeoutId);
    }
    this.bannerTimeoutId = setTimeout(() => {
      this.activeWarningBanner = null;
      this.notify();
    }, 15000); // Display alert banner for 15 seconds

    this.notify();
    return true;
  }

  /**
   * Get complete service status snapshot
   */
  public getStatus(): AlertAudioState {
    return {
      isEnabled: this.isEnabled,
      isPlaying: this.isPlaying,
      status: this.status,
      volume: this.volume,
      minSeverity: this.minSeverity,
      lastPlayedReason: this.lastPlayedReason,
      activeWarningBanner: this.activeWarningBanner,
    };
  }

  /**
   * Clear active banner manually
   */
  public clearActiveBanner(): void {
    this.activeWarningBanner = null;
    this.notify();
  }

  /**
   * Subscribe to audio state changes
   */
  public subscribe(listener: (state: AlertAudioState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getStatus());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const state = this.getStatus();
    this.listeners.forEach((fn) => {
      try {
        fn(state);
      } catch (err) {
        console.error('[MAUSAM Alert Audio] Listener notification error:', err);
      }
    });
  }

  /**
   * Synchronize when user returns to tab
   */
  private setupVisibilityListener(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // Tab became visible again
        this.notify();
      }
    });
  }
}

// Global Singleton Export
export const alertAudioService = new AlertAudioService();
