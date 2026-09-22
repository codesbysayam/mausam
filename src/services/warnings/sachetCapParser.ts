// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Official SACHET / NDMA CAP & RSS XML Feed Parser
// Truthful, expiry-aware, crash-proof parsing of meteorological bulletins
// ====================================================================

import {
  WeatherWarning,
  WarningHazard,
  WarningSeverity,
  WarningStatus,
  WarningSource,
} from '../../types/warnings';
import { INDIA_STATES_UTS, IndiaRegion } from '../../data/indiaRegions';

export interface ParsedFeedResult {
  warnings: WeatherWarning[];
  activeCount: number;
  expiredCount: number;
  rawCount: number;
  parserType: 'CAP_XML' | 'RSS_XML' | 'JSON' | 'UNKNOWN';
}

const COMMON_WORD_STOPLIST = new Set([
  'an', 'in', 'or', 'as', 'is', 'at', 'to', 'go', 'up', 'so', 'it', 'no', 'on', 'by', 'of', 'and', 'all', 'for', 'met', 'cap'
]);

// Official State Disaster Management Authorities & IMD Regional Centers mapping
const AGENCY_STATE_MAP: Record<string, string> = {
  'andhra pradesh sdma': 'Andhra Pradesh',
  'andhra pradesh': 'Andhra Pradesh',
  'ఆంధ్రప్రదేశ్': 'Andhra Pradesh',
  'आंध्र प्रदेश': 'Andhra Pradesh',
  'odisha sdma': 'Odisha',
  'assam sdma': 'Assam',
  'maharashtra sdma': 'Maharashtra',
  'मंत्रालय, मुंबई': 'Maharashtra',
  'मंत्रालय मुंबई': 'Maharashtra',
  'mantralaya, mumbai': 'Maharashtra',
  'महाराष्ट्र शासन': 'Maharashtra',
  'महाराष्ट्र': 'Maharashtra',
  'kerala sdma': 'Kerala',
  'karnataka sdma': 'Karnataka',
  'ଓଡ଼ିଶା': 'Odisha',
  'ଓଡିଶା': 'Odisha',
  'পশ্চিমবঙ্গ': 'West Bengal',
  'ગુજરાત': 'Gujarat',
  'తెలంగాణ': 'Telangana',
  'కర్ణాటక': 'Karnataka',
  'தமிழ்நாடு': 'Tamil Nadu',
  'കേരളം': 'Kerala',
  asdma: 'Assam',
  osdma: 'Odisha',
  apsdma: 'Andhra Pradesh',
  ksdma: 'Kerala',
  msdma: 'Maharashtra',
  gsdma: 'Gujarat',
  bsdma: 'Bihar',
  upsdma: 'Uttar Pradesh',
  uksdma: 'Uttarakhand',
  hpsdma: 'Himachal Pradesh',
  tnsdma: 'Tamil Nadu',
  tgdma: 'Telangana',
  wbsdma: 'West Bengal',
  jsdma: 'Jharkhand',
  mpsdma: 'Madhya Pradesh',
  'imd guwahati': 'Assam',
  'imd mumbai': 'Maharashtra',
  'imd bengaluru': 'Karnataka',
  'imd bhubaneswar': 'Odisha',
  'imd kolkata': 'West Bengal',
  'imd chennai': 'Tamil Nadu',
  'imd hyderabad': 'Telangana',
  'imd new delhi': 'Delhi',
  'imd delhi': 'Delhi',
  'imd shimla': 'Himachal Pradesh',
  'imd srinagar': 'Jammu and Kashmir',
  'imd dehradun': 'Uttarakhand',
  'imd patna': 'Bihar',
  'imd jaipur': 'Rajasthan',
  'imd lucknow': 'Uttar Pradesh',
  'imd bhopal': 'Madhya Pradesh',
  'imd thiruvananthapuram': 'Kerala',
  'imd amaravati': 'Andhra Pradesh',
  'imd panaji': 'Goa',
  'imd agartala': 'Tripura',
  'imd gangtok': 'Sikkim',
  'imd ranchi': 'Jharkhand',
  'imd raipur': 'Chhattisgarh',
  'imd chandigarh': 'Chandigarh',
};

/**
 * Safely parse any SACHET/NDMA feed content (CAP XML, RSS XML, or JSON)
 */
