// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Severe Weather Audio Alert Service
// Studio-Grade Emergency Broadcast Audio with Multi-Profile Support
// Featuring: Anime Ahh (MyInstants #73606) as primary alert audio
// ====================================================================

import { ANIME_AHH_BASE64_AUDIO } from './animeAhhAudioData';

export type AlertSoundType = 'anime_ahh' | 'emergency_alert' | 'warning_siren' | 'broadcast_chime';

export interface AlertSoundProfile {
  id: AlertSoundType;
  label: string;
  description: string;
  url: string;
  fallbackUrl?: string;
}

export const ALERT_SOUND_PROFILES: AlertSoundProfile[] = [
  {
    id: 'anime_ahh',
    label: 'Anime Ahh (MyInstants #73606)',
    description: 'Authentic Anime Ahh sound effect from MyInstants (instant #73606)',
    url: ANIME_AHH_BASE64_AUDIO, // Embedded base64 for 100% instant zero-failure playback
    fallbackUrl: '/sounds/anime_ahh.mp3',
  },
  {
    id: 'emergency_alert',
    label: 'Emergency Broadcast (EAS)',
    description: 'Official 853Hz+960Hz dual-frequency attention signal & 1050Hz weather warning bursts',
    url: '/sounds/severe_alert.wav',
  },
  {
    id: 'warning_siren',
    label: 'Warning Siren (NDMA)',
    description: 'Urgent civil defense emergency klaxon and warning wail',
    url: '/sounds/warning_siren.wav',
  },
  {
    id: 'broadcast_chime',
    label: 'Broadcast Chime',
    description: 'Authoritative 3-tone acoustic mallet announcement chime',
    url: '/sounds/broadcast_chime.wav',
  },
];

class AlertAudioService {
  private audioCtx: AudioContext | null = null;
  private isEnabled: boolean = true; // Enabled by default so alert sounds immediately
  private soundType: AlertSoundType = 'anime_ahh'; // Default to anime_ahh
  private volume: number = 0.9;
  private isPlaying: boolean = false;
  private currentAudioElement: HTMLAudioElement | null = null;
  private preloadedAudios: Map<AlertSoundType, HTMLAudioElement> = new Map();
  private decodedBufferCache: Map<string, AudioBuffer> = new Map();
  private listeners: Set<() => void> = new Set();

  private readonly STORAGE_ENABLED_KEY = 'mausam_severe_audio_alert_enabled';
  private readonly STORAGE_TYPE_KEY = 'mausam_severe_audio_sound_type';
  private readonly STORAGE_VOL_KEY = 'mausam_severe_audio_volume';

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const storedEnabled = localStorage.getItem(this.STORAGE_ENABLED_KEY);
        if (storedEnabled !== null) {
          this.isEnabled = storedEnabled === 'true';
        } else {
          this.isEnabled = true; // default enabled
        }

        const storedType = localStorage.getItem(this.STORAGE_TYPE_KEY) as AlertSoundType;
        if (storedType && ALERT_SOUND_PROFILES.some((p) => p.id === storedType)) {
          this.soundType = storedType;
        } else {
          this.soundType = 'anime_ahh'; // default to requested Anime Ahh
        }

