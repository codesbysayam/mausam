// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Cross-Tab Data Coordination Service (BroadcastChannel)
// Synchronizes weather cache, location, and provider status across browser tabs.
// ====================================================================

import { WeatherDataBundle } from './weatherService';
import { LocationRecord } from '../types';

export type CrossTabMessageType =
  | 'WEATHER_UPDATE'
  | 'LOCATION_CHANGE'
  | 'SYSTEM_HEALTH_UPDATE';

export interface CrossTabMessage {
  type: CrossTabMessageType;
  payload: any;
  senderId: string;
  timestamp: number;
}

class CrossTabSyncService {
  private channel: BroadcastChannel | null = null;
  private tabId: string;
  private listeners: Set<(message: CrossTabMessage) => void> = new Set();

  constructor() {
    this.tabId = `tab_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('mausam-data');
        this.channel.onmessage = (event: MessageEvent<CrossTabMessage>) => {
          if (event.data && event.data.senderId !== this.tabId) {
            this.notifyListeners(event.data);
          }
        };
      } catch (err) {
        console.warn('[CrossTabSync] BroadcastChannel unavailable, cross-tab sync disabled:', err);
      }
    }
  }

  public get currentTabId(): string {
    return this.tabId;
  }

  public subscribe(callback: (message: CrossTabMessage) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(message: CrossTabMessage) {
    this.listeners.forEach((listener) => {
      try {
        listener(message);
      } catch (err) {
        console.error('[CrossTabSync] Error in listener:', err);
      }
    });
  }

  public broadcastWeather(locationId: string, bundle: WeatherDataBundle) {
    if (!this.channel) return;
    try {
      this.channel.postMessage({
        type: 'WEATHER_UPDATE',
        payload: { locationId, bundle },
        senderId: this.tabId,
        timestamp: Date.now(),
      });
    } catch {
      // Ignore serializing errors
    }
  }

  public broadcastLocation(location: LocationRecord) {
    if (!this.channel) return;
    try {
      this.channel.postMessage({
        type: 'LOCATION_CHANGE',
        payload: location,
        senderId: this.tabId,
        timestamp: Date.now(),
      });
    } catch {}
  }
}

export const crossTabSync = new CrossTabSyncService();
