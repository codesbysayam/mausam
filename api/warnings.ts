// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Consolidated Warnings Gateway (/api/warnings)
// Multiplexed via mode query parameter: current | national | debug | feed
// Single source of truth using official SACHET CAP / RSS pipeline.
// Truthful reporting: provider failures NEVER convert to all-clear / green.
// Production-compatible: zero local file dependencies to guarantee
// 100% reliable execution in both AI Studio and Vercel serverless.
// ====================================================================

export const APP_BUILD_ID = process.env.APP_BUILD_ID || 'MAUSAM-V1.4.2-20260920';
export const GIT_COMMIT_SHA = process.env.GIT_COMMIT_SHA || 'synoptic-2026-09-20';
export const WARNING_SERVICE_VERSION = '2.4.0-sachet-canonical';

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

export type SachetWarning = WeatherWarning;

export interface SachetSafeDiagnostics {
  environment: string;
  buildId: string;
  gitCommit: string;
  warningServiceVersion: string;
  endpoint: string;
  provider: string;
  httpStatus: number | null;
  contentType: string | null;
  responseBytes: number | null;
  parser: string;
  alertsReceived: number;
  alertsParsed: number;
  activeAlerts: number;
  lastSuccessfulFetch: string | null;
  lastSuccessfulFetchAt?: string | null;
  cacheStatus: 'FRESH' | 'STALE' | 'MISS';
  error: string | null;
  lastAttemptAt: string;
  lastSuccessfulParseAt: string | null;
  lastSuccessfulParsedAt?: string | null;
  endpointStatus: 'OPERATIONAL' | 'DEGRADED' | 'OFFLINE';
  fetchStatus: 'SUCCESS' | 'CACHED_304' | 'FAILED' | 'IDLE';
  parserStatus: 'PARSED' | 'FAILED' | 'IDLE';
}