        const storedVol = localStorage.getItem(this.STORAGE_VOL_KEY);
        if (storedVol) {
          const parsed = parseFloat(storedVol);
          if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
            this.volume = parsed;
          }
        }
      } catch {
        // storage access fallback
      }

      // Preload audio elements
      this.preloadAudio();
    }
  }

  private preloadAudio(): void {
    if (typeof window === 'undefined') return;
    ALERT_SOUND_PROFILES.forEach((profile) => {
      try {
        const audio = new Audio(profile.url);
        audio.preload = 'auto';
        this.preloadedAudios.set(profile.id, audio);
      } catch {
        // ignore preload errors
      }
    });
  }

  public isAudioAlertEnabled(): boolean {
    return this.isEnabled;
  }

  public getSoundType(): AlertSoundType {
    return this.soundType;
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public setAudioAlertEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    try {
      localStorage.setItem(this.STORAGE_ENABLED_KEY, String(enabled));
    } catch {}
    this.notifyListeners();

    if (enabled) {
      // Play brief test sound when user explicitly enables
      this.playSevereAlertSound(this.soundType, false);
    }
  }

  public toggleAudioAlert(): boolean {
    const next = !this.isEnabled;
    this.setAudioAlertEnabled(next);
    return next;
  }

  public setSoundType(type: AlertSoundType): void {
    this.soundType = type;
    try {
      localStorage.setItem(this.STORAGE_TYPE_KEY, type);
    } catch {}
    this.notifyListeners();
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem(this.STORAGE_VOL_KEY, String(this.volume));
    } catch {}
    this.notifyListeners();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Stop any currently active alert audio
   */
  public stopSound(): void {
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch {}
      this.currentAudioElement = null;
    }
    this.isPlaying = false;
    this.notifyListeners();
  }

  /**
   * Play the alert audio without any failure
   * Level 1: Embedded Audio / HTML5 Audio element
   * Level 2: Secondary URL fallback
   * Level 3: Web Audio API BufferSource playback
   * Level 4: Synthesized fallback
   */
  public playSevereAlertSound(overrideType?: AlertSoundType, enforceEnabled = true): void {
    if (enforceEnabled && !this.isEnabled) return;

    const typeToPlay = overrideType || this.soundType;
    const profile = ALERT_SOUND_PROFILES.find((p) => p.id === typeToPlay) || ALERT_SOUND_PROFILES[0];

    this.stopSound();
    this.isPlaying = true;
    this.notifyListeners();

    // Trigger haptic vibration on devices with vibration support
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200, 100, 300]);
      } catch {}
    }

    // Try HTML5 Audio
    try {
      const audio = new Audio(profile.url);
      audio.volume = this.volume;
      this.currentAudioElement = audio;

      audio.onended = () => {
        this.isPlaying = false;
        this.currentAudioElement = null;
        this.notifyListeners();
      };

      const handleAudioError = () => {
        // If primary url fails, try fallbackUrl or Web Audio
        if (profile.fallbackUrl) {
          try {
            const fallbackAudio = new Audio(profile.fallbackUrl);
            fallbackAudio.volume = this.volume;
            this.currentAudioElement = fallbackAudio;
            fallbackAudio.onended = () => {
              this.isPlaying = false;
              this.currentAudioElement = null;
              this.notifyListeners();
            };
            fallbackAudio.onerror = () => {
              this.playThroughWebAudio(profile, typeToPlay);
            };
            fallbackAudio.play().catch(() => {
              this.playThroughWebAudio(profile, typeToPlay);
            });
            return;
          } catch {
            this.playThroughWebAudio(profile, typeToPlay);
            return;
          }
        }
        this.playThroughWebAudio(profile, typeToPlay);
      };

      audio.onerror = handleAudioError;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('[AlertAudioService] HTML5 Audio play error, trying fallback:', err);
          handleAudioError();
        });
      }
    } catch (e) {
      console.warn('[AlertAudioService] Error creating HTML5 audio element:', e);
      this.playThroughWebAudio(profile, typeToPlay);
    }
  }

  /**
   * Direct test function to preview the alert sound
   */
  public playTestSound(overrideType?: AlertSoundType): void {
    this.playSevereAlertSound(overrideType, false);
  }

  /**
   * Play audio buffer directly using Web Audio API AudioContext
   */
  private playThroughWebAudio(profile: AlertSoundProfile, type: AlertSoundType): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) {
        this.isPlaying = false;
        this.notifyListeners();
        return;
      }

      const cached = this.decodedBufferCache.get(profile.id);
      if (cached) {
        this.playBuffer(ctx, cached);
        return;
      }

      // Convert data URL or fetch URL to ArrayBuffer
      if (profile.url.startsWith('data:')) {
        const base64Part = profile.url.split(',')[1];
        const binaryString = atob(base64Part);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        ctx.decodeAudioData(
          bytes.buffer.slice(0),
          (decoded) => {
            this.decodedBufferCache.set(profile.id, decoded);
            this.playBuffer(ctx, decoded);
          },
          () => {
            this.playSynthesizedEmergencyAudio(type);
          }
        );
      } else {
        fetch(profile.url)
          .then((r) => r.arrayBuffer())
          .then((arrBuf) => {
            ctx.decodeAudioData(
              arrBuf,
              (decoded) => {
                this.decodedBufferCache.set(profile.id, decoded);
                this.playBuffer(ctx, decoded);
              },
              () => {
                this.playSynthesizedEmergencyAudio(type);
              }
            );
          })
          .catch(() => {
            this.playSynthesizedEmergencyAudio(type);
          });
      }
    } catch (e) {
      console.warn('[AlertAudioService] Web Audio buffer playback failed:', e);
      this.playSynthesizedEmergencyAudio(type);
    }
  }

  private playBuffer(ctx: AudioContext, buffer: AudioBuffer): void {
    try {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(this.volume, ctx.currentTime);
      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      source.onended = () => {
        this.isPlaying = false;
        this.notifyListeners();
      };

      source.start(0);
    } catch (err) {
      console.warn('[AlertAudioService] Buffer start error:', err);
      this.isPlaying = false;
      this.notifyListeners();
    }
  }

  /**
   * Emergency Tone Synthesis Fallback
   */
  private playSynthesizedEmergencyAudio(type: AlertSoundType): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) {
        this.isPlaying = false;
        this.notifyListeners();
        return;
      }

      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.connect(ctx.destination);
      masterGain.gain.exponentialRampToValueAtTime(Math.max(0.001, this.volume * 0.7), now + 0.04);

      // Play high-energy alert sound
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      osc2.frequency.setValueAtTime(1046, now);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.85);
      osc2.stop(now + 0.85);

      setTimeout(() => {
        this.isPlaying = false;
        this.notifyListeners();
      }, 900);
    } catch (err) {
      console.warn('[AlertAudioService] Synthesis fallback error:', err);
      this.isPlaying = false;
      this.notifyListeners();
    }
  }
}

export const alertAudioService = new AlertAudioService();