export function parseSachetFeed(
  content: string | object,
  fetchedAtIso: string = new Date().toISOString()
): ParsedFeedResult {
  if (!content) {
    return {
      warnings: [],
      activeCount: 0,
      expiredCount: 0,
      rawCount: 0,
      parserType: 'UNKNOWN',
    };
  }

  // 1. If object or JSON string
  if (typeof content === 'object') {
    return parseJsonPayload(content, fetchedAtIso);
  }

  const trimmed = content.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      return parseJsonPayload(parsed, fetchedAtIso);
    } catch {
      // Not JSON, continue to XML
    }
  }

  // 2. Direct CAP XML (<cap:alert> or <alert>)
  if (trimmed.includes('<cap:alert') || trimmed.includes('<alert')) {
    return parseCapXml(trimmed, fetchedAtIso);
  }

  // 3. RSS 2.0 / Atom XML feed
  if (trimmed.includes('<rss') || trimmed.includes('<channel') || trimmed.includes('<item')) {
    return parseRssXml(trimmed, fetchedAtIso);
  }

  return {
    warnings: [],
    activeCount: 0,
    expiredCount: 0,
    rawCount: 0,
    parserType: 'UNKNOWN',
  };
}

/**
 * Parse standard CAP v1.2 XML document
 */
function parseCapXml(xml: string, fetchedAt: string): ParsedFeedResult {
  const warnings: WeatherWarning[] = [];
  const alertBlocks = xml.match(/<(?:cap:)?alert[\s\S]*?<\/(?:cap:)?alert>/gi) || [xml];
  const nowMs = Date.now();

  for (let i = 0; i < alertBlocks.length; i++) {
    const block = alertBlocks[i];
    try {
      const id = extractXmlTag(block, 'identifier') || `cap-alert-${Date.now()}-${i}`;
      const sender = extractXmlTag(block, 'sender') || 'NDMA/SACHET';
      const sent = extractXmlTag(block, 'sent');
      const statusRaw = extractXmlTag(block, 'status') || 'Actual';
      const msgType = extractXmlTag(block, 'msgType') || 'Alert';

      const infoBlocks = block.match(/<(?:cap:)?info[\s\S]*?<\/(?:cap:)?info>/gi) || [block];

      for (const info of infoBlocks) {
        const headline = extractXmlTag(info, 'headline') || extractXmlTag(block, 'title') || 'Severe Weather Warning';
        const description = extractXmlTag(info, 'description') || headline;
        const instruction = extractXmlTag(info, 'instruction');
        const event = extractXmlTag(info, 'event') || headline;
        const severityRaw = extractXmlTag(info, 'severity');
        const urgency = extractXmlTag(info, 'urgency');
        const certainty = extractXmlTag(info, 'certainty');
        const category = extractXmlTag(info, 'category') || 'Met';

        const effective = extractXmlTag(info, 'effective') || sent;
        const onset = extractXmlTag(info, 'onset') || effective;
        const expires = extractXmlTag(info, 'expires');

        // Extract area
        const areaDesc = extractXmlTag(info, 'areaDesc');
        const areaBlocks = info.match(/<(?:cap:)?area[\s\S]*?<\/(?:cap:)?area>/gi) || [];
        const areasFromTags: string[] = [];
        for (const ab of areaBlocks) {
          const desc = extractXmlTag(ab, 'areaDesc');
          if (desc) areasFromTags.push(desc);
        }

        const combinedText = `${headline} ${description} ${areaDesc} ${areasFromTags.join(' ')} ${sender}`;
        const { state, district, subdivision, allRegions } = resolveGeographicRegions(combinedText, areasFromTags);

        const hazard = detectHazard(event, headline, description);
        const severity = normalizeSeverity(severityRaw, headline, description);

        // Date validation & expiry calculation
        const issuedIso = parseIsoSafe(sent || effective || fetchedAt);
        const effectiveIso = effective ? parseIsoSafe(effective) : issuedIso;
        const validUntilIso = expires ? parseIsoSafe(expires) : computeDefaultExpiryIso(issuedIso, headline);

        let status: WarningStatus = 'ACTIVE';
        if (msgType.toLowerCase() === 'cancel' || statusRaw.toLowerCase() === 'cancelled') {
          status = 'CANCELLED';
        } else if (validUntilIso) {
          const expiresMs = new Date(validUntilIso).getTime();
          if (!isNaN(expiresMs) && expiresMs < nowMs) {
            status = 'EXPIRED';
          }
        }

        const source = determineSource(sender, headline);
        const sourceUrl = extractXmlTag(info, 'value') || `https://sachet.ndma.gov.in/cap_public_website/FetchXMLFile?identifier=${id}`;

        const instructionsList = instruction
          ? instruction
              .split(/(?<=[.!?])\s+/)
              .map((s) => s.trim())
              .filter((s) => s.length > 5)
          : [];

        warnings.push({
          id,
          source,
          sourceUrl,
          title: headline,
          description,
          hazard,
          severity,
          status,
          issuedAt: issuedIso,
          effectiveFrom: effectiveIso,
          validUntil: validUntilIso,
          state,
          district,
          subdivision: subdivision || state,
          affectedRegions: allRegions.length > 0 ? allRegions : [state || 'India'],
          instructions: instructionsList.length > 0 ? instructionsList : undefined,
          rawSourceId: id,
          rawUpdatedAt: sent,
          fetchedAt,
          sender,
          category,
          certainty,
          urgency,
          rawSeverityText: severityRaw,
        });
      }
    } catch {
      // Ignore individual corrupted block to preserve overall feed
    }
  }

  const activeCount = warnings.filter((w) => w.status === 'ACTIVE').length;
  const expiredCount = warnings.filter((w) => w.status === 'EXPIRED').length;

  return {
    warnings,
    activeCount,
    expiredCount,
    rawCount: warnings.length,
    parserType: 'CAP_XML',
  };
}