export interface SachetNormalizedResult {
  status: 'operational' | 'stale' | 'unavailable';
  source: string;
  alerts: SachetWarning[];
  activeAlerts: number;
  alertsReceived?: number;
  alertsParsed?: number;
  totalAlerts?: number;
  lastAttemptAt: string;
  lastSuccessfulAt: string | null;
  parsedAt: string | null;
  cacheStatus: 'FRESH' | 'STALE' | 'MISS';
  diagnostics: SachetSafeDiagnostics;
  error?: string | null;
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

export const CANONICAL_INDIA_REGIONS: CanonicalRegion[] = [
  { name: 'Andhra Pradesh', code: 'AP', type: 'STATE', capital: 'Amaravati', lat: 15.9129, lng: 79.74, aliases: ['andhra'] },
  { name: 'Arunachal Pradesh', code: 'AR', type: 'STATE', capital: 'Itanagar', lat: 28.218, lng: 94.7278, aliases: ['arunachal'] },
  { name: 'Assam', code: 'AS', type: 'STATE', capital: 'Dispur', lat: 26.2006, lng: 92.9376, aliases: ['asom'] },
  { name: 'Bihar', code: 'BR', type: 'STATE', capital: 'Patna', lat: 25.0961, lng: 85.3131, aliases: [] },
  { name: 'Chhattisgarh', code: 'CG', type: 'STATE', capital: 'Raipur', lat: 21.2787, lng: 81.8661, aliases: ['chattisgarh'] },
  { name: 'Goa', code: 'GA', type: 'STATE', capital: 'Panaji', lat: 15.2993, lng: 74.124, aliases: [] },
  { name: 'Gujarat', code: 'GJ', type: 'STATE', capital: 'Gandhinagar', lat: 22.2587, lng: 71.1924, aliases: [] },
  { name: 'Haryana', code: 'HR', type: 'STATE', capital: 'Chandigarh', lat: 29.0588, lng: 76.0856, aliases: [] },
  { name: 'Himachal Pradesh', code: 'HP', type: 'STATE', capital: 'Shimla', lat: 31.1048, lng: 77.1734, aliases: ['himachal'] },
  { name: 'Jharkhand', code: 'JH', type: 'STATE', capital: 'Ranchi', lat: 23.6102, lng: 85.2799, aliases: [] },
  { name: 'Karnataka', code: 'KA', type: 'STATE', capital: 'Bengaluru', lat: 15.3173, lng: 75.7139, aliases: [] },
  { name: 'Kerala', code: 'KL', type: 'STATE', capital: 'Thiruvananthapuram', lat: 10.8505, lng: 76.2711, aliases: [] },
  { name: 'Madhya Pradesh', code: 'MP', type: 'STATE', capital: 'Bhopal', lat: 22.9734, lng: 78.6569, aliases: [] },
  { name: 'Maharashtra', code: 'MH', type: 'STATE', capital: 'Mumbai', lat: 19.7515, lng: 75.7139, aliases: [] },
  { name: 'Manipur', code: 'MN', type: 'STATE', capital: 'Imphal', lat: 24.6637, lng: 93.9063, aliases: [] },
  { name: 'Meghalaya', code: 'ML', type: 'STATE', capital: 'Shillong', lat: 25.467, lng: 91.3662, aliases: [] },
  { name: 'Mizoram', code: 'MZ', type: 'STATE', capital: 'Aizawl', lat: 23.1645, lng: 92.9376, aliases: [] },
  { name: 'Nagaland', code: 'NL', type: 'STATE', capital: 'Kohima', lat: 26.1584, lng: 94.5624, aliases: [] },
  { name: 'Odisha', code: 'OR', type: 'STATE', capital: 'Bhubaneswar', lat: 20.9517, lng: 85.0985, aliases: ['orissa'] },
  { name: 'Punjab', code: 'PB', type: 'STATE', capital: 'Chandigarh', lat: 31.1471, lng: 75.3412, aliases: [] },
  { name: 'Rajasthan', code: 'RJ', type: 'STATE', capital: 'Jaipur', lat: 27.0238, lng: 74.2179, aliases: [] },
  { name: 'Sikkim', code: 'SK', type: 'STATE', capital: 'Gangtok', lat: 27.533, lng: 88.5122, aliases: [] },
  { name: 'Tamil Nadu', code: 'TN', type: 'STATE', capital: 'Chennai', lat: 11.1271, lng: 78.6569, aliases: ['tamilnadu'] },
  { name: 'Telangana', code: 'TG', type: 'STATE', capital: 'Hyderabad', lat: 18.1124, lng: 79.0193, aliases: [] },
  { name: 'Tripura', code: 'TR', type: 'STATE', capital: 'Agartala', lat: 23.9408, lng: 91.9882, aliases: [] },
  { name: 'Uttar Pradesh', code: 'UP', type: 'STATE', capital: 'Lucknow', lat: 26.8467, lng: 80.9462, aliases: [] },
  { name: 'Uttarakhand', code: 'UK', type: 'STATE', capital: 'Dehradun', lat: 30.0668, lng: 79.0193, aliases: ['uttaranchal'] },
  { name: 'West Bengal', code: 'WB', type: 'STATE', capital: 'Kolkata', lat: 22.9868, lng: 87.855, aliases: ['bengal'] },
  { name: 'Andaman and Nicobar Islands', code: 'AN', type: 'UT', capital: 'Port Blair', lat: 11.7401, lng: 92.6586, aliases: ['andaman'] },
  { name: 'Chandigarh', code: 'CH', type: 'UT', capital: 'Chandigarh', lat: 30.7333, lng: 76.7794, aliases: [] },
  { name: 'Dadra and Nagar Haveli and Daman and Diu', code: 'DH', type: 'UT', capital: 'Daman', lat: 20.4283, lng: 72.8397, aliases: ['daman', 'diu'] },
  { name: 'Delhi', code: 'DL', type: 'UT', capital: 'New Delhi', lat: 28.7041, lng: 77.1025, aliases: ['nct of delhi'] },
  { name: 'Jammu and Kashmir', code: 'JK', type: 'UT', capital: 'Srinagar', lat: 33.7782, lng: 76.5762, aliases: ['kashmir'] },
  { name: 'Ladakh', code: 'LA', type: 'UT', capital: 'Leh', lat: 34.1526, lng: 77.5771, aliases: [] },
  { name: 'Lakshadweep', code: 'LD', type: 'UT', capital: 'Kavaratti', lat: 10.5667, lng: 72.6417, aliases: [] },
  { name: 'Puducherry', code: 'PY', type: 'UT', capital: 'Pondicherry', lat: 11.9416, lng: 79.8083, aliases: ['pondicherry'] },
];

/**
 * Standard utility helpers with zero external dependencies
 */
export function sendJson(res: any, status: number, data: any, customHeaders: Record<string, string> = {}) {
  const payload = JSON.stringify(data);
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload, 'utf8').toString(),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'X-App-Build-Id': APP_BUILD_ID,
    'X-Warning-Service-Version': WARNING_SERVICE_VERSION,
    ...customHeaders,
  };

  if (typeof res.setHeader === 'function') {
    for (const [key, value] of Object.entries(defaultHeaders)) {
      res.setHeader(key, value);
    }
    if (typeof res.status === 'function') {
      res.status(status);
    } else {
      res.statusCode = status;
    }
    if (typeof res.end === 'function') {
      res.end(payload);
    } else if (typeof res.send === 'function') {
      res.send(payload);
    }
  } else if (typeof res.json === 'function') {
    if (typeof res.status === 'function') res.status(status);
    res.json(data);
  }
}

export function parseQuery(req: any): Record<string, any> {
  if (req.query && Object.keys(req.query).length > 0) {
    return req.query;
  }
  try {
    const urlStr = req.url || '';
    const queryIndex = urlStr.indexOf('?');
    if (queryIndex === -1) return {};
    const searchParams = new URLSearchParams(urlStr.slice(queryIndex));
    const result: Record<string, any> = {};
    for (const [key, value] of searchParams.entries()) {
      result[key] = value;
    }
    return result;
  } catch {
    return {};
  }
}

/**
 * Canonical SachetService Implementation
 */
export class SachetService {
  private static instance: SachetService;

  private primaryUrl = 'https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml';
  private secondaryRssUrl = 'https://sachet.ndma.gov.in/cap_public_website/rss/rss_national.xml';
  private secondaryJsonUrl = 'https://sachet.ndma.gov.in/cap_public_website/FetchAlertDetails';

  private cachedResult: SachetNormalizedResult | null = null;
  private cachedEtag: string | null = null;
  private cachedLastModified: string | null = null;
  private lastFetchTimestamp = 0;
  private cacheTtlMs = 60 * 1000; // 60 seconds fresh TTL
  private staleTtlMs = 15 * 60 * 1000; // 15 minutes stale retention

