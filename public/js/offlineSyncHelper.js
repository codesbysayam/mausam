/**
 * ====================================================================
 * MAUSAM - Atmospheric Intelligence Platform
 * IndexedDB Offline Telemetry Cache & Synchronization Coordinator
 * ====================================================================
 */

const DB_NAME = 'MausamOfflineDB';
const DB_VERSION = 2;
const STORE_OBSERVATIONS = 'cached_observations';
const STORE_ALERTS = 'cached_alerts';
const STORE_OUTBOX = 'citizen_report_outbox';

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      return reject(new Error('IndexedDB not supported in this browser runtime'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_OBSERVATIONS)) {
        db.createObjectStore(STORE_OBSERVATIONS, { keyPath: 'locationId' });
      }
      if (!db.objectStoreNames.contains(STORE_ALERTS)) {
        db.createObjectStore(STORE_ALERTS, { keyPath: 'alertId' });
      }
      if (!db.objectStoreNames.contains(STORE_OUTBOX)) {
        db.createObjectStore(STORE_OUTBOX, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveObservationOffline(locationId, data) {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_OBSERVATIONS, 'readwrite');
      const store = tx.objectStore(STORE_OBSERVATIONS);
      const record = {
        locationId,
        cachedAt: new Date().toISOString(),
        payload: data
      };
      const req = store.put(record);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[OfflineDB] Could not cache observation:', err);
    return false;
  }
}

export async function getObservationOffline(locationId) {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_OBSERVATIONS, 'readonly');
      const store = tx.objectStore(STORE_OBSERVATIONS);
      const req = store.get(locationId);
      req.onsuccess = () => resolve(req.result ? req.result.payload : null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[OfflineDB] Could not retrieve cached observation:', err);
    return null;
  }
}

export async function queueCitizenReport(report) {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_OUTBOX, 'readwrite');
      const store = tx.objectStore(STORE_OUTBOX);
      const entry = {
        ...report,
        queuedAt: new Date().toISOString(),
        synced: false
      };
      const req = store.add(entry);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[OfflineDB] Could not queue citizen report:', err);
    return null;
  }
}
