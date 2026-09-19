// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// SACHET / NDMA CAP & RSS Integration Service
// Server-Side Provider with Cookie Handshake, ETag Caching,
// Request Deduplication, Expiration Filtering & Canonical Region Mapping
// ====================================================================

export interface WeatherWarning {
  id: string;
  source: string;
  sender?: string;
  event: string;
  headline?: string;
  description?: string;
  instruction?: string;
  severity: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' | 'UNKNOWN';
  urgency?: string;
  certainty?: string;
  sentAt?: string;
  effective?: string;
  onset?: string;
  expires?: string;
  areas: string[];
  affectedStates?: string[];
  affectedDistricts?: string[];
  latitude?: number;
  longitude?: number;
  geometry?: any;
  issuedAt: string;
  sourceUrl?: string;
  rawSeverityColor?: string;
  status?: string;
  msgType?: string;
}

export interface RawCapAlert {
  identifier?: number | string;
  alert_id?: string;
  alert_id_sdma_autoinc?: number | string;
  sender?: string;
  sent?: string;
  msgType?: string;
  disaster_type?: string;
  severity?: string;
  severity_color?: string;
  severity_level?: string;
  area_description?: string;
  warning_message?: string;
  effective_start_time?: string;
  effective_end_time?: string;
  alert_source?: string;
  centroid?: string;
  area_covered?: string;
  sender_org_id?: string;
  [key: string]: any;
}

export interface CanonicalRegion {
  name: string;
  code: string;
  type: 'STATE' | 'UT';
  capital: string;
  lat: number;
  lng: number;
  aliases: string[];
}

export interface SachetDiagnostics {
  provider: string;
  endpointStatus: 'REACHABLE' | 'UNREACHABLE' | 'UNKNOWN';
  fetchStatus: 'SUCCESS' | 'FAILED' | 'STALE' | 'IDLE';
  httpStatus: number | null;
  parserStatus: 'OPERATIONAL' | 'FAILED' | 'IDLE';
  alertsReceived: number;
  alertsParsed: number;
  activeAlerts: number;
  lastAttemptAt: string | null;
  lastSuccessfulFetchAt: string | null;
  lastSuccessfulParsedAt: string | null;
  dataAgeSeconds: number | null;
  error: string | null;
}

