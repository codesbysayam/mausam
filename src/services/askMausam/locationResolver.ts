// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Indian Geographic Location Resolver
// Maps natural language queries to canonical Indian States, UTs & Districts
// Zero-Discrepancy Coordinate & Boundary Verification
// ====================================================================

import { INDIA_STATES_UTS, IndiaRegion, getRegionByName } from '../../data/indiaRegions';
import { LocationMetadata, ConversationMemoryState } from '../../types/askMausam';

export interface LocationResolutionResult {
  primaryLocation: LocationMetadata;
  secondaryLocation?: LocationMetadata;
  isComparison: boolean;
  resolutionType: 'EXPLICIT_QUERY' | 'SELECTED_LOCATION' | 'FOLLOW_UP_MEMORY' | 'DEFAULT';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  matchedRegion?: IndiaRegion;
}

function toTitleCase(str: string): string {
  return str.replace(/\b[a-z]/g, (char) => char.toUpperCase());
}

/**
 * Converts an IndiaRegion and optional sub-location into canonical LocationMetadata
 */
const STOPWORDS = new Set(['or', 'and', 'in', 'is', 'at', 'to', 'of', 'for', 'the', 'a', 'an', 'as', 'on', 'by', 'with', 'now', 'today', 'how', 'me']);

export function locationToMetadata(region: IndiaRegion, specificPlace?: string): LocationMetadata {
  const formattedPlace = specificPlace ? toTitleCase(specificPlace) : undefined;
  return {
    name: formattedPlace && formattedPlace.toLowerCase() !== region.name.toLowerCase()
      ? `${formattedPlace}, ${region.name}`
      : region.name,
    district: formattedPlace || region.representativeCity,
    state: region.type === 'STATE' ? region.name : undefined,
    unionTerritory: region.type === 'UNION_TERRITORY' ? region.name : undefined,
    country: 'India',
    latitude: region.latitude,
    longitude: region.longitude,
    timezone: 'Asia/Kolkata',
    imdStationCode: region.code,
    imdStationName: `${region.capital} Meteorological Centre`,
  };
}

/**
 * Resolves user query text into canonical Indian geographical coordinates
 */