/**
 * Parse standard RSS 2.0 XML feed with embedded CAP or item elements
 */
function parseRssXml(xml: string, fetchedAt: string): ParsedFeedResult {
  const warnings: WeatherWarning[] = [];
  const items = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  const nowMs = Date.now();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    try {
      const title = extractXmlTag(item, 'title');
      const description = extractXmlTag(item, 'description') || title;
      const link = extractXmlTag(item, 'link') || 'https://sachet.ndma.gov.in';
      const guid = extractXmlTag(item, 'guid') || `sachet-rss-${Date.now()}-${i}`;
      const pubDate = extractXmlTag(item, 'pubDate');
      const author = extractXmlTag(item, 'author') || 'NDMA/SACHET';
      const category = extractXmlTag(item, 'category') || 'Met';

      // Check for embedded CAP tags
      const capEvent = extractXmlTag(item, 'cap:event') || extractXmlTag(item, 'event');
      const capSeverity = extractXmlTag(item, 'cap:severity') || extractXmlTag(item, 'severity');
      const capHeadline = extractXmlTag(item, 'cap:headline') || extractXmlTag(item, 'headline');
      const capAreaDesc = extractXmlTag(item, 'cap:areaDesc') || extractXmlTag(item, 'areaDesc');
      const capExpires = extractXmlTag(item, 'cap:expires') || extractXmlTag(item, 'expires');
      const capEffective = extractXmlTag(item, 'cap:effective') || extractXmlTag(item, 'effective');
      const capInstruction = extractXmlTag(item, 'cap:instruction') || extractXmlTag(item, 'instruction');

      const headline = capHeadline || title || 'Meteorological Hazard Bulletin';
      const desc = description || capInstruction || headline;
      const combinedText = `${headline} ${desc} ${capAreaDesc || ''} ${author}`;

      const { state, district, subdivision, allRegions } = resolveGeographicRegions(combinedText, [capAreaDesc].filter(Boolean));
      const hazard = detectHazard(capEvent || headline, headline, desc);
      const severity = normalizeSeverity(capSeverity, headline, desc);

      const issuedIso = parseIsoSafe(pubDate || fetchedAt);
      const effectiveIso = capEffective ? parseIsoSafe(capEffective) : issuedIso;
      const validUntilIso = capExpires ? parseIsoSafe(capExpires) : computeDefaultExpiryIso(issuedIso, headline);

      let status: WarningStatus = 'ACTIVE';
      if (validUntilIso) {
        const expiresMs = new Date(validUntilIso).getTime();
        if (!isNaN(expiresMs) && expiresMs < nowMs) {
          status = 'EXPIRED';
        }
      }

      const source = determineSource(author, headline);
      const instructionsList = capInstruction
        ? capInstruction
            .split(/(?<=[.!?])\s+/)
            .map((s) => s.trim())
            .filter((s) => s.length > 5)
        : [];

      warnings.push({
        id: guid,
        source,
        sourceUrl: link,
        title: headline,
        description: desc,
        hazard,
        severity,
        status,
        issuedAt: issuedIso,
        effectiveFrom: effectiveIso,
        validUntil: validUntilIso,
        state,
        district,
        subdivision: subdivision || state,
        affectedRegions: allRegions.length > 0 ? allRegions : [state || 'India'],
        instructions: instructionsList.length > 0 ? instructionsList : undefined,
        rawSourceId: guid,
        rawUpdatedAt: pubDate,
        fetchedAt,
        sender: author,
        category,
        rawSeverityText: capSeverity || severity,
      });
    } catch {
      // Skip bad item
    }
  }

  const activeCount = warnings.filter((w) => w.status === 'ACTIVE').length;
  const expiredCount = warnings.filter((w) => w.status === 'EXPIRED').length;

  return {
    warnings,
    activeCount,
    expiredCount,
    rawCount: items.length,
    parserType: 'RSS_XML',
  };
}

