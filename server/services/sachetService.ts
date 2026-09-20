// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// SACHET / NDMA CAP & RSS Integration Service (Unified Provider)
// Real CAP/RSS pipeline, ETag conditional caching, safe diagnostics,
// and single normalized result across Warning Center & System Health.
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

export type SachetWarning = WeatherWarning;
export type SachetSafeDiagnostics = {
  source: string;
  requestUrlWithoutSecrets: string;
  httpStatus: number | null;
  contentType: string | null;
  responseSize: number | null;
  parser: string;
  alertsReceived: number;
  alertsParsed: number;
  activeAlerts: number;
  lastSuccessfulAt: string | null;
  lastSuccessfulFetchAt: string | null;
  lastSuccessfulParsedAt: string | null;
  lastAttemptAt: string;
  endpointStatus: string;
  fetchStatus: string;
  parserStatus: string;
  error: string | null;
};

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

export interface SachetNormalizedResult {
  provider: 'SACHET/NDMA';
  status: 'operational' | 'stale' | 'unavailable' | 'empty';
  fetchedAt: string | null;
  parsedAt: string | null;
  lastSuccessfulAt: string | null;
  lastAttemptAt: string;
  alertsReceived: number;
  alertsParsed: number;
  activeAlerts: number;
  alerts: WeatherWarning[];
  error: string | null;
  diagnostics: {
    source: string;
    requestUrlWithoutSecrets: string;
    httpStatus: number | null;
    contentType: string | null;
    responseSize: number;
    parser: string;
    alertsReceived: number;
    alertsParsed: number;
    activeAlerts: number;
    lastSuccessfulAt: string | null;
    error: string | null;
  };
}

export type WarningUIState =
  | 'RED_ALERT'
  | 'ORANGE_ALERT'
  | 'WATCH_ADVISORY'
  | 'NO_ACTIVE_WARNING'
  | 'DATA_UNAVAILABLE';