export const CANONICAL_INDIA_REGIONS: CanonicalRegion[] = [
  // 28 States
  { name: 'Andhra Pradesh', code: 'AP', type: 'STATE', capital: 'Amaravati', lat: 15.9129, lng: 79.7400, aliases: ['andhra', 'ap'] },
  { name: 'Arunachal Pradesh', code: 'AR', type: 'STATE', capital: 'Itanagar', lat: 28.2180, lng: 94.7278, aliases: ['arunachal'] },
  { name: 'Assam', code: 'AS', type: 'STATE', capital: 'Dispur', lat: 26.2006, lng: 92.9376, aliases: ['assam', 'asom'] },
  { name: 'Bihar', code: 'BR', type: 'STATE', capital: 'Patna', lat: 25.0961, lng: 85.3131, aliases: ['bihar'] },
  { name: 'Chhattisgarh', code: 'CG', type: 'STATE', capital: 'Raipur', lat: 21.2787, lng: 81.8661, aliases: ['chhattisgarh', 'chattisgarh'] },
  { name: 'Goa', code: 'GA', type: 'STATE', capital: 'Panaji', lat: 15.2993, lng: 74.1240, aliases: ['goa'] },
  { name: 'Gujarat', code: 'GJ', type: 'STATE', capital: 'Gandhinagar', lat: 22.2587, lng: 71.1924, aliases: ['gujarat'] },
  { name: 'Haryana', code: 'HR', type: 'STATE', capital: 'Chandigarh', lat: 29.0588, lng: 76.0856, aliases: ['haryana'] },
  { name: 'Himachal Pradesh', code: 'HP', type: 'STATE', capital: 'Shimla', lat: 31.1048, lng: 77.1734, aliases: ['himachal', 'hp'] },
  { name: 'Jharkhand', code: 'JH', type: 'STATE', capital: 'Ranchi', lat: 23.6102, lng: 85.2799, aliases: ['jharkhand'] },
  { name: 'Karnataka', code: 'KA', type: 'STATE', capital: 'Bengaluru', lat: 15.3173, lng: 75.7139, aliases: ['karnataka', 'bengaluru'] },
  { name: 'Kerala', code: 'KL', type: 'STATE', capital: 'Thiruvananthapuram', lat: 10.8505, lng: 76.2711, aliases: ['kerala'] },
  { name: 'Madhya Pradesh', code: 'MP', type: 'STATE', capital: 'Bhopal', lat: 22.9734, lng: 78.6569, aliases: ['madhya pradesh', 'mp'] },
  { name: 'Maharashtra', code: 'MH', type: 'STATE', capital: 'Mumbai', lat: 19.7515, lng: 75.7139, aliases: ['maharashtra', 'mumbai'] },
  { name: 'Manipur', code: 'MN', type: 'STATE', capital: 'Imphal', lat: 24.6637, lng: 93.9063, aliases: ['manipur'] },
  { name: 'Meghalaya', code: 'ML', type: 'STATE', capital: 'Shillong', lat: 25.4670, lng: 91.3662, aliases: ['meghalaya'] },
  { name: 'Mizoram', code: 'MZ', type: 'STATE', capital: 'Aizawl', lat: 23.1645, lng: 92.9376, aliases: ['mizoram'] },
  { name: 'Nagaland', code: 'NL', type: 'STATE', capital: 'Kohima', lat: 26.1584, lng: 94.5624, aliases: ['nagaland'] },
  { name: 'Odisha', code: 'OD', type: 'STATE', capital: 'Bhubaneswar', lat: 20.9517, lng: 85.0985, aliases: ['odisha', 'orissa', 'bhubaneswar', 'khordha', 'cuttack', 'puri'] },
  { name: 'Punjab', code: 'PB', type: 'STATE', capital: 'Chandigarh', lat: 31.1471, lng: 75.3412, aliases: ['punjab'] },
  { name: 'Rajasthan', code: 'RJ', type: 'STATE', capital: 'Jaipur', lat: 27.0238, lng: 74.2179, aliases: ['rajasthan', 'jaipur'] },
  { name: 'Sikkim', code: 'SK', type: 'STATE', capital: 'Gangtok', lat: 27.5330, lng: 88.5122, aliases: ['sikkim'] },
  { name: 'Tamil Nadu', code: 'TN', type: 'STATE', capital: 'Chennai', lat: 11.1271, lng: 78.6569, aliases: ['tamil nadu', 'tamilnadu', 'chennai'] },
  { name: 'Telangana', code: 'TG', type: 'STATE', capital: 'Hyderabad', lat: 18.1124, lng: 79.0193, aliases: ['telangana', 'hyderabad'] },
  { name: 'Tripura', code: 'TR', type: 'STATE', capital: 'Agartala', lat: 23.9408, lng: 91.9882, aliases: ['tripura'] },
  { name: 'Uttar Pradesh', code: 'UP', type: 'STATE', capital: 'Lucknow', lat: 26.8467, lng: 80.9462, aliases: ['uttar pradesh', 'up', 'lucknow'] },
  { name: 'Uttarakhand', code: 'UK', type: 'STATE', capital: 'Dehradun', lat: 30.0668, lng: 79.0193, aliases: ['uttarakhand', 'uttaranchal', 'dehradun'] },
  { name: 'West Bengal', code: 'WB', type: 'STATE', capital: 'Kolkata', lat: 22.9868, lng: 87.8550, aliases: ['west bengal', 'bengal', 'kolkata'] },
  // 8 Union Territories
  { name: 'Andaman and Nicobar Islands', code: 'AN', type: 'UT', capital: 'Port Blair', lat: 11.7401, lng: 92.6586, aliases: ['andaman', 'nicobar', 'port blair'] },
  { name: 'Chandigarh', code: 'CH', type: 'UT', capital: 'Chandigarh', lat: 30.7333, lng: 76.7794, aliases: ['chandigarh'] },
  { name: 'Dadra and Nagar Haveli and Daman and Diu', code: 'DH', type: 'UT', capital: 'Daman', lat: 20.4283, lng: 72.8397, aliases: ['daman', 'diu', 'dadra', 'nagar haveli'] },
  { name: 'Delhi', code: 'DL', type: 'UT', capital: 'New Delhi', lat: 28.7041, lng: 77.1025, aliases: ['delhi', 'new delhi', 'nct'] },
  { name: 'Jammu and Kashmir', code: 'JK', type: 'UT', capital: 'Srinagar', lat: 33.7782, lng: 76.5762, aliases: ['jammu', 'kashmir', 'srinagar'] },
  { name: 'Ladakh', code: 'LA', type: 'UT', capital: 'Leh', lat: 34.1526, lng: 77.5771, aliases: ['ladakh', 'leh'] },
  { name: 'Lakshadweep', code: 'LD', type: 'UT', capital: 'Kavaratti', lat: 10.5667, lng: 72.6417, aliases: ['lakshadweep', 'kavaratti'] },
  { name: 'Puducherry', code: 'PY', type: 'UT', capital: 'Pondicherry', lat: 11.9416, lng: 79.8083, aliases: ['puducherry', 'pondicherry'] },
];