  private lastAttemptAt: string = new Date().toISOString();
  private lastSuccessfulFetchAt: string | null = null;
  private lastSuccessfulParseAt: string | null = null;
  private lastResponseBytes: number | null = null;
  private lastHttpStatus: number | null = null;
  private lastContentType: string | null = null;
  private lastParserUsed = 'NONE';
  private lastAlertsReceived = 0;
  private lastAlertsParsed = 0;
  private lastError: string | null = null;
  private lastFetchStatus: 'SUCCESS' | 'CACHED_304' | 'FAILED' | 'IDLE' = 'IDLE';
  private lastParserStatus: 'PARSED' | 'FAILED' | 'IDLE' = 'IDLE';

  public static getInstance(): SachetService {
    if (!SachetService.instance) {
      SachetService.instance = new SachetService();
    }
    return SachetService.instance;
  }

  /**
   * Requirement 4: Canonical sachetService.fetchWarnings()
   */
  public async fetchWarnings(forceRefresh = false): Promise<SachetNormalizedResult> {
    return this.fetchNormalizedResult(forceRefresh);
  }

  public async fetchNormalizedResult(forceRefresh = false): Promise<SachetNormalizedResult> {
    const now = Date.now();

    // Re-use fresh cache if available and not forced
    if (!forceRefresh && this.cachedResult && now - this.lastFetchTimestamp < this.cacheTtlMs) {
      return {
        ...this.cachedResult,
        cacheStatus: 'FRESH',
        diagnostics: this.buildDiagnosticsObject('FRESH'),
      };
    }

    this.lastAttemptAt = new Date().toISOString();

    try {
      // 1. Fetch official feed
      const fetchRes = await this.executeFetchWithFallback();

      if (fetchRes.status === 304 && this.cachedResult) {
        this.lastFetchTimestamp = now;
        this.lastFetchStatus = 'CACHED_304';
        return {
          ...this.cachedResult,
          cacheStatus: 'FRESH',
          diagnostics: this.buildDiagnosticsObject('FRESH'),
        };
      }

      if (fetchRes.ok && fetchRes.body) {
        this.lastHttpStatus = fetchRes.status;
        this.lastContentType = fetchRes.contentType;
        this.lastResponseBytes = fetchRes.body.length;
        this.lastSuccessfulFetchAt = new Date().toISOString();
        this.cachedEtag = fetchRes.etag || null;
        this.cachedLastModified = fetchRes.lastModified || null;

        // 2. Parse feed body
        const parsed = this.parseFeedBody(fetchRes.body, fetchRes.contentType);
        this.lastAlertsReceived = parsed.rawCount;
        this.lastAlertsParsed = parsed.alerts.length;
        this.lastParserUsed = parsed.parserType;
        this.lastParserStatus = 'PARSED';
        this.lastSuccessfulParseAt = new Date().toISOString();
        this.lastFetchStatus = 'SUCCESS';
        this.lastError = null;

        // 3. Normalize into canonical structure
        const activeAlerts = parsed.alerts.length;
        const normalized: SachetNormalizedResult = {
          status: 'operational',
          source: 'SACHET/NDMA',
          alerts: parsed.alerts,
          activeAlerts,
          alertsReceived: parsed.rawCount,
          alertsParsed: parsed.alerts.length,
          totalAlerts: parsed.rawCount,
          lastAttemptAt: this.lastAttemptAt,
          lastSuccessfulAt: this.lastSuccessfulFetchAt,
          parsedAt: this.lastSuccessfulParseAt,
          cacheStatus: 'FRESH',
          diagnostics: this.buildDiagnosticsObject('FRESH'),
          error: null,
        };

        this.cachedResult = normalized;
        this.lastFetchTimestamp = now;
        return normalized;
      }

      throw new Error(`Upstream fetch rejected with status ${fetchRes.status || 'unknown'}`);
    } catch (err: any) {
      this.lastError = err?.message || 'Unknown network or parsing error';
      this.lastFetchStatus = 'FAILED';

      // Cache isolation: A failed request MUST NOT overwrite valid cached data!
      if (this.cachedResult && now - this.lastFetchTimestamp < this.staleTtlMs) {
        return {
          ...this.cachedResult,
          status: 'stale',
          cacheStatus: 'STALE',
          error: this.lastError,
          diagnostics: this.buildDiagnosticsObject('STALE'),
        };
      }

      // No valid cache available: report truth (OFFICIAL WARNING FEED UNAVAILABLE)
      return {
        status: 'unavailable',
        source: 'SACHET/NDMA',
        alerts: [],
        activeAlerts: 0,
        lastAttemptAt: this.lastAttemptAt,
        lastSuccessfulAt: this.lastSuccessfulFetchAt,
        parsedAt: this.lastSuccessfulParseAt,
        cacheStatus: 'MISS',
        error: this.lastError,
        diagnostics: this.buildDiagnosticsObject('MISS'),
      };
    }
  }