export interface StandardizedWarningResponse {
  state: WarningUIState;
  severity: 'green' | 'yellow' | 'orange' | 'red' | 'neutral';
  severityLabel: string;
  hazardHeadline: string;
  hazardCode?: number;
  hazardLabel?: string;
  affectedAreasHeadline: string;
  affectedDistricts: string[];
  description: string;
  validUntil: string;
  issuedAt: string;
  source: 'IMD' | 'NDMA/SACHET' | 'None';
  updatedAt: string;
  lastAttemptAt?: string | null;
  lastSuccessfulFetchAt?: string | null;
  lastSuccessfulParsedAt?: string | null;
  status: 'LIVE' | 'RECENT' | 'STALE' | 'UNAVAILABLE' | 'Routine';
  isLocal: boolean;
  recommendedActions?: string[];
  emergencyContact?: {
    title: string;
    number: string;
  };
  additionalActiveCount?: number;
  diagnostics?: any;
  metadata?: {
    lat?: number;
    lng?: number;
    resolvedDistrict?: string;
    resolvedState?: string;
    subdivision?: string;
    isInternational?: boolean;
    isCached?: boolean;
    [key: string]: any;
  };
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

export const LOCATION_DISTRICT_MAP: Record<string, { district: string; state: string; subdivision?: string }> = {
  // Odisha
  chandaka: { district: 'Khordha', state: 'Odisha', subdivision: 'Odisha' },
  bhubaneswar: { district: 'Khordha', state: 'Odisha', subdivision: 'Odisha' },
  khordha: { district: 'Khordha', state: 'Odisha', subdivision: 'Odisha' },
  cuttack: { district: 'Cuttack', state: 'Odisha', subdivision: 'Odisha' },
  puri: { district: 'Puri', state: 'Odisha', subdivision: 'Odisha' },
  paradip: { district: 'Jagatsinghpur', state: 'Odisha', subdivision: 'Odisha' },
  jagatsinghpur: { district: 'Jagatsinghpur', state: 'Odisha', subdivision: 'Odisha' },
  balasore: { district: 'Balasore', state: 'Odisha', subdivision: 'Odisha' },
  baleshwar: { district: 'Balasore', state: 'Odisha', subdivision: 'Odisha' },
  baleswar: { district: 'Balasore', state: 'Odisha', subdivision: 'Odisha' },
  kendrapara: { district: 'Kendrapara', state: 'Odisha', subdivision: 'Odisha' },
  bhadrak: { district: 'Bhadrak', state: 'Odisha', subdivision: 'Odisha' },
  ganjam: { district: 'Ganjam', state: 'Odisha', subdivision: 'Odisha' },
  sambalpur: { district: 'Sambalpur', state: 'Odisha', subdivision: 'Odisha' },
  rourkela: { district: 'Sundargarh', state: 'Odisha', subdivision: 'Odisha' },

  // Delhi NCR
  delhi: { district: 'New Delhi', state: 'Delhi', subdivision: 'Delhi' },
  'new delhi': { district: 'New Delhi', state: 'Delhi', subdivision: 'Delhi' },
  safdarjung: { district: 'New Delhi', state: 'Delhi', subdivision: 'Delhi' },
  noida: { district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', subdivision: 'West Uttar Pradesh' },
  gurugram: { district: 'Gurugram', state: 'Haryana', subdivision: 'Haryana, Chandigarh & Delhi' },
  gurgaon: { district: 'Gurugram', state: 'Haryana', subdivision: 'Haryana, Chandigarh & Delhi' },
  faridabad: { district: 'Faridabad', state: 'Haryana', subdivision: 'Haryana, Chandigarh & Delhi' },

  // Maharashtra
  mumbai: { district: 'Mumbai City', state: 'Maharashtra', subdivision: 'Konkan & Goa' },
  'mumbai suburban': { district: 'Mumbai Suburban', state: 'Maharashtra', subdivision: 'Konkan & Goa' },
  thane: { district: 'Thane', state: 'Maharashtra', subdivision: 'Konkan & Goa' },
  pune: { district: 'Pune', state: 'Maharashtra', subdivision: 'Madhya Maharashtra' },
  nagpur: { district: 'Nagpur', state: 'Maharashtra', subdivision: 'Vidarbha' },
  nashik: { district: 'Nashik', state: 'Maharashtra', subdivision: 'Madhya Maharashtra' },

  // West Bengal
  kolkata: { district: 'Kolkata', state: 'West Bengal', subdivision: 'Gangetic West Bengal' },
  howrah: { district: 'Howrah', state: 'West Bengal', subdivision: 'Gangetic West Bengal' },
  siliguri: { district: 'Darjeeling', state: 'West Bengal', subdivision: 'Sub-Himalayan West Bengal & Sikkim' },

  // Tamil Nadu
  chennai: { district: 'Chennai', state: 'Tamil Nadu', subdivision: 'Tamil Nadu, Puducherry & Karaikal' },
  coimbatore: { district: 'Coimbatore', state: 'Tamil Nadu', subdivision: 'Tamil Nadu, Puducherry & Karaikal' },
  madurai: { district: 'Madurai', state: 'Tamil Nadu', subdivision: 'Tamil Nadu, Puducherry & Karaikal' },

  // Karnataka
  bengaluru: { district: 'Bengaluru Urban', state: 'Karnataka', subdivision: 'South Interior Karnataka' },
  bangalore: { district: 'Bengaluru Urban', state: 'Karnataka', subdivision: 'South Interior Karnataka' },
  mysuru: { district: 'Mysuru', state: 'Karnataka', subdivision: 'South Interior Karnataka' },

  // Telangana & AP
  hyderabad: { district: 'Hyderabad', state: 'Telangana', subdivision: 'Telangana' },
  visakhapatnam: { district: 'Visakhapatnam', state: 'Andhra Pradesh', subdivision: 'Coastal Andhra Pradesh & Yanam' },
  vijayawada: { district: 'NTR', state: 'Andhra Pradesh', subdivision: 'Coastal Andhra Pradesh & Yanam' },

  // North & Central
  jaipur: { district: 'Jaipur', state: 'Rajasthan', subdivision: 'East Rajasthan' },
  ahmedabad: { district: 'Ahmedabad', state: 'Gujarat', subdivision: 'Gujarat Region' },
  lucknow: { district: 'Lucknow', state: 'Uttar Pradesh', subdivision: 'East Uttar Pradesh' },
  bhopal: { district: 'Bhopal', state: 'Madhya Pradesh', subdivision: 'West Madhya Pradesh' },
  patna: { district: 'Patna', state: 'Bihar', subdivision: 'Bihar' },
  guwahati: { district: 'Kamrup Metropolitan', state: 'Assam', subdivision: 'Assam & Meghalaya' },
  chandigarh: { district: 'Chandigarh', state: 'Chandigarh', subdivision: 'Haryana, Chandigarh & Delhi' },
  srinagar: { district: 'Srinagar', state: 'Jammu and Kashmir', subdivision: 'Jammu & Kashmir and Ladakh' },
  shimla: { district: 'Shimla', state: 'Himachal Pradesh', subdivision: 'Himachal Pradesh' },
  dehradun: { district: 'Dehradun', state: 'Uttarakhand', subdivision: 'Uttarakhand' },
  thiruvananthapuram: { district: 'Thiruvananthapuram', state: 'Kerala', subdivision: 'Kerala & Mahe' },
  kochi: { district: 'Ernakulam', state: 'Kerala', subdivision: 'Kerala & Mahe' },
  panaji: { district: 'North Goa', state: 'Goa', subdivision: 'Konkan & Goa' },
  goa: { district: 'North Goa', state: 'Goa', subdivision: 'Konkan & Goa' },
};

export class SachetService {
  private static instance: SachetService;
  private cachedAlerts: WeatherWarning[] = [];
  private lastFetchTime: number = 0;
  private cachedEtag: string = '';
  private cachedLastModified: string = '';
  private inFlightFetch: Promise<WeatherWarning[]> | null = null;
  private readonly CACHE_TTL_MS = 60 * 1000; // 60 seconds

  // Comprehensive Telemetry
  public lastAttemptAt: string = new Date().toISOString();
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

  // Diagnostics metadata for dev debug endpoint
  private lastContentType: string | null = null;
  private lastResponseSize: number = 0;
  private lastParserType: string = 'NONE';
  private readonly RSS_URL = 'https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml';
  private readonly JSON_URL = 'https://sachet.ndma.gov.in/cap_public_website/FetchAllAlertDetails';

  public static getInstance(): SachetService {
    if (!SachetService.instance) {
      SachetService.instance = new SachetService();
    }
    return SachetService.instance;
  }

  /**
   * Parse severity string into standard 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' | 'UNKNOWN'
   */
  public normalizeSeverity(colorOrSev?: string): 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' | 'UNKNOWN' {
    if (!colorOrSev) return 'UNKNOWN';
    const s = colorOrSev.toUpperCase().trim();
    if (s.includes('RED') || s.includes('EXTREME') || s.includes('TAKE ACTION')) return 'RED';
    if (s.includes('ORANGE') || s.includes('SEVERE') || s.includes('BE PREPARED') || s.includes('ALERT')) return 'ORANGE';
    if (s.includes('YELLOW') || s.includes('MODERATE') || s.includes('BE AWARE') || s.includes('WATCH')) return 'YELLOW';
    if (s.includes('GREEN') || s.includes('ALL CLEAR') || s.includes('ROUTINE') || s.includes('NO WARNING')) return 'GREEN';
    return 'UNKNOWN';
  }

  /**
   * Parse timestamp with IST tolerance
   */
  public parseCapTimestamp(timeStr?: string): number | null {
    if (!timeStr) return null;
    const sanitized = timeStr.trim().replace(/\bIST\b/g, '+0530');
    const ms = Date.parse(sanitized);
    return isNaN(ms) ? null : ms;
  }

  /**
   * Check if alert is expired
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
   * Core fetch with ETag conditional caching
   */
  public async fetchAllActiveWarnings(forceRefresh = false): Promise<WeatherWarning[]> {
    const now = Date.now();
    this.lastAttemptAt = new Date().toISOString();

    // In-memory cache valid within TTL
    if (!forceRefresh && this.cachedAlerts.length > 0 && now - this.lastFetchTime < this.CACHE_TTL_MS) {
      const active = this.cachedAlerts.filter((a) => !this.isExpired(a));
      this.activeAlerts = active.length;
      return active;
    }

    if (this.inFlightFetch && !forceRefresh) {
      return this.inFlightFetch;
    }

    this.inFlightFetch = (async () => {
      try {
        let warnings: WeatherWarning[] = [];
        let fetchSuccess = false;
        let lastErr: any = null;

        // =========================================================
        // PIPELINE 1: Primary Official India CAP RSS Feed
        // =========================================================
        try {
          const reqHeaders: Record<string, string> = {
            'User-Agent': 'Mausam-CAP-Consumer/2.0 (NDMA-Sachet Connector)',
            Accept: 'application/rss+xml, application/xml, text/xml, */*',
          };
          if (this.cachedEtag) {
            reqHeaders['If-None-Match'] = this.cachedEtag;
          }
          if (this.cachedLastModified) {
            reqHeaders['If-Modified-Since'] = this.cachedLastModified;
          }

          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 8000);

          const res = await fetch(this.RSS_URL, {
            headers: reqHeaders,
            signal: controller.signal,
          });
          clearTimeout(timer);

          this.httpStatus = res.status;
          this.lastContentType = res.headers.get('content-type') || '';
          this.endpointStatus = 'REACHABLE';

          // Debug log as requested by user
          console.log(`[SACHET DEBUG] URL: ${this.RSS_URL}`);
          console.log(`[SACHET DEBUG] HTTP STATUS: ${res.status}`);
          console.log(`[SACHET DEBUG] CONTENT TYPE: ${this.lastContentType}`);

          // Handle 304 Not Modified: Reuse cached parsed alerts
          if (res.status === 304 && this.cachedAlerts.length > 0) {
            console.log('[SACHET DEBUG] HTTP 304 NOT MODIFIED — Reusing cached parsed alerts');
            this.lastFetchTime = Date.now();
            this.fetchStatus = 'SUCCESS';
            this.parserStatus = 'OPERATIONAL';
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
            this.lastResponseSize = text.length;
            console.log(`[SACHET DEBUG] RESPONSE SIZE: ${text.length}`);
            console.log(`[SACHET DEBUG] FIRST 500 RESPONSE CHARACTERS: ${text.slice(0, 500).replace(/\s+/g, ' ')}`);

            // Verify not an HTML error page
            if (text.trim().toLowerCase().startsWith('<!doctype html') || (text.includes('<html') && !text.includes('<rss'))) {
              console.warn('[SACHET DEBUG] RECEIVED HTML — NOT A WARNING FEED');
            } else if (text.includes('<rss') || text.includes('<item>')) {
              this.lastParserType = 'RSS_XML';
              console.log('[SACHET DEBUG] PARSER TYPE: RSS_XML');

              const items = text.match(/<item>[\s\S]*?<\/item>/g) || [];
              this.alertsReceived = items.length;
              console.log(`[SACHET DEBUG] ALERT COUNT: ${items.length}`);

              for (const itemXml of items) {
                try {
                  const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/);
                  const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
                  const authorMatch = itemXml.match(/<author>([\s\S]*?)<\/author>/);
                  const guidMatch = itemXml.match(/<guid[^>]*>([\s\S]*?)<\/guid>/);
                  const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);

                  const title = (titleMatch ? titleMatch[1].trim() : '').replace(/<!\[CDATA\[|\]\]>/g, '');
                  const author = (authorMatch ? authorMatch[1].trim() : 'NDMA / IMD').replace(/<!\[CDATA\[|\]\]>/g, '');
                  const link = linkMatch ? linkMatch[1].trim() : '';
                  const guid = guidMatch ? guidMatch[1].trim() : link || String(Math.random());
                  const pubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();

                  // Extract identifier from link or guid
                  let identifier = guid;
                  const idMatch = link.match(/identifier=([a-zA-Z0-9]+)/);
                  if (idMatch) identifier = idMatch[1];

                  // Determine severity
                  let sev: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' | 'UNKNOWN' = 'ORANGE';
                  const lower = (title + ' ' + author).toLowerCase();
                  if (
                    lower.includes('red') ||
                    lower.includes('heavy to very heavy') ||
                    lower.includes('extremely heavy') ||
                    lower.includes('intense spell') ||
                    lower.includes('severe')
                  ) {
                    sev = 'RED';
                  } else if (
                    lower.includes('orange') ||
                    lower.includes('moderate to intense') ||
                    lower.includes('be prepared')
                  ) {
                    sev = 'ORANGE';
                  } else if (
                    lower.includes('yellow') ||
                    lower.includes('light to moderate') ||
                    lower.includes('be aware') ||
                    lower.includes('watch')
                  ) {
                    sev = 'YELLOW';
                  }

                  // Extract area / district names from title or author
                  const areas: string[] = [];
                  const distMatch = title.match(/over\s+(?:the\s+marked\s+area\s+of\s+)?([A-Za-z,\s]+?)(?:\s+in\s+next|\s+districts|\.|$)/i);
                  if (distMatch && distMatch[1]) {
                    const parsed = distMatch[1].split(',').map((d) => d.trim()).filter((d) => d.length > 2);
                    areas.push(...parsed);
                  }
                  if (author && author !== 'NDMA / IMD') {
                    areas.push(author);
                  }

                  warnings.push({
                    id: identifier,
                    source: 'NDMA / SACHET',
                    sender: author,
                    event: title.includes('Flood') ? 'Riverine Flood' : title.includes('Thunderstorm') ? 'Thunderstorm & Lightning' : 'Severe Weather Warning',
                    headline: title.slice(0, 140),
                    description: title,
                    instruction: 'Follow SDMA instructions. Avoid exposed locations and waterlogged zones.',
                    severity: sev,
                    urgency: 'Expected',
                    certainty: 'Observed',
                    areas: areas.length > 0 ? areas : [author],
                    affectedDistricts: areas,
                    issuedAt: pubDate,
                    sourceUrl: link || undefined,
                    rawSeverityColor: sev.toLowerCase(),
                    status: 'LIVE',
                  });
                } catch (itemErr) {
                  console.warn('[SACHET DEBUG] PARSE ERROR on item:', itemErr);
                }
              }

              this.alertsParsed = warnings.length;
              this.parserStatus = 'OPERATIONAL';
              fetchSuccess = true;
            }
          }
        } catch (rssErr: any) {
          lastErr = rssErr;
          console.warn('[SACHET DEBUG] RSS attempt error:', rssErr?.message || rssErr);
        }

        // =========================================================
        // PIPELINE 2: Fallback to FetchAllAlertDetails (JSON)
        // =========================================================
        if (!fetchSuccess) {
          try {
            console.log('[SACHET DEBUG] Attempting JSON pipeline fallback');
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 6000);

            const res = await fetch(this.JSON_URL, {
              headers: {
                Accept: 'application/json',
                'User-Agent': 'Mausam-NDMA-Connector/2.0',
              },
              signal: controller.signal,
            });
            clearTimeout(timer);

            this.httpStatus = res.status;
            this.lastContentType = res.headers.get('content-type') || '';
            console.log(`[SACHET DEBUG] JSON HTTP STATUS: ${res.status}`);

            if (res.ok) {
              const text = await res.text();
              this.lastResponseSize = text.length;

              if (text && (text.trim().startsWith('[') || text.trim().startsWith('{'))) {
                this.lastParserType = 'JSON_CAP';
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
                console.log(`[SACHET DEBUG] JSON raw alerts: ${json.length}`);

                for (const item of json) {
                  try {
                    if (this.isExpired(item)) continue;
                    const sev = this.normalizeSeverity(item.severity_color || item.severity || item.severity_level);
                    let lat: number | undefined;
                    let lon: number | undefined;
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
                      status: 'LIVE',
                    });
                  } catch (itemErr) {
                    console.warn('[SACHET DEBUG] PARSE ERROR on JSON item:', itemErr);
                  }
                }

                this.alertsParsed = warnings.length;
                this.parserStatus = 'OPERATIONAL';
                fetchSuccess = true;
              }
            }
          } catch (jsonErr: any) {
            lastErr = jsonErr;
            console.warn('[SACHET DEBUG] JSON fallback attempt error:', jsonErr?.message || jsonErr);
          }
        }

        // =========================================================
        // Result Resolution
        // =========================================================
        if (fetchSuccess) {
          const nowIso = new Date().toISOString();
          this.lastSuccessfulFetchAt = nowIso;
          this.lastSuccessfulParsedAt = nowIso;
          this.fetchStatus = 'SUCCESS';
          this.lastError = null;
          this.activeAlerts = warnings.length;
          this.cachedAlerts = warnings;
          this.lastFetchTime = Date.now();

          console.log(`[SACHET DEBUG] SUCCESS: ${warnings.length} active warnings normalized`);
          return warnings;
        }

        // Check if cached data can be used as STALE fallback
        if (this.cachedAlerts.length > 0) {
          this.fetchStatus = 'STALE';
          this.lastError = lastErr?.message || 'Network fetch failed; serving stale cache';
          const active = this.cachedAlerts.filter((a) => !this.isExpired(a));
          console.warn(`[SACHET DEBUG] Serving ${active.length} alerts from stale cache`);
          return active;
        }

        // Provider failure and no cache
        this.fetchStatus = 'FAILED';
        this.parserStatus = 'FAILED';
        this.endpointStatus = 'UNREACHABLE';
        this.lastError = lastErr?.message || 'SACHET alert feeds temporarily unreachable';
        console.error(`[SACHET DEBUG] FAILURE: ${this.lastError}`);
        throw new Error(this.lastError);
      } finally {
        this.inFlightFetch = null;
      }
    })();

    return this.inFlightFetch;
  }

  /**
   * Return the Single Normalized Result requested in Requirement 9
   */
  public async fetchNormalizedResult(forceRefresh = false): Promise<SachetNormalizedResult> {
    const lastAttemptAt = this.lastAttemptAt;
    try {
      const alerts = await this.fetchAllActiveWarnings(forceRefresh);
      const status =
        this.fetchStatus === 'STALE'
          ? 'stale'
          : alerts.length === 0
          ? 'empty'
          : 'operational';

      return {
        provider: 'SACHET/NDMA',
        status,
        fetchedAt: this.lastSuccessfulFetchAt,
        parsedAt: this.lastSuccessfulParsedAt,
        lastSuccessfulAt: this.lastSuccessfulParsedAt,
        lastAttemptAt,
        alertsReceived: this.alertsReceived,
        alertsParsed: this.alertsParsed,
        activeAlerts: alerts.length,
        alerts,
        error: null,
        diagnostics: this.getSafeDiagnostics(),
      };
    } catch (err: any) {
      return {
        provider: 'SACHET/NDMA',
        status: 'unavailable',
        fetchedAt: this.lastSuccessfulFetchAt,
        parsedAt: this.lastSuccessfulParsedAt,
        lastSuccessfulAt: this.lastSuccessfulParsedAt,
        lastAttemptAt,
        alertsReceived: this.alertsReceived,
        alertsParsed: 0,
        activeAlerts: 0,
        alerts: [],
        error: err?.message || this.lastError || 'SACHET feed unreachable',
        diagnostics: this.getSafeDiagnostics(),
      };
    }
  }

  /**
   * Safe diagnostics object (Requirement 13)
   */
  public getSafeDiagnostics() {
    return {
      source: 'SACHET/NDMA',
      requestUrlWithoutSecrets: this.RSS_URL,
      httpStatus: this.httpStatus,
      contentType: this.lastContentType,
      responseSize: this.lastResponseSize,
      parser: this.lastParserType,
      alertsReceived: this.alertsReceived,
      alertsParsed: this.alertsParsed,
      activeAlerts: this.activeAlerts,
      lastSuccessfulAt: this.lastSuccessfulParsedAt,
      lastSuccessfulFetchAt: this.lastSuccessfulFetchAt,
      lastSuccessfulParsedAt: this.lastSuccessfulParsedAt,
      lastAttemptAt: this.lastAttemptAt,
      endpointStatus: this.endpointStatus,
      fetchStatus: this.fetchStatus,
      parserStatus: this.parserStatus,
      error: this.lastError,
    };
  }

  /**
   * Resolve location warning: strictly respects location, returns official alert or ALL CLEAR,
   * and NEVER converts feed failure to ALL CLEAR!
   */
  public async resolveStandardizedWarning(loc: {
    lat?: number;
    lng?: number;
    city?: string;
    district?: string;
    state?: string;
    country?: string;
  }): Promise<StandardizedWarningResponse> {
    const area = this.resolveArea(loc.city, loc.district, loc.state, loc.country, loc.lat, loc.lng);
    const normalized = await this.fetchNormalizedResult();

    // 1. If provider is UNAVAILABLE: Do NOT fall back to green!
    if (normalized.status === 'unavailable') {
      return {
        state: 'DATA_UNAVAILABLE',
        severity: 'neutral',
        severityLabel: 'DATA UNAVAILABLE',
        hazardHeadline: 'OFFICIAL WARNING FEED UNAVAILABLE',
        hazardLabel: 'Feed Unreachable',
        affectedAreasHeadline: area.district || area.state || 'Selected Location',
        affectedDistricts: [area.district],
        description: 'Official warning feed from NDMA / SACHET is temporarily unreachable. Surface telemetry and numerical forecasts remain active.',
        validUntil: 'Feed unreachable',
        issuedAt: normalized.lastAttemptAt,
        source: 'NDMA/SACHET',
        updatedAt: new Date().toISOString(),
        lastAttemptAt: normalized.lastAttemptAt,
        lastSuccessfulFetchAt: normalized.fetchedAt,
        lastSuccessfulParsedAt: normalized.lastSuccessfulAt,
        status: 'UNAVAILABLE',
        isLocal: false,
        diagnostics: normalized.diagnostics,
        metadata: {
          lat: loc.lat,
          lng: loc.lng,
          resolvedDistrict: area.district,
          resolvedState: area.state,
          subdivision: area.subdivision,
          status: 'UNAVAILABLE',
        },
      };
    }

    // 2. Search active alerts for matching district / state
    const matched = this.matchAlertsForArea(normalized.alerts, area, loc.lat, loc.lng);

    if (matched.length > 0) {
      // Pick highest severity alert
      let highest = matched[0];
      for (const w of matched) {
        if (w.severity === 'RED') {
          highest = w;
          break;
        }
        if (w.severity === 'ORANGE' && highest.severity !== 'RED') {
          highest = w;
        }
      }

      const sev = highest.severity;
      const uiState: WarningUIState =
        sev === 'RED' ? 'RED_ALERT' : sev === 'ORANGE' ? 'ORANGE_ALERT' : 'WATCH_ADVISORY';

      const sevLabel =
        sev === 'RED'
          ? 'RED ALERT — TAKE ACTION'
          : sev === 'ORANGE'
          ? 'ORANGE ALERT — BE PREPARED'
          : 'YELLOW WATCH — BE AWARE';

      return {
        state: uiState,
        severity: sev === 'RED' ? 'red' : sev === 'ORANGE' ? 'orange' : 'yellow',
        severityLabel: sevLabel,
        hazardHeadline: highest.headline || highest.event,
        hazardLabel: highest.event,
        affectedAreasHeadline: highest.areas.join(', ') || area.district,
        affectedDistricts: highest.affectedDistricts || [area.district],
        description: highest.description || highest.instruction || 'Severe meteorological warning issued.',
        validUntil: highest.expires || 'Next 3 hours',
        issuedAt: highest.issuedAt,
        source: 'NDMA/SACHET',
        updatedAt: new Date().toISOString(),
        lastAttemptAt: normalized.lastAttemptAt,
        lastSuccessfulFetchAt: normalized.fetchedAt,
        lastSuccessfulParsedAt: normalized.lastSuccessfulAt,
        status: normalized.status === 'stale' ? 'STALE' : 'LIVE',
        isLocal: true,
        recommendedActions: [
          'Stay tuned to local disaster management authorities (SDMA).',
          'Avoid waterlogged routes and exposed high ground.',
          'Secure loose outdoor items and keep emergency numbers ready.',
        ],
        emergencyContact: {
          title: 'Disaster Management Helpline',
          number: '1070',
        },
        additionalActiveCount: matched.length - 1,
        diagnostics: normalized.diagnostics,
        metadata: {
          lat: loc.lat,
          lng: loc.lng,
          resolvedDistrict: area.district,
          resolvedState: area.state,
          subdivision: area.subdivision,
          status: normalized.status === 'stale' ? 'STALE' : 'LIVE',
        },
      };
    }

    // 3. No alerts match this location -> ALL CLEAR (permitted because feed succeeded!)
    return {
      state: 'NO_ACTIVE_WARNING',
      severity: 'green',
      severityLabel: 'ALL CLEAR',
      hazardHeadline: 'NO ACTIVE OFFICIAL WARNING',
      hazardLabel: 'No Warning',
      affectedAreasHeadline: area.district || area.state || 'Selected Location',
      affectedDistricts: [area.district],
      description: 'Official NDMA / IMD synoptic surveillance active. No severe weather warnings currently issued for this area.',
      validUntil: 'Current bulletin valid',
      issuedAt: normalized.lastSuccessfulAt || new Date().toISOString(),
      source: 'NDMA/SACHET',
      updatedAt: new Date().toISOString(),
      lastAttemptAt: normalized.lastAttemptAt,
      lastSuccessfulFetchAt: normalized.fetchedAt,
      lastSuccessfulParsedAt: normalized.lastSuccessfulAt,
      status: normalized.status === 'stale' ? 'STALE' : 'LIVE',
      isLocal: true,
      diagnostics: normalized.diagnostics,
      metadata: {
        lat: loc.lat,
        lng: loc.lng,
        resolvedDistrict: area.district,
        resolvedState: area.state,
        subdivision: area.subdivision,
        status: normalized.status === 'stale' ? 'STALE' : 'LIVE',
      },
    };
  }

  /**
   * Helper: Matches active warnings for given area
   */
  private matchAlertsForArea(
    alerts: WeatherWarning[],
    area: { district: string; state: string },
    lat?: number,
    lng?: number
  ): WeatherWarning[] {
    const matched: WeatherWarning[] = [];
    const targetDistrict = (area.district || '').toLowerCase().trim();
    const targetState = (area.state || '').toLowerCase().trim();

    // District aliases
    const aliases = [targetDistrict];
    if (targetDistrict.includes('khordha') || targetDistrict.includes('khurda')) {
      aliases.push('khordha', 'khurda', 'bhubaneswar', 'chandaka');
    }
    if (targetDistrict.includes('balasore') || targetDistrict.includes('baleshwar') || targetDistrict.includes('baleswar')) {
      aliases.push('balasore', 'baleshwar', 'baleswar');
    }

    for (const w of alerts) {
      let isMatch = false;

      // 1. Coordinates check
      if (lat !== undefined && lng !== undefined && w.latitude !== undefined && w.longitude !== undefined) {
        if (this.calculateDistanceKm(lat, lng, w.latitude, w.longitude) <= 50) {
          isMatch = true;
        }
      }

      // 2. Direct district match in areas
      if (!isMatch) {
        const designated = [...(w.areas || []), ...(w.affectedDistricts || [])].map((a) => a.toLowerCase().trim());
        for (const a of designated) {
          for (const alias of aliases) {
            if (alias.length >= 3 && (a === alias || a.includes(alias) || alias.includes(a))) {
              isMatch = true;
              break;
            }
          }
          if (isMatch) break;
        }
      }

      // 3. Headline/description target check
      if (!isMatch) {
        const text = `${w.headline || ''} ${w.description || ''}`.toLowerCase();
        for (const alias of aliases) {
          if (
            alias.length >= 4 &&
            (text.includes(` ${alias}`) || text.includes(`over ${alias}`) || text.includes(`of ${alias}`))
          ) {
            isMatch = true;
            break;
          }
        }
      }

      if (isMatch) {
        matched.push(w);
      }
    }

    return matched;
  }

  /**
   * Helper: Resolves administrative area
   */
  public resolveArea(
    city?: string,
    district?: string,
    state?: string,
    country?: string,
    lat?: number,
    lng?: number
  ): { district: string; state: string; subdivision?: string } {
    const cityKey = (city || '').toLowerCase().trim();
    const districtKey = (district || '').toLowerCase().trim();

    if (LOCATION_DISTRICT_MAP[cityKey]) {
      return LOCATION_DISTRICT_MAP[cityKey];
    }
    if (LOCATION_DISTRICT_MAP[districtKey]) {
      return LOCATION_DISTRICT_MAP[districtKey];
    }

    return {
      district: district || city || 'Local Area',
      state: state || 'India',
      subdivision: state,
    };
  }

  /**
   * National state/UT rollup
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
    const normalized = await this.fetchNormalizedResult();

    if (normalized.status === 'unavailable') {
      return {
        status: 'UNAVAILABLE',
        timestamp: new Date().toISOString(),
        lastSuccessfulParsedAt: normalized.lastSuccessfulAt,
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
        const text = `${w.headline || ''} ${w.description || ''} ${w.sender || ''} ${w.areas.join(' ')}`.toLowerCase();
        return terms.some((t) => text.includes(t));
      });

      if (matching.length > 0) {
        let sev: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' = 'YELLOW';
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
      status: 'SUCCESS',
      timestamp: new Date().toISOString(),
      lastSuccessfulParsedAt: normalized.lastSuccessfulAt,
      regions,
    };
  }

  public getDiagnostics(): SachetSafeDiagnostics {
    return this.getSafeDiagnostics();
  }

  public async getWarningsForLocation(opts: {
    city?: string;
    district?: string;
    state?: string;
    lat?: number;
    lng?: number;
  }): Promise<{
    status: 'SUCCESS' | 'UNAVAILABLE' | 'NO_ALERTS';
    matchedWarnings: SachetWarning[];
    activeAlertsCount: number;
    lastAttemptAt: string;
    lastSuccessfulFetchAt: string | null;
    lastSuccessfulParsedAt: string | null;
    isCached: boolean;
    error?: string | null;
  }> {
    const res = await this.fetchNormalizedResult();
    const lastAttemptAt = res.lastAttemptAt;
    const lastSuccessfulFetchAt = res.lastSuccessfulAt;
    const lastSuccessfulParsedAt = res.parsedAt;
    const isCached = res.status === 'stale';

    if (res.status === 'unavailable') {
      return {
        status: 'UNAVAILABLE',
        matchedWarnings: [],
        activeAlertsCount: 0,
        lastAttemptAt,
        lastSuccessfulFetchAt,
        lastSuccessfulParsedAt,
        isCached,
        error: res.error,
      };
    }

    const area = this.resolveArea(opts.city, opts.district, opts.state, undefined, opts.lat, opts.lng);
    const matchedWarnings = this.matchAlertsForArea(res.alerts, area, opts.lat, opts.lng);
    return {
      status: 'SUCCESS',
      matchedWarnings,
      activeAlertsCount: res.activeAlerts,
      lastAttemptAt,
      lastSuccessfulFetchAt,
      lastSuccessfulParsedAt,
      isCached,
      error: null,
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