export class SachetService {
  private static instance: SachetService;
  private cookie: string = '';
  private cachedAlerts: WeatherWarning[] = [];
  private lastFetchTime: number = 0;
  private cachedEtag: string = '';
  private cachedLastModified: string = '';
  private inFlightFetch: Promise<WeatherWarning[]> | null = null;
  private readonly CACHE_TTL_MS = 60 * 1000; // 60 seconds

  // Comprehensive Pipeline Telemetry
  public lastAttemptAt: string | null = null;
  public lastSuccessfulFetchAt: string | null = null;
  public lastSuccessfulParsedAt: string | null = null;
  public endpointStatus: 'REACHABLE' | 'UNREACHABLE' | 'UNKNOWN' = 'UNKNOWN';
  public fetchStatus: 'SUCCESS' | 'FAILED' | 'STALE' | 'IDLE' = 'IDLE';
  public httpStatus: number | null = null;
  public parserStatus: 'OPERATIONAL' | 'FAILED' | 'IDLE' = 'IDLE';
  public alertsReceived: number = 0;
  public alertsParsed: number = 0;
  public activeAlerts: number = 0;
  public lastError: string | null = null;

  public static getInstance(): SachetService {
    if (!SachetService.instance) {
      SachetService.instance = new SachetService();
    }
    return SachetService.instance;
  }

  /**
   * Helper: Performs an authenticated fetch against SACHET endpoints,
   * negotiating the WAF session cookie when required.
   */
  private async fetchWithCookie(url: string, timeoutMs = 8000): Promise<Response> {
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'application/json, application/xml, text/xml, */*',
      'Cache-Control': 'no-cache',
    };
    if (this.cookie) {
      headers['Cookie'] = this.cookie;
    }
    if (this.cachedEtag) {
      headers['If-None-Match'] = this.cachedEtag;
    }
    if (this.cachedLastModified) {
      headers['If-Modified-Since'] = this.cachedLastModified;
    }