export function resolveLocation(
  query: string,
  selectedAppLocation?: { name?: string; city?: string; state?: string; lat?: number; lng?: number; district?: string },
  memory?: ConversationMemoryState
): LocationResolutionResult {
  const q = (query || '').trim();
  const qLower = ` ${q.toLowerCase().replace(/[^a-z0-9\s]/g, ' ')} `;

  // 1. Scan for all Indian states, UTs, capitals, and district aliases
  const detectedPlaces: Array<{ region: IndiaRegion; matchedWord: string; index: number }> = [];

  for (const region of INDIA_STATES_UTS) {
    const candidates = [
      region.name.toLowerCase(),
      region.code.toLowerCase(),
      region.representativeCity.toLowerCase(),
      region.capital.toLowerCase(),
      ...region.aliases.map((a) => a.toLowerCase()),
      ...(region.districts || []).map((d) => d.toLowerCase()),
    ];

    for (const cand of candidates) {
      if (cand.length < 2) continue; // Skip single letters
      if (cand.length <= 2 && STOPWORDS.has(cand)) continue; // Skip common English conjunctions and prepositions like 'or', 'in', 'as'
      // Use boundary-safe word matching
      const regex = new RegExp(`\\b${cand}\\b`, 'i');
      const match = qLower.match(regex);
      if (match && match.index !== undefined) {
        // Prevent duplicate addition of identical word or overlapping index
        const alreadyCovered = detectedPlaces.some(
          (d) =>
            d.matchedWord.toLowerCase() === cand.toLowerCase() ||
            (Math.abs(d.index - match.index!) < 4 && d.matchedWord.toLowerCase().includes(cand.toLowerCase()))
        );
        if (!alreadyCovered) {
          detectedPlaces.push({
            region,
            matchedWord: cand,
            index: match.index,
          });
        }
      }
    }
  }

  // Sort by appearance in user query
  detectedPlaces.sort((a, b) => a.index - b.index);

  // Multi-location comparison check (e.g. "Bhubaneswar or Cuttack", "Delhi vs Mumbai")
  if (detectedPlaces.length >= 2) {
    const p1 = detectedPlaces[0];
    const p2 = detectedPlaces[1];

    const hasExplicitComparison = /\b(vs|versus|compare|comparing|comparison|or|cooler|warmer|hotter|difference)\b/i.test(q);

    // If one place is a district/sub-place and the other is its enclosing State (e.g. "Chandaka, Odisha", "Anand Vihar, Delhi")
    // and there is no comparison keyword, treat as a single resolved sub-location!
    const isStateAndSubPlace =
      p1.region.id === p2.region.id &&
      (p1.matchedWord.toLowerCase() === p1.region.name.toLowerCase() ||
       p2.matchedWord.toLowerCase() === p2.region.name.toLowerCase());

    if (!hasExplicitComparison && isStateAndSubPlace) {
      const subPlace = p1.matchedWord.toLowerCase() === p1.region.name.toLowerCase()
        ? p2.matchedWord
        : p1.matchedWord;
      return {
        primaryLocation: locationToMetadata(p1.region, subPlace),
        isComparison: false,
        resolutionType: 'EXPLICIT_QUERY',
        confidence: 'HIGH',
        matchedRegion: p1.region,
      };
    }

    return {
      primaryLocation: locationToMetadata(p1.region, p1.matchedWord),
      secondaryLocation: locationToMetadata(p2.region, p2.matchedWord),
      isComparison: true,
      resolutionType: 'EXPLICIT_QUERY',
      confidence: 'HIGH',
      matchedRegion: p1.region,
    };
  }

  // 2. Single explicit region or district in user query
  if (detectedPlaces.length === 1) {
    const match = detectedPlaces[0];
    return {
      primaryLocation: locationToMetadata(match.region, match.matchedWord),
      isComparison: false,
      resolutionType: 'EXPLICIT_QUERY',
      confidence: 'HIGH',
      matchedRegion: match.region,
    };
  }

  // 3. Conversation memory persistence (if query lacks location, inherit current active location)
  if (memory?.previousLocation && !detectedPlaces.length) {
    return {
      primaryLocation: memory.previousLocation,
      isComparison: false,
      resolutionType: 'FOLLOW_UP_MEMORY',
      confidence: 'HIGH',
      matchedRegion: getRegionByName(memory.previousLocation.state || memory.previousLocation.name),
    };
  }

  // 4. Currently selected MAUSAM location in the app
  if (selectedAppLocation && typeof selectedAppLocation.lat === 'number' && typeof selectedAppLocation.lng === 'number') {
    const appRegion = selectedAppLocation.state ? getRegionByName(selectedAppLocation.state) : undefined;
    const name = selectedAppLocation.city || selectedAppLocation.name || 'Current Location';
    return {
      primaryLocation: {
        name,
        district: selectedAppLocation.district || selectedAppLocation.city,
        state: selectedAppLocation.state,
        latitude: selectedAppLocation.lat,
        longitude: selectedAppLocation.lng,
        timezone: 'Asia/Kolkata',
      },
      isComparison: false,
      resolutionType: 'SELECTED_LOCATION',
      confidence: 'HIGH',
      matchedRegion: appRegion,
    };
  }

  // 5. Default location (Bhubaneswar, Odisha)
  const defaultRegion = getRegionByName('Odisha') || INDIA_STATES_UTS[18];
  return {
    primaryLocation: locationToMetadata(defaultRegion, 'Bhubaneswar'),
    isComparison: false,
    resolutionType: 'DEFAULT',
    confidence: 'MEDIUM',
    matchedRegion: defaultRegion,
  };
}