/**
 * Parse direct JSON payload from SACHET FetchAlertDetails
 */
function parseJsonPayload(json: any, fetchedAt: string): ParsedFeedResult {
  const rawList: any[] = Array.isArray(json)
    ? json
    : json?.alerts || json?.data || json?.results || [];

  const warnings: WeatherWarning[] = [];
  const nowMs = Date.now();

  for (let i = 0; i < rawList.length; i++) {
    const item = rawList[i];
    try {
      const id = String(item.identifier || item.alert_id || item.id || `sachet-json-${i}`);
      const headline = item.headline || item.title || item.event || 'Severe Weather Warning';
      const description = item.description || item.desc || item.instruction || headline;
      const combined = `${headline} ${description} ${item.areaDesc || ''} ${item.district || ''} ${item.state || ''} ${item.sender || ''} ${item.source || ''}`;

      const { state, district, subdivision, allRegions } = resolveGeographicRegions(
        combined,
        [item.areaDesc, item.district, item.state].filter(Boolean)
      );
      const hazard = detectHazard(item.event || headline, headline, description);
      const severity = normalizeSeverity(item.severity || item.severity_color, headline, description);

      const issuedIso = parseIsoSafe(item.sent || item.issuedAt || item.published || fetchedAt);
      const effectiveIso = item.effective ? parseIsoSafe(item.effective) : issuedIso;
      const validUntilIso = item.expires ? parseIsoSafe(item.expires) : computeDefaultExpiryIso(issuedIso, headline);

      let status: WarningStatus = 'ACTIVE';
      if (item.status === 'Cancelled' || item.msgType === 'Cancel') {
        status = 'CANCELLED';
      } else if (validUntilIso) {
        const expiresMs = new Date(validUntilIso).getTime();
        if (!isNaN(expiresMs) && expiresMs < nowMs) {
          status = 'EXPIRED';
        }
      }

      const source = determineSource(item.sender || item.source, headline);
      const sourceUrl = item.sourceUrl || item.link || `https://sachet.ndma.gov.in/cap_public_website/FetchAlertDetails?id=${id}`;

      warnings.push({
        id,
        source,
        sourceUrl,
        title: headline,
        description,
        hazard,
        severity,
        status,
        issuedAt: issuedIso,
        effectiveFrom: effectiveIso,
        validUntil: validUntilIso,
        state,
        district,
        subdivision: subdivision || state,
        affectedRegions: allRegions.length > 0 ? allRegions : [state || 'India'],
        instructions: item.instruction ? [item.instruction] : undefined,
        rawSourceId: id,
        rawUpdatedAt: item.sent || item.issuedAt,
        fetchedAt,
        sender: item.sender,
        category: item.category || 'Met',
        rawSeverityText: item.severity,
      });
    } catch {
      // Continue
    }
  }

  const activeCount = warnings.filter((w) => w.status === 'ACTIVE').length;
  const expiredCount = warnings.filter((w) => w.status === 'EXPIRED').length;

  return {
    warnings,
    activeCount,
    expiredCount,
    rawCount: rawList.length,
    parserType: 'JSON',
  };
}

/**
 * Extract text from XML tag supporting namespaces and CDATA
 */
function extractXmlTag(xml: string, tag: string): string {
  if (!xml) return '';
  const cleanTag = tag.replace(/^cap:/, '');
  const cdataRegex = new RegExp(
    `<(?:cap:)?${cleanTag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/(?:cap:)?${cleanTag}>`,
    'i'
  );
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch && cdataMatch[1]) {
    return cdataMatch[1].trim();
  }

  const standardRegex = new RegExp(
    `<(?:cap:)?${cleanTag}[^>]*>([\\s\\S]*?)<\\/(?:cap:)?${cleanTag}>`,
    'i'
  );
  const match = xml.match(standardRegex);
  if (match && match[1]) {
    return match[1].replace(/<[^>]+>/g, '').trim();
  }
  return '';
}