    let res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(timeoutMs),
    });

    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      this.cookie = setCookie.split(';')[0];
    }

    // If 403, retry once after updating cookie header
    if (res.status === 403 && this.cookie) {
      headers['Cookie'] = this.cookie;
      res = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(timeoutMs),
      });
      const nextCookie = res.headers.get('set-cookie');
      if (nextCookie) {
        this.cookie = nextCookie.split(';')[0];
      }
    }

    return res;
  }

  /**
   * Parse severity string/color into standard 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' | 'UNKNOWN'
   */
  public normalizeSeverity(colorOrSev?: string): 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' | 'UNKNOWN' {
    if (!colorOrSev) return 'UNKNOWN';
    const s = colorOrSev.toUpperCase().trim();
    if (s.includes('RED') || s.includes('EXTREME') || s.includes('TAKE ACTION')) return 'RED';
    if (s.includes('ORANGE') || s.includes('SEVERE') || s.includes('BE PREPARED') || s.includes('ALERT')) return 'ORANGE';
    if (s.includes('YELLOW') || s.includes('MODERATE') || s.includes('BE AWARE') || s.includes('WATCH')) return 'YELLOW';
    if (s.includes('GREEN') || s.includes('ALL CLEAR') || s.includes('ROUTINE')) return 'GREEN';
    return 'UNKNOWN';
  }

  /**
   * Parse Indian Standard Time (IST) date string or standard ISO timestamp.
   * Node Date.parse fails on 'Sat Sep 19 08:00:00 IST 2026'; replace IST with +0530.
   */
  public parseCapTimestamp(timeStr?: string): number | null {
    if (!timeStr) return null;
    const sanitized = timeStr.trim().replace(/\bIST\b/g, '+0530');
    const ms = Date.parse(sanitized);
    return isNaN(ms) ? null : ms;
  }

  /**
   * Check if an alert has expired or was cancelled.
   */
  public isExpired(alert: { expires?: string; effective_end_time?: string; msgType?: string }): boolean {
    if (alert.msgType && alert.msgType.toLowerCase() === 'cancel') {
      return true;
    }
    const timeStr = alert.expires || alert.effective_end_time;
    if (!timeStr) return false;
    const expMs = this.parseCapTimestamp(timeStr);
    if (expMs === null) return false;
    return Date.now() >= expMs;
  }

  /**
   * Primary fetch method: Fetches and normalizes all current active SACHET alerts.
   * Utilizes request deduplication, in-memory caching, and fallback between
   * FetchAllAlertDetails and the official India CAP RSS feed.
   */
  public async fetchAllActiveWarnings(forceRefresh = false): Promise<WeatherWarning[]> {
    const now = Date.now();
    this.lastAttemptAt = new Date().toISOString();

    if (!forceRefresh && this.cachedAlerts.length > 0 && now - this.lastFetchTime < this.CACHE_TTL_MS) {
      // Filter out any that expired while in memory
      const active = this.cachedAlerts.filter((a) => !this.isExpired(a));
      this.activeAlerts = active.length;
      return active;
    }

    if (this.inFlightFetch && !forceRefresh) {
      return this.inFlightFetch;
    }

    this.inFlightFetch = (async () => {
      try {
        console.log('[MAUSAM][SACHET] Request started');
        let warnings: WeatherWarning[] = [];
        let fetchSuccess = false;
        let lastErr: any = null;

        // Attempt 1: FetchAllAlertDetails (JSON)
        try {
          const res = await this.fetchWithCookie('https://sachet.ndma.gov.in/cap_public_website/FetchAllAlertDetails', 8000);
          this.httpStatus = res.status;
          this.endpointStatus = 'REACHABLE';

          const contentType = res.headers.get('content-type') || '';
          console.log(`[MAUSAM][SACHET] HTTP status: ${res.status}, Content-Type: ${contentType}`);

          if (res.status === 304 && this.cachedAlerts.length > 0) {
            this.lastFetchTime = Date.now();
            this.fetchStatus = 'SUCCESS';
            const active = this.cachedAlerts.filter((a) => !this.isExpired(a));
            this.activeAlerts = active.length;
            return active;
          }

          if (res.ok) {
            const etag = res.headers.get('etag');
            if (etag) this.cachedEtag = etag;
            const lm = res.headers.get('last-modified');
            if (lm) this.cachedLastModified = lm;

            const text = await res.text();
            console.log(`[MAUSAM][SACHET] Response bytes: ${text.length}`);

            // Validate that content is actually JSON or array, not an HTML error page
            if (text && (text.trim().startsWith('[') || text.trim().startsWith('{'))) {
              let json: RawCapAlert[] = [];
              try {
                const parsed = JSON.parse(text);
                json = Array.isArray(parsed) ? parsed : [parsed];
              } catch {
                const lastObj = text.lastIndexOf('}');
                if (lastObj > 0) {
                  try {
                    const recovered = JSON.parse(text.slice(0, lastObj + 1) + ']');
                    json = Array.isArray(recovered) ? recovered : [];
                  } catch {
                    json = [];
                  }
                }
              }

              this.alertsReceived = json.length;
              console.log(`[MAUSAM][SACHET] Parser started: Discovered ${json.length} raw alerts`);

              for (const item of json) {
                try {
                  if (this.isExpired(item)) continue;

                  const sev = this.normalizeSeverity(item.severity_color || item.severity || item.severity_level);
                  let lat: number | undefined = undefined;
                  let lon: number | undefined = undefined;
                  if (item.centroid) {
                    const parts = item.centroid.split(',').map((p: string) => parseFloat(p.trim()));
                    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                      lon = parts[0];
                      lat = parts[1];
                    }
                  }

                  const areaText = item.area_description || '';
                  const areaParts = areaText.split(',').map((s: string) => s.trim()).filter(Boolean);

                  warnings.push({
                    id: String(item.identifier || item.alert_id_sdma_autoinc || item.alert_id || Math.random()),
                    source: 'NDMA / SACHET',
                    sender: item.alert_source || item.sender || 'NDMA',
                    event: item.disaster_type || 'Severe Weather',
                    headline: (item.disaster_type || 'Disaster Alert').toUpperCase(),
                    description: item.warning_message || item.area_description || '',
                    instruction: 'Follow SDMA instructions. Avoid exposed locations and inundation zones.',
                    severity: sev,
                    urgency: 'Immediate',
                    certainty: item.severity_level || 'Observed',
                    effective: item.effective_start_time,
                    expires: item.effective_end_time,
                    areas: areaText ? [areaText] : [],
                    affectedDistricts: areaParts.length >= 2 ? [areaParts[areaParts.length - 2]] : [],
                    affectedStates: areaParts.length >= 1 ? [areaParts[areaParts.length - 1]] : [],
                    latitude: lat,
                    longitude: lon,
                    issuedAt: item.effective_start_time || new Date().toISOString(),
                    rawSeverityColor: (item.severity_color || 'orange').toLowerCase(),
                    msgType: item.msgType || 'Alert',
                  });
                } catch (parseErr) {
                  console.warn('[MAUSAM][SACHET] Failed to parse single alert item:', parseErr);
                }
              }

              this.alertsParsed = warnings.length;
              this.parserStatus = 'OPERATIONAL';
              fetchSuccess = true;
            } else {
              console.warn('[MAUSAM][SACHET] Feed response was not JSON array (possibly HTML block)');
            }
          }
        } catch (err: any) {
          lastErr = err;
          console.warn('[MAUSAM][SACHET] JSON feed attempt error:', err?.message || err);
        }

        // Attempt 2: If JSON feed was not successful, try official RSS feed
        if (!fetchSuccess) {
          try {
            console.log('[MAUSAM][SACHET] Attempting official RSS feed fallback');
            const res = await this.fetchWithCookie('https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml', 8000);
            this.httpStatus = res.status;
            this.endpointStatus = 'REACHABLE';

            if (res.ok) {
              const xml = await res.text();
              console.log(`[MAUSAM][SACHET] RSS response bytes: ${xml.length}`);

              if (xml && xml.includes('<rss')) {
                const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
                this.alertsReceived = items.length;
                console.log(`[MAUSAM][SACHET] RSS discovered ${items.length} items`);

                for (const itemXml of items) {
                  try {
                    const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/);
                    const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
                    const authorMatch = itemXml.match(/<author>([\s\S]*?)<\/author>/);
                    const guidMatch = itemXml.match(/<guid[^>]*>([\s\S]*?)<\/guid>/);
                    const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);

                    const title = titleMatch ? titleMatch[1].trim() : '';
                    const author = authorMatch ? authorMatch[1].trim() : 'NDMA / IMD';
                    const guid = guidMatch ? guidMatch[1].trim() : String(Math.random());
                    const pubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();

                    let sev: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' | 'UNKNOWN' = 'ORANGE';
                    const lower = (title + ' ' + author).toLowerCase();
                    if (lower.includes('red') || lower.includes('heavy to very heavy') || lower.includes('extreme')) {
                      sev = 'RED';
                    } else if (lower.includes('yellow') || lower.includes('light to moderate') || lower.includes('watch')) {
                      sev = 'YELLOW';
                    }

                    warnings.push({
                      id: guid,
                      source: 'NDMA / SACHET',
                      sender: author,
                      event: 'Meteorological Warning',
                      headline: title.slice(0, 120),
                      description: title,
                      instruction: 'Stay updated with local disaster management authorities.',
                      severity: sev,
                      urgency: 'Expected',
                      certainty: 'Likely',
                      areas: [author],
                      issuedAt: pubDate,
                      sourceUrl: linkMatch ? linkMatch[1].trim() : undefined,
                      rawSeverityColor: sev.toLowerCase(),
                    });
                  } catch (itemErr) {
                    console.warn('[MAUSAM][SACHET] Error parsing RSS item:', itemErr);
                  }
                }

                this.alertsParsed = warnings.length;
                this.parserStatus = 'OPERATIONAL';
                fetchSuccess = true;
              }
            }
          } catch (rssErr: any) {
            lastErr = rssErr;
            console.warn('[MAUSAM][SACHET] RSS feed attempt error:', rssErr?.message || rssErr);
          }
        }

        // Evaluation of Success
        if (fetchSuccess) {
          const nowIso = new Date().toISOString();
          this.lastSuccessfulFetchAt = nowIso;
          this.lastSuccessfulParsedAt = nowIso;
          this.fetchStatus = 'SUCCESS';
          this.lastError = null;
          this.activeAlerts = warnings.length;
          this.cachedAlerts = warnings;
          this.lastFetchTime = Date.now();

          console.log(`[MAUSAM][SACHET] Success: ${warnings.length} active alerts normalized`);
          return warnings;
        }

        // If fetch failed, mark telemetry
        this.fetchStatus = 'FAILED';
        this.parserStatus = 'FAILED';
        this.lastError = lastErr?.message || 'SACHET alert feeds temporarily unreachable';
        console.error(`[MAUSAM][SACHET] Failure: ${this.lastError}`);

        // If stale cache exists, return it with STALE status
        if (this.cachedAlerts.length > 0) {
          this.fetchStatus = 'STALE';
          const active = this.cachedAlerts.filter((a) => !this.isExpired(a));
          console.log(`[MAUSAM][SACHET] Serving ${active.length} alerts from stale cache`);
          return active;
        }

        // Provider failure and no cache
        this.endpointStatus = 'UNREACHABLE';
        throw new Error(this.lastError);
      } finally {
        this.inFlightFetch = null;
      }
    })();

    return this.inFlightFetch;
  }

  /**
   * Filter active warnings for a specific location (state, district, city, coordinates).
   * Chandaka is in Khordha district, Odisha state.
   */
  public async getWarningsForLocation(loc: {
    lat?: number;
    lng?: number;
    city?: string;
    district?: string;
    state?: string;
  }): Promise<{
    status: 'SUCCESS' | 'UNAVAILABLE';
    hasActiveWarnings: boolean;
    highestSeverity: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
    matchedWarnings: WeatherWarning[];
    totalNationalActive: number;
    lastAttemptAt: string | null;
    lastSuccessfulFetchAt: string | null;
    lastSuccessfulParsedAt: string | null;
    isCached?: boolean;
    error?: string;
  }> {
    try {
      const all = await this.fetchAllActiveWarnings();
      const matched: WeatherWarning[] = [];

      const targetDistrict = (loc.district || '').trim().toLowerCase();
      const targetCity = (loc.city || '').trim().toLowerCase();
      const targetState = (loc.state || '').trim().toLowerCase();

      // Known district aliases (e.g. Khordha / Khurda)
      const districtAliases: string[] = [];
      if (targetDistrict) districtAliases.push(targetDistrict);
      if (
        targetDistrict.includes('khordha') ||
        targetDistrict.includes('khurda') ||
        targetCity.includes('chandaka') ||
        targetCity.includes('bhubaneswar')
      ) {
        if (!districtAliases.includes('khordha')) districtAliases.push('khordha');
        if (!districtAliases.includes('khurda')) districtAliases.push('khurda');
      }
      if (
        targetDistrict.includes('balasore') ||
        targetDistrict.includes('baleshwar') ||
        targetDistrict.includes('baleswar') ||
        targetCity.includes('balasore') ||
        targetCity.includes('baleswar')
      ) {
        if (!districtAliases.includes('balasore')) districtAliases.push('balasore');
        if (!districtAliases.includes('baleswar')) districtAliases.push('baleswar');
        if (!districtAliases.includes('baleshwar')) districtAliases.push('baleshwar');
      }

      for (const w of all) {
        let isMatch = false;

        // 1. Proximity check via centroid coordinates (within 50 km)
        if (
          loc.lat !== undefined &&
          loc.lng !== undefined &&
          w.latitude !== undefined &&
          w.longitude !== undefined
        ) {
          const distKm = this.calculateDistanceKm(loc.lat, loc.lng, w.latitude, w.longitude);
          if (distKm <= 50) {
            isMatch = true;
          }
        }

        // 2. Specific District or Area match in designated areas (DO NOT match sender!)
        if (!isMatch) {
          const designatedAreas = [...(w.areas || []), ...(w.affectedDistricts || [])].map((a) =>
            a.toLowerCase().trim()
          );

          for (const area of designatedAreas) {
            for (const alias of districtAliases) {
              if (alias.length >= 3 && (area === alias || area.includes(alias) || alias.includes(area))) {
                isMatch = true;
                break;
              }
            }
            if (isMatch) break;

            if (targetCity && targetCity.length >= 4 && (area === targetCity || area.includes(targetCity))) {
              isMatch = true;
              break;
            }
          }
        }

        // 3. Check headline or description specifically targeting the district (strictly excluding sender name!)
        if (!isMatch && districtAliases.length > 0) {
          const textWithoutSender = `${w.headline || ''} ${w.description || ''}`.toLowerCase();
          for (const alias of districtAliases) {
            if (
              alias.length >= 4 &&
              (textWithoutSender.includes(` ${alias}`) ||
                textWithoutSender.includes(`over ${alias}`) ||
                textWithoutSender.includes(`of ${alias}`))
            ) {
              isMatch = true;
              break;
            }
          }
        }

        // 4. State-wide check: ONLY if the alert has NO specific district boundaries and applies state-wide
        if (!isMatch && targetState && targetState.length >= 4) {
          const hasSpecificDistricts =
            (w.areas || []).length > 0 &&
            !(w.areas || []).some((a) => a.toLowerCase() === targetState);
          if (!hasSpecificDistricts) {
            const stateMatches =
              (w.affectedStates || []).some((s) => s.toLowerCase() === targetState) ||
              (w.areas || []).some((a) => a.toLowerCase() === targetState);
            if (stateMatches) {
              isMatch = true;
            }
          }
        }

        if (isMatch) {
          matched.push(w);
        }
      }

      // Determine highest severity
      let highestSeverity: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' = 'GREEN';
      if (matched.some((w) => w.severity === 'RED')) {
        highestSeverity = 'RED';
      } else if (matched.some((w) => w.severity === 'ORANGE')) {
        highestSeverity = 'ORANGE';
      } else if (matched.some((w) => w.severity === 'YELLOW')) {
        highestSeverity = 'YELLOW';
      }

      return {
        status: 'SUCCESS',
        hasActiveWarnings: matched.length > 0,
        highestSeverity,
        matchedWarnings: matched,
        totalNationalActive: all.length,
        lastAttemptAt: this.lastAttemptAt,
        lastSuccessfulFetchAt: this.lastSuccessfulFetchAt,
        lastSuccessfulParsedAt: this.lastSuccessfulParsedAt,
        isCached: this.fetchStatus === 'STALE',
      };
    } catch (err: any) {
      return {
        status: 'UNAVAILABLE',
        hasActiveWarnings: false,
        highestSeverity: 'GREEN',
        matchedWarnings: [],
        totalNationalActive: 0,
        lastAttemptAt: this.lastAttemptAt,
        lastSuccessfulFetchAt: this.lastSuccessfulFetchAt,
        lastSuccessfulParsedAt: this.lastSuccessfulParsedAt,
        error: err?.message || 'SACHET unavailable',
      };
    }
  }

  /**
   * Resolves national warning status for all 28 States and 8 Union Territories.
   */
  public async getNationalRegionWarnings(): Promise<{
    status: 'SUCCESS' | 'UNAVAILABLE';
    timestamp: string;
    lastSuccessfulParsedAt: string | null;
    regions: Array<{
      region: CanonicalRegion;
      status: 'ACTIVE_WARNING' | 'ALL_CLEAR' | 'DATA_UNAVAILABLE';
      severity: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' | 'UNKNOWN';
      activeCount: number;
      warnings: WeatherWarning[];
    }>;
  }> {
    try {
      const allWarnings = await this.fetchAllActiveWarnings();

      const regions = CANONICAL_INDIA_REGIONS.map((reg) => {
        const matchingWarnings: WeatherWarning[] = [];
        const terms = [reg.name.toLowerCase(), ...reg.aliases.map((a) => a.toLowerCase())];

        for (const w of allWarnings) {
          const text = `${w.headline || ''} ${w.description || ''} ${w.sender || ''} ${w.areas.join(' ')}`.toLowerCase();
          const matches = terms.some((t) => text.includes(t));
          if (matches) {
            matchingWarnings.push(w);
          }
        }

        if (matchingWarnings.length > 0) {
          let sev: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' = 'YELLOW';
          if (matchingWarnings.some((w) => w.severity === 'RED')) sev = 'RED';
          else if (matchingWarnings.some((w) => w.severity === 'ORANGE')) sev = 'ORANGE';

          return {
            region: reg,
            status: 'ACTIVE_WARNING' as const,
            severity: sev,
            activeCount: matchingWarnings.length,
            warnings: matchingWarnings,
          };
        }

        return {
          region: reg,
          status: 'ALL_CLEAR' as const,
          severity: 'GREEN' as const,
          activeCount: 0,
          warnings: [],
        };
      });

      return {
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
        lastSuccessfulParsedAt: this.lastSuccessfulParsedAt,
        regions,
      };
    } catch {
      const regions = CANONICAL_INDIA_REGIONS.map((reg) => ({
        region: reg,
        status: 'DATA_UNAVAILABLE' as const,
        severity: 'UNKNOWN' as const,
        activeCount: 0,
        warnings: [],
      }));

      return {
        status: 'UNAVAILABLE',
        timestamp: new Date().toISOString(),
        lastSuccessfulParsedAt: this.lastSuccessfulParsedAt,
        regions,
      };
    }
  }

  /**
   * Return deep diagnostics for system health reporting.
   */
  public getDiagnostics(): SachetDiagnostics {
    const now = Date.now();
    let dataAgeSeconds: number | null = null;
    if (this.lastSuccessfulParsedAt) {
      const parsedMs = Date.parse(this.lastSuccessfulParsedAt);
      if (!isNaN(parsedMs)) {
        dataAgeSeconds = Math.max(0, Math.round((now - parsedMs) / 1000));
      }
    }

    return {
      provider: 'SACHET/NDMA',
      endpointStatus: this.endpointStatus,
      fetchStatus: this.fetchStatus,
      httpStatus: this.httpStatus,
      parserStatus: this.parserStatus,
      alertsReceived: this.alertsReceived,
      alertsParsed: this.alertsParsed,
      activeAlerts: this.activeAlerts,
      lastAttemptAt: this.lastAttemptAt,
      lastSuccessfulFetchAt: this.lastSuccessfulFetchAt,
      lastSuccessfulParsedAt: this.lastSuccessfulParsedAt,
      dataAgeSeconds,
      error: this.lastError,
    };
  }

  private calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

export const sachetService = SachetService.getInstance();