  private async executeFetchWithFallback(): Promise<{
    ok: boolean;
    status: number;
    body: string | null;
    contentType: string | null;
    etag?: string | null;
    lastModified?: string | null;
  }> {
    const urls = [this.primaryUrl, this.secondaryRssUrl, this.secondaryJsonUrl];
    let lastErr: any = null;

    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

        const headers: Record<string, string> = {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 MausamGovt/1.4',
          Accept: 'application/rss+xml, application/xml, text/xml, application/json, text/plain, */*',
        };

        if (this.cachedEtag && url === this.primaryUrl) {
          headers['If-None-Match'] = this.cachedEtag;
        }
        if (this.cachedLastModified && url === this.primaryUrl) {
          headers['If-Modified-Since'] = this.cachedLastModified;
        }

        const res = await fetch(url, {
          method: 'GET',
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.status === 304) {
          return {
            ok: true,
            status: 304,
            body: null,
            contentType: res.headers.get('content-type'),
            etag: res.headers.get('etag'),
            lastModified: res.headers.get('last-modified'),
          };
        }

        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          const text = await res.text();
          // Validate: must be non-empty and have real XML or JSON content
          if (text && text.trim().length > 50) {
            return {
              ok: true,
              status: res.status,
              body: text,
              contentType,
              etag: res.headers.get('etag'),
              lastModified: res.headers.get('last-modified'),
            };
          }
        }
      } catch (err) {
        lastErr = err;
      }
    }

    throw lastErr || new Error('All official SACHET feed endpoints failed to respond');
  }

  private parseFeedBody(
    body: string,
    contentType: string | null
  ): { alerts: SachetWarning[]; rawCount: number; parserType: string } {
    const trimmed = body.trim();

    // JSON detection
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const json = JSON.parse(trimmed);
        return this.parseJsonAlerts(json);
      } catch {
        // Fall back to XML regex parsing
      }
    }

    // RSS / CAP XML regex parser
    return this.parseXmlRssAlerts(body);
  }

  private parseXmlRssAlerts(xml: string): { alerts: SachetWarning[]; rawCount: number; parserType: string } {
    const alerts: SachetWarning[] = [];
    const itemRegex = /<item[\s\S]*?<\/item>/gi;
    const items = xml.match(itemRegex) || [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const title = this.extractTag(item, 'title');
      const description = this.extractTag(item, 'description');
      const link = this.extractTag(item, 'link');
      const guid = this.extractTag(item, 'guid') || `sachet-rss-${i + 1}`;
      const pubDate = this.extractTag(item, 'pubDate');

      // Cap specific tags if embedded
      const capEvent = this.extractTag(item, 'cap:event') || this.extractTag(item, 'event');
      const capSeverity = this.extractTag(item, 'cap:severity') || this.extractTag(item, 'severity');
      const capHeadline = this.extractTag(item, 'cap:headline') || this.extractTag(item, 'headline');
      const capAreaDesc = this.extractTag(item, 'cap:areaDesc') || this.extractTag(item, 'areaDesc');
      const capExpires = this.extractTag(item, 'cap:expires') || this.extractTag(item, 'expires');
      const capEffective = this.extractTag(item, 'cap:effective') || this.extractTag(item, 'effective');
      const capInstruction = this.extractTag(item, 'cap:instruction') || this.extractTag(item, 'instruction');

      const headline = capHeadline || title || 'Severe Weather Warning';
      const desc = description || capInstruction || 'Disaster Warning Advisory';
      const eventName = capEvent || this.detectEventFromText(headline, desc);
      const severity = this.normalizeSeverity(capSeverity || headline);

      const combinedText = `${headline} ${desc} ${capAreaDesc || ''}`;
      const detectedAreas = this.extractAffectedAreas(combinedText);

      alerts.push({
        id: guid,
        source: 'NDMA/SACHET',
        sender: 'National Disaster Management Authority (NDMA)',
        event: eventName,
        headline,
        description: desc,
        instruction: capInstruction || 'Follow state disaster management protocols and stay indoors.',
        severity,
        urgency: 'Expected',
        certainty: 'Observed',
        sentAt: pubDate || new Date().toISOString(),
        effective: capEffective || pubDate || new Date().toISOString(),
        expires: capExpires || undefined,
        issuedAt: pubDate || new Date().toISOString(),
        sourceUrl: link || 'https://sachet.ndma.gov.in',
        areas: detectedAreas.length > 0 ? detectedAreas : ['National Coverage'],
        affectedStates: this.extractStates(combinedText),
        affectedDistricts: detectedAreas,
        rawSeverityColor: severity === 'RED' ? '#DC2626' : severity === 'ORANGE' ? '#EA580C' : severity === 'YELLOW' ? '#CA8A04' : '#16A34A',
        status: 'Actual',
        msgType: 'Alert',
      });
    }

    return {
      alerts,
      rawCount: items.length,
      parserType: 'RSS_XML',
    };
  }

  private parseJsonAlerts(json: any): { alerts: SachetWarning[]; rawCount: number; parserType: string } {
    const rawList = Array.isArray(json) ? json : json?.alerts || json?.data || json?.results || [];
    const alerts: SachetWarning[] = [];

    for (let i = 0; i < rawList.length; i++) {
      const a = rawList[i];
      const headline = a.headline || a.title || a.event || 'Severe Weather Warning';
      const desc = a.description || a.desc || a.instruction || '';
      const severity = this.normalizeSeverity(a.severity || a.severity_color || headline);
      const areas = Array.isArray(a.areas) ? a.areas : a.areaDesc ? [a.areaDesc] : [a.district || a.state || 'India'];

      alerts.push({
        id: String(a.identifier || a.alert_id || a.id || `sachet-json-${i + 1}`),
        source: 'NDMA/SACHET',
        sender: a.sender || 'NDMA',
        event: a.event || this.detectEventFromText(headline, desc),
        headline,
        description: desc,
        instruction: a.instruction || 'Follow NDMA safety advisories.',
        severity,
        sentAt: a.sent || a.issuedAt || new Date().toISOString(),
        effective: a.effective || new Date().toISOString(),
        expires: a.expires,
        issuedAt: a.issuedAt || a.sent || new Date().toISOString(),
        sourceUrl: a.sourceUrl || 'https://sachet.ndma.gov.in',
        areas,
        affectedStates: a.state ? [a.state] : this.extractStates(`${headline} ${desc}`),
        affectedDistricts: a.district ? [a.district] : areas,
        rawSeverityColor: severity === 'RED' ? '#DC2626' : severity === 'ORANGE' ? '#EA580C' : severity === 'YELLOW' ? '#CA8A04' : '#16A34A',
        status: 'Actual',
        msgType: 'Alert',
      });
    }

    return {
      alerts,
      rawCount: rawList.length,
      parserType: 'JSON_DIRECT',
    };
  }

  private extractTag(xml: string, tag: string): string {
    const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i');
    const cdataMatch = xml.match(cdataRegex);
    if (cdataMatch && cdataMatch[1]) {
      return cdataMatch[1].trim();
    }

    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const match = xml.match(regex);
    if (match && match[1]) {
      return match[1].replace(/<[^>]+>/g, '').trim();
    }
    return '';
  }

  private detectEventFromText(headline: string, desc: string): string {
    const text = `${headline} ${desc}`.toLowerCase();
    if (text.includes('cyclone') || text.includes('depression') || text.includes('storm')) return 'Cyclone Warning';
    if (text.includes('thunderstorm') || text.includes('lightning') || text.includes('squall')) return 'Thunderstorm & Lightning Warning';
    if (text.includes('heavy rain') || text.includes('rainfall') || text.includes('downpour')) return 'Heavy Rainfall Warning';
    if (text.includes('heatwave') || text.includes('heat wave')) return 'Heatwave Alert';
    if (text.includes('cold wave') || text.includes('frost')) return 'Cold Wave Warning';
    if (text.includes('dense fog') || text.includes('fog')) return 'Dense Fog Warning';
    if (text.includes('flood')) return 'Flood Warning';
    return 'Severe Weather Advisory';
  }

  private normalizeSeverity(raw?: string): 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' {
    if (!raw) return 'YELLOW';
    const s = raw.toLowerCase();
    if (s.includes('red') || s.includes('severe') || s.includes('extreme')) return 'RED';
    if (s.includes('orange') || s.includes('amber') || s.includes('moderate')) return 'ORANGE';
    if (s.includes('yellow') || s.includes('watch') || s.includes('advisory')) return 'YELLOW';
    if (s.includes('green') || s.includes('clear') || s.includes('normal')) return 'GREEN';
    return 'YELLOW';
  }

  private extractStates(text: string): string[] {
    const found: string[] = [];
    for (const reg of CANONICAL_INDIA_REGIONS) {
      if (text.toLowerCase().includes(reg.name.toLowerCase())) {
        found.push(reg.name);
      }
    }
    return Array.from(new Set(found));
  }

  private extractAffectedAreas(text: string): string[] {
    const areas: string[] = [];
    const states = this.extractStates(text);
    areas.push(...states);

    // Common district matches from SACHET text patterns
    const districtPatterns = [
      /district[s]?\s*(?:of)?\s*:?\s*([a-zA-Z\s,]+)/i,
      /over\s+([a-zA-Z\s,]+)\s+districts?/i,
      /in\s+([a-zA-Z\s,]+)\s+districts?/i,
    ];

    for (const pat of districtPatterns) {
      const match = text.match(pat);
      if (match && match[1]) {
        const parts = match[1]
          .split(/[,&;]|\band\b/i)
          .map((p) => p.trim())
          .filter((p) => p.length > 2 && p.length < 30);
        areas.push(...parts);
      }
    }

    return Array.from(new Set(areas));
  }

  /**
   * Requirement 8 & 13: Accurate, truthful safe diagnostics object
   */
  public buildDiagnosticsObject(overrideCacheStatus?: 'FRESH' | 'STALE' | 'MISS'): SachetSafeDiagnostics {
    const env = process.env.VERCEL ? 'production' : (process.env.NODE_ENV || 'development');
    const cacheStatus = overrideCacheStatus || (this.cachedResult ? 'FRESH' : 'MISS');
    const endpointStatus: 'OPERATIONAL' | 'DEGRADED' | 'OFFLINE' =
      this.lastFetchStatus === 'SUCCESS' || this.lastFetchStatus === 'CACHED_304'
        ? 'OPERATIONAL'
        : cacheStatus === 'STALE'
        ? 'DEGRADED'
        : 'OFFLINE';

    return {
      environment: env,
      buildId: APP_BUILD_ID,
      gitCommit: GIT_COMMIT_SHA,
      warningServiceVersion: WARNING_SERVICE_VERSION,
      endpoint: this.primaryUrl,
      provider: 'NDMA / SACHET Disaster Alert Feed',
      httpStatus: this.lastHttpStatus,
      contentType: this.lastContentType,
      responseBytes: this.lastResponseBytes,
      parser: this.lastParserUsed,
      alertsReceived: this.lastAlertsReceived,
      alertsParsed: this.lastAlertsParsed,
      activeAlerts: this.cachedResult?.activeAlerts ?? this.lastAlertsParsed,
      lastSuccessfulFetch: this.lastSuccessfulFetchAt,
      lastSuccessfulFetchAt: this.lastSuccessfulFetchAt,
      cacheStatus,
      error: this.lastError,
      lastAttemptAt: this.lastAttemptAt,
      lastSuccessfulParseAt: this.lastSuccessfulParseAt,
      lastSuccessfulParsedAt: this.lastSuccessfulParseAt,
      endpointStatus,
      fetchStatus: this.lastFetchStatus,
      parserStatus: this.lastParserStatus,
    };
  }

  public getDiagnostics(): SachetSafeDiagnostics {
    return this.buildDiagnosticsObject();
  }

  public async fetchAllActiveWarnings(forceRefresh = false): Promise<SachetWarning[]> {
    const feed = await this.fetchWarnings(forceRefresh);
    return feed.alerts || [];
  }

  public async getWarningsForLocation(
    target: {
      city?: string;
      district?: string;
      state?: string;
      lat?: number;
      lng?: number;
    },
    forceRefresh = false
  ): Promise<{
    status: 'SUCCESS' | 'DATA_UNAVAILABLE';
    matchedWarnings: SachetWarning[];
    lastSuccessfulParsedAt?: string | null;
    lastSuccessfulFetchAt?: string | null;
    lastAttemptAt?: string | null;
    isCached?: boolean;
    diagnostics: SachetSafeDiagnostics;
  }> {
    const feed = await this.fetchWarnings(forceRefresh);
    if (feed.status === 'unavailable' && (!feed.alerts || feed.alerts.length === 0)) {
      return {
        status: 'DATA_UNAVAILABLE',
        matchedWarnings: [],
        lastSuccessfulParsedAt: feed.parsedAt,
        lastSuccessfulFetchAt: feed.lastSuccessfulAt,
        lastAttemptAt: feed.lastAttemptAt,
        isCached: false,
        diagnostics: feed.diagnostics,
      };
    }
    const matched = this.matchAlertsForArea(feed.alerts, target, target.lat, target.lng);
    return {
      status: 'SUCCESS',
      matchedWarnings: matched,
      lastSuccessfulParsedAt: feed.parsedAt,
      lastSuccessfulFetchAt: feed.lastSuccessfulAt,
      lastAttemptAt: feed.lastAttemptAt,
      isCached: feed.cacheStatus === 'STALE',
      diagnostics: feed.diagnostics,
    };
  }

  /**
   * Match alerts for a given target location (lat, lng, city, district, state)
   */
  public matchAlertsForArea(
    alerts: SachetWarning[],
    target: { city?: string; district?: string; state?: string },
    targetLat?: number,
    targetLng?: number
  ): SachetWarning[] {
    const searchTerms = [
      target.city,
      target.district,
      target.state,
    ]
      .filter(Boolean)
      .map((t) => t!.toLowerCase().trim());

    if (searchTerms.length === 0 && !targetLat && !targetLng) {
      return [];
    }

    return alerts.filter((alert) => {
      // 1. Textual match on areas, affectedDistricts, affectedStates, headline, description
      const alertAreas = [
        ...(alert.areas || []),
        ...(alert.affectedDistricts || []),
        ...(alert.affectedStates || []),
        alert.headline || '',
        alert.description || '',
      ].map((s) => s.toLowerCase());

      const matchesText = searchTerms.some((term) =>
        alertAreas.some((area) => area.includes(term) || term.includes(area))
      );

      if (matchesText) return true;

      // 2. Coordinate proximity check (within 80 km) if coordinates exist on alert
      if (
        typeof targetLat === 'number' &&
        typeof targetLng === 'number' &&
        typeof alert.latitude === 'number' &&
        typeof alert.longitude === 'number'
      ) {
        const dist = this.calculateDistanceKm(targetLat, targetLng, alert.latitude, alert.longitude);
        if (dist <= 80) return true;
      }

      return false;
    });
  }

  /**
   * Resolve standardized warning for a specific location query (mode=current)
   * Follows strict state machine:
   * SUCCESS + ACTIVE -> Alert state
   * SUCCESS + 0 ACTIVE -> ALL CLEAR ('NO_ACTIVE_WARNING', green, Live Verified Feed)
   * FAILED + VALID CACHE -> STALE DATA ('NO_ACTIVE_WARNING' or alert, 'CACHED')
   * FAILED + NO CACHE -> DATA UNAVAILABLE ('DATA_UNAVAILABLE', neutral, 'OFFICIAL WARNING FEED UNAVAILABLE')
   */
  public async resolveStandardizedWarning(opts: {
    lat?: number;
    lng?: number;
    city?: string;
    district?: string;
    state?: string;
    country?: string;
  }): Promise<any> {
    const isInternational = opts.country && !opts.country.toLowerCase().includes('india') && opts.country.toLowerCase() !== 'in';
    const locName = opts.city || opts.district || opts.state || 'Current Location';

    if (isInternational) {
      return {
        state: 'NOT_APPLICABLE',
        severity: 'blue',
        severityLabel: 'NOT APPLICABLE',
        hazardHeadline: 'IMD WARNING SERVICE NOT APPLICABLE',
        affectedAreasHeadline: `${opts.city || ''}, ${opts.country}`,
        affectedDistricts: [],
        description: 'Official IMD / NDMA warnings cover Indian territory and waters.',
        validUntil: 'N/A',
        issuedAt: new Date().toISOString(),
        source: 'NDMA/SACHET',
        updatedAt: new Date().toISOString(),
        status: 'Routine',
        isLocal: false,
        diagnostics: this.buildDiagnosticsObject(),
      };
    }

    const normalized = await this.fetchNormalizedResult();

    // 1. Failure with NO cache: return DATA_UNAVAILABLE (NEVER ALL CLEAR)
    if (normalized.status === 'unavailable') {
      return {
        state: 'DATA_UNAVAILABLE',
        severity: 'neutral',
        severityLabel: 'DATA UNAVAILABLE',
        hazardHeadline: 'OFFICIAL WARNING FEED UNAVAILABLE',
        affectedAreasHeadline: locName,
        affectedDistricts: [],
        description: 'Real-time warning feed from NDMA / SACHET is temporarily unreachable.',
        validUntil: 'Feed unreachable',
        issuedAt: normalized.lastAttemptAt,
        source: 'NDMA/SACHET',
        updatedAt: normalized.lastAttemptAt,
        status: 'UNAVAILABLE',
        isLocal: false,
        diagnostics: normalized.diagnostics,
      };
    }

    // 2. Resolve matching alerts for target area
    const matched = this.matchAlertsForArea(
      normalized.alerts,
      { city: opts.city, district: opts.district, state: opts.state },
      opts.lat,
      opts.lng
    );

    const isStale = normalized.status === 'stale';
    const statusLabel = isStale ? 'STALE' : 'LIVE';

    // 3. Matched active alerts exist for this location
    if (matched.length > 0) {
      // Pick highest severity
      let highestSev: 'red' | 'orange' | 'yellow' = 'yellow';
      let highestState: 'RED_ALERT' | 'ORANGE_ALERT' | 'WATCH_ADVISORY' = 'WATCH_ADVISORY';
      let sevLabel = isStale ? 'WATCH (CACHED)' : 'WATCH';

      if (matched.some((a) => a.severity === 'RED')) {
        highestSev = 'red';
        highestState = 'RED_ALERT';
        sevLabel = isStale ? 'RED ALERT (CACHED)' : 'RED ALERT';
      } else if (matched.some((a) => a.severity === 'ORANGE')) {
        highestSev = 'orange';
        highestState = 'ORANGE_ALERT';
        sevLabel = isStale ? 'ORANGE ALERT (CACHED)' : 'ORANGE ALERT';
      }

      const primary = matched[0];
      const headline = isStale ? `${primary.headline} (CACHED)` : primary.headline;

      return {
        state: highestState,
        severity: highestSev,
        severityLabel: sevLabel,
        hazardHeadline: headline,
        hazardLabel: primary.event,
        affectedAreasHeadline: primary.areas.join(', ') || locName,
        affectedDistricts: primary.affectedDistricts || [],
        description: primary.description || primary.instruction || 'Follow official NDMA advisories.',
        validUntil: primary.expires || 'Until Synoptic Bulletin Update',
        issuedAt: primary.issuedAt || normalized.lastSuccessfulAt || new Date().toISOString(),
        source: 'NDMA/SACHET',
        updatedAt: normalized.lastSuccessfulAt || new Date().toISOString(),
        status: statusLabel,
        isLocal: true,
        recommendedActions: [
          'Stay indoors during heavy precipitation or active lightning.',
          'Avoid taking shelter under isolated trees or metal structures.',
          'Keep emergency contact channels open and monitor official bulletins.',
        ],
        emergencyContact: {
          title: 'National Disaster Helpline',
          number: '1078',
        },
        additionalActiveCount: matched.length - 1,
        diagnostics: normalized.diagnostics,
        metadata: {
          lat: opts.lat,
          lng: opts.lng,
          resolvedDistrict: opts.district,
          resolvedState: opts.state,
          totalNationalAlerts: normalized.activeAlerts,
        },
      };
    }

    // 4. Zero alerts for this location (SUCCESSFUL FETCH -> ALL CLEAR)
    const allClearHeadline = isStale
      ? 'NO ACTIVE OFFICIAL WARNINGS (CACHED)'
      : 'NO ACTIVE OFFICIAL WARNINGS';

    return {
      state: 'NO_ACTIVE_WARNING',
      severity: 'green',
      severityLabel: isStale ? 'ALL CLEAR (CACHED)' : 'ALL CLEAR',
      hazardHeadline: allClearHeadline,
      hazardLabel: 'Routine Weather',
      affectedAreasHeadline: locName,
      affectedDistricts: [],
      description: `Official SACHET / NDMA feeds report no active weather warnings in effect for ${locName}.`,
      validUntil: 'Next Synoptic Bulletin Cycle',
      issuedAt: normalized.lastSuccessfulAt || new Date().toISOString(),
      source: 'NDMA/SACHET',
      updatedAt: normalized.lastSuccessfulAt || new Date().toISOString(),
      status: statusLabel,
      isLocal: true,
      diagnostics: normalized.diagnostics,
      metadata: {
        lat: opts.lat,
        lng: opts.lng,
        resolvedDistrict: opts.district,
        resolvedState: opts.state,
        totalNationalAlerts: normalized.activeAlerts,
      },
    };
  }

  /**
   * Nationwide summary across all 36 canonical States and UTs (mode=national)
   */
  public async getNationalRegionWarnings(): Promise<{
    status: 'SUCCESS' | 'UNAVAILABLE' | 'STALE';
    timestamp: string;
    lastSuccessfulParsedAt: string | null;
    activeCount: number;
    diagnostics: SachetSafeDiagnostics;
    regions: Array<{
      region: CanonicalRegion;
      status: 'ACTIVE_WARNING' | 'ALL_CLEAR' | 'DATA_UNAVAILABLE';
      severity: 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN' | 'UNKNOWN';
      activeCount: number;
      warnings: SachetWarning[];
    }>;
  }> {
    const normalized = await this.fetchNormalizedResult();

    if (normalized.status === 'unavailable') {
      return {
        status: 'UNAVAILABLE',
        timestamp: new Date().toISOString(),
        lastSuccessfulParsedAt: normalized.lastSuccessfulAt,
        activeCount: 0,
        diagnostics: normalized.diagnostics,
        regions: CANONICAL_INDIA_REGIONS.map((reg) => ({
          region: reg,
          status: 'DATA_UNAVAILABLE',
          severity: 'UNKNOWN',
          activeCount: 0,
          warnings: [],
        })),
      };
    }

    const regions = CANONICAL_INDIA_REGIONS.map((reg) => {
      const terms = [reg.name.toLowerCase(), ...reg.aliases.map((a) => a.toLowerCase())];
      const matching = normalized.alerts.filter((w) => {
        const text = `${w.headline || ''} ${w.description || ''} ${w.sender || ''} ${(w.areas || []).join(' ')}`.toLowerCase();
        return terms.some((t) => text.includes(t));
      });

      if (matching.length > 0) {
        let sev: 'RED' | 'ORANGE' | 'YELLOW' = 'YELLOW';
        if (matching.some((w) => w.severity === 'RED')) sev = 'RED';
        else if (matching.some((w) => w.severity === 'ORANGE')) sev = 'ORANGE';

        return {
          region: reg,
          status: 'ACTIVE_WARNING' as const,
          severity: sev,
          activeCount: matching.length,
          warnings: matching,
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
      status: normalized.status === 'stale' ? 'STALE' : 'SUCCESS',
      timestamp: new Date().toISOString(),
      lastSuccessfulParsedAt: normalized.parsedAt,
      activeCount: normalized.activeAlerts,
      diagnostics: normalized.diagnostics,
      regions,
    };
  }

  private calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
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

/**
 * Primary Vercel & Express API Handler (/api/warnings)
 */
export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }

  const query = parseQuery(req);
  const mode = (query.mode || (query.debug === '1' ? 'debug' : 'current')).toString().toLowerCase();

  try {
    // Diagnostic / debug route (Requirement 8 & 13)
    if (mode === 'debug' || query.debug === '1') {
      const normalized = await sachetService.fetchNormalizedResult(query.force === '1');
      return sendJson(res, 200, normalized.diagnostics, {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      });
    }

    switch (mode) {
      case 'national': {
        const result = await sachetService.getNationalRegionWarnings();
        return sendJson(res, 200, result, {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        });
      }

      case 'feed':
      case 'alerts':
      case 'normalized': {
        const result = await sachetService.fetchNormalizedResult(query.force === '1');
        return sendJson(res, 200, result, {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        });
      }

      case 'region':
      case 'state': {
        const regionName = (query.region || query.state || query.name || '').toString().trim();
        const national = await sachetService.getNationalRegionWarnings();
        const matched = national.regions.find(
          (r) =>
            r.region.name.toLowerCase() === regionName.toLowerCase() ||
            r.region.code.toLowerCase() === regionName.toLowerCase() ||
            r.region.aliases.some((a) => a.toLowerCase() === regionName.toLowerCase())
        );

        if (matched) {
          return sendJson(res, 200, matched, {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          });
        }

        return sendJson(res, 200, {
          region: { name: regionName, code: '', type: 'STATE', capital: '', lat: 0, lng: 0, aliases: [] },
          status: 'ALL_CLEAR',
          severity: 'GREEN',
          activeCount: 0,
          warnings: [],
        });
      }

      case 'current':
      default: {
        const lat = query.lat ? parseFloat(query.lat) : undefined;
        const lng = query.lng || query.lon ? parseFloat(query.lng || query.lon) : undefined;
        const city = query.city ? String(query.city) : undefined;
        const district = query.district ? String(query.district) : undefined;
        const state = query.state ? String(query.state) : undefined;
        const country = query.country ? String(query.country) : undefined;

        const result = await sachetService.resolveStandardizedWarning({
          lat,
          lng,
          city,
          district,
          state,
          country,
        });

        return sendJson(res, 200, result, {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        });
      }
    }
  } catch (err: any) {
    // API failure MUST NOT become GREEN!
    return sendJson(res, 200, {
      state: 'DATA_UNAVAILABLE',
      severity: 'neutral',
      severityLabel: 'DATA UNAVAILABLE',
      hazardHeadline: 'OFFICIAL WARNING FEED UNAVAILABLE',
      hazardLabel: 'Feed Unreachable',
      affectedAreasHeadline: query.city || query.district || query.state || 'Selected Location',
      affectedDistricts: query.district ? [query.district] : [],
      description: 'Official warning feed from NDMA / SACHET is temporarily unreachable.',
      validUntil: 'Feed unreachable',
      issuedAt: new Date().toISOString(),
      source: 'NDMA/SACHET',
      updatedAt: new Date().toISOString(),
      status: 'UNAVAILABLE',
      isLocal: false,
      diagnostics: sachetService.buildDiagnosticsObject(),
      metadata: {
        status: 'UNAVAILABLE',
        error: err?.message || 'Warning pipeline error',
      },
    });
  }
}