/**
 * Detect authoritative hazard type from text with strict precedence
 */
function detectHazard(event: string, headline: string, desc: string): WarningHazard {
  const combined = `${event} ${headline} ${desc}`.toLowerCase();

  // 1. Extreme Cyclonic Storm / Cyclone (strict regex, NOT matching thunderstorm!)
  if (/\b(cyclone|cyclonic|deep depression|depression)\b/.test(combined)) {
    return 'CYCLONE';
  }

  // 2. Lightning & Thunderstorm
  if (
    /\b(lightning)\b/.test(combined) ||
    combined.includes('పిడుగులు') ||
    combined.includes('విజుଳి') ||
    combined.includes('ବିଜୁଳି') ||
    combined.includes('विजा') ||
    combined.includes('बिजली')
  ) {
    return 'LIGHTNING';
  }
  if (
    /\b(thunderstorm|thundershower)\b/.test(combined) ||
    combined.includes('ଘଡ଼ଘଡ଼ି') ||
    combined.includes('ఉరుములు') ||
    combined.includes('कडकडाट') ||
    combined.includes('वादळ') ||
    combined.includes('आंधी')
  ) {
    return 'THUNDERSTORM';
  }

  // 3. Heavy Rainfall Tiers
  if (/\b(extremely heavy rain|red alert rain)\b/.test(combined)) {
    return 'EXTREMELY_HEAVY_RAIN';
  }
  if (/\b(very heavy rain|very heavy precipitation)\b/.test(combined)) {
    return 'VERY_HEAVY_RAIN';
  }
  if (
    /\b(heavy rain|downpour|rainfall)\b/.test(combined) ||
    combined.includes('पाऊस') ||
    combined.includes('వర్షం') ||
    combined.includes('ବର୍ଷା') ||
    combined.includes('बारिश')
  ) {
    return 'HEAVY_RAIN';
  }

  // 4. Inundation / Floods
  if (/\b(flood|inundation|waterlogging)\b/.test(combined)) {
    return 'FLOOD';
  }

  // 5. Temperature extremes
  if (/\b(heat wave|heatwave|loo)\b/.test(combined)) {
    return 'HEAT_WAVE';
  }
  if (/\b(cold wave|coldwave|frost)\b/.test(combined)) {
    return 'COLD_WAVE';
  }

  // 6. Atmospheric visibility
  if (/\b(dense fog|fog|smog)\b/.test(combined)) {
    return 'FOG';
  }
  if (/\b(dust storm|sand storm|squall|gale)\b/.test(combined)) {
    return 'DUST_STORM';
  }

  // 7. Geotechnical & Marine
  if (/\b(landslide|mudslide)\b/.test(combined)) {
    return 'LANDSLIDE';
  }
  if (/\b(tsunami)\b/.test(combined)) {
    return 'TSUNAMI';
  }
  if (/\b(high wave|rough sea|swell|coastal)\b/.test(combined)) {
    return 'HIGH_WAVES';
  }

  return 'OTHER';
}

/**
 * Normalize severity to canonical 5-tier enum with contextual safety
 */
function normalizeSeverity(raw?: string, headline: string = '', desc: string = ''): WarningSeverity {
  const text = `${raw || ''} ${headline} ${desc}`.toLowerCase();

  if (/\b(red alert|red|extreme|take action)\b/.test(text)) {
    return 'RED';
  }
  if (/\b(orange alert|orange|amber|be prepared|very heavy rain)\b/.test(text)) {
    return 'ORANGE';
  }
  if (/\b(yellow alert|yellow|watch|be updated|moderate|advisory|light to moderate|thunderstorm|lightning)\b/.test(text)) {
    return 'YELLOW';
  }
  if (/\b(green|all clear|clear|no warning|routine)\b/.test(text)) {
    return 'GREEN';
  }

  return 'YELLOW';
}

/**
 * Determine issuing authority source
 */
function determineSource(sender?: string, headline?: string): WarningSource {
  const combined = `${sender || ''} ${headline || ''}`.toLowerCase();
  if (combined.includes('imd') || combined.includes('meteorological department')) {
    return 'IMD';
  }
  if (combined.includes('cwc') || combined.includes('central water commission')) {
    return 'CWC';
  }
  if (combined.includes('incois')) {
    return 'INCOIS';
  }
  return 'SACHET_NDMA';
}

/**
 * Match text against canonical India states and districts registry
 * with whole-word regex and agency mapping
 */
function resolveGeographicRegions(
  text: string,
  hints: string[] = []
): {
  state?: string;
  district?: string;
  subdivision?: string;
  allRegions: string[];
} {
  const lowerText = ` ${text} ${hints.join(' ')} `.toLowerCase();
  const foundRegions: string[] = [];
  let matchedState: IndiaRegion | undefined;
  let matchedDistrict: string | undefined;

  // 1. Check known Agency/Center mapping (e.g. ASDMA -> Assam, IMD Mumbai -> Maharashtra)
  for (const [key, stateName] of Object.entries(AGENCY_STATE_MAP)) {
    if (lowerText.includes(key)) {
      const reg = INDIA_STATES_UTS.find((r) => r.name.toLowerCase() === stateName.toLowerCase());
      if (reg) {
        matchedState = reg;
        foundRegions.push(reg.name);
        break;
      }
    }
  }

  // 2. Match District first across India registry (districts are highly specific)
  for (const state of INDIA_STATES_UTS) {
    if (!state.districts) continue;
    for (const dist of state.districts) {
      const distLower = dist.toLowerCase();
      // Ensure whole word boundary
      const distRegex = new RegExp(`\\b${escapeRegExp(distLower)}\\b`, 'i');
      if (distRegex.test(lowerText)) {
        matchedDistrict = dist;
        foundRegions.push(dist);
        if (!matchedState) {
          matchedState = state;
          foundRegions.push(state.name);
        }
        break;
      }
    }
    if (matchedDistrict && matchedState) break;
  }

  // 3. Match State/UT full names and multi-character aliases (strictly whole-word)
  if (!matchedState) {
    for (const reg of INDIA_STATES_UTS) {
      const nameRegex = new RegExp(`\\b${escapeRegExp(reg.name.toLowerCase())}\\b`, 'i');
      if (nameRegex.test(lowerText)) {
        matchedState = reg;
        foundRegions.push(reg.name);
        break;
      }

      // Check aliases that are NOT stop words
      for (const alias of reg.aliases) {
        const aliasLower = alias.toLowerCase().trim();
        if (aliasLower.length >= 3 && !COMMON_WORD_STOPLIST.has(aliasLower)) {
          const aliasRegex = new RegExp(`\\b${escapeRegExp(aliasLower)}\\b`, 'i');
          if (aliasRegex.test(lowerText)) {
            matchedState = reg;
            foundRegions.push(reg.name);
            break;
          }
        }
      }
      if (matchedState) break;
    }
  }

  // 4. Add hints
  for (const hint of hints) {
    if (hint && !foundRegions.includes(hint)) {
      foundRegions.push(hint);
    }
  }

  return {
    state: matchedState?.name,
    district: matchedDistrict,
    subdivision: matchedState?.name,
    allRegions: Array.from(new Set(foundRegions)),
  };
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Safe ISO timestamp parser
 */
function parseIsoSafe(dateStr?: string): string {
  if (!dateStr) return new Date().toISOString();
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString();
    }
  } catch {
    // Fallback
  }
  return new Date().toISOString();
}

/**
 * Compute realistic validUntil if the bulletin does not specify exact cap:expires
 */
function computeDefaultExpiryIso(issuedIso: string, text: string): string {
  const issuedMs = new Date(issuedIso).getTime();
  const baseMs = isNaN(issuedMs) ? Date.now() : issuedMs;
  const lower = text.toLowerCase();

  let validityHours = 6; // default 6h nowcast / synoptic validity window

  if (lower.includes('next 1-2 hours') || lower.includes('next 1/2-2 hours') || lower.includes('next 2 hours')) {
    validityHours = 2;
  } else if (lower.includes('next 3 hours') || lower.includes('३ तासांत') || lower.includes('ତିନି ଘଣ୍ଟା')) {
    validityHours = 3;
  } else if (lower.includes('next 6 hours')) {
    validityHours = 6;
  } else if (lower.includes('next 24 hours') || lower.includes('today')) {
    validityHours = 24;
  } else if (lower.includes('next 48 hours')) {
    validityHours = 48;
  }

  return new Date(baseMs + validityHours * 3600 * 1000).toISOString();
}
