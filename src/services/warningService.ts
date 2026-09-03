import {
  WarningRecord,
  WarningFilterState,
  WarningStats,
  AlertSeverity,
  StateWarningSummary,
  EmergencyHelpline,
  IndiaMetRegion,
} from '../types/warningTypes';
import {
  NATIONAL_WARNINGS_DATABASE,
  STATE_ALERT_SEVERITIES,
  EMERGENCY_HELPLINES,
  STATE_DISASTER_NUMBERS,
} from '../data/nationalWarningsData';
import { LocationRecord } from '../types';

class WarningService {
  /**
   * Filter the warnings database based on user selections
   */
  filterWarnings(
    warnings: WarningRecord[],
    filter: WarningFilterState
  ): WarningRecord[] {
    return warnings.filter((warn) => {
      // Region filter
      if (filter.region !== 'all' && warn.region !== filter.region) {
        return false;
      }

      // State filter
      if (filter.state && filter.state !== 'all') {
        const target = filter.state.toLowerCase();
        const warnState = warn.state.toLowerCase();
        const warnCode = warn.stateCode.toLowerCase();
        if (warnState !== target && warnCode !== target && !warnState.includes(target)) {
          return false;
        }
      }

      // Hazard Category filter
      if (filter.hazard !== 'all' && warn.hazardCategory !== filter.hazard) {
        return false;
      }

      // Severity filter
      if (filter.severity !== 'all' && warn.severity !== filter.severity) {
        return false;
      }

      // Validity filter
      if (filter.validity !== 'all') {
        const now = Date.now();
        if (filter.validity === 'active_now') {
          if (warn.validityTimestamp && warn.validityTimestamp < now) {
            return false;
          }
        }
      }

      // Search query filter (matches title, state, district, hazard, description, bulletin)
      if (filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLowerCase().trim();
        const matchTitle = warn.title.toLowerCase().includes(query);
        const matchState = warn.state.toLowerCase().includes(query);
        const matchSubdiv = warn.subdivision.toLowerCase().includes(query);
        const matchHazard = warn.hazardLabel.toLowerCase().includes(query);
        const matchDistricts = warn.affectedDistricts.some((d) =>
          d.toLowerCase().includes(query)
        );
        const matchBulletin = warn.bulletinNo.toLowerCase().includes(query);
        const matchDesc = warn.description.toLowerCase().includes(query);

        if (
          !matchTitle &&
          !matchState &&
          !matchSubdiv &&
          !matchHazard &&
          !matchDistricts &&
          !matchBulletin &&
          !matchDesc
        ) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Calculate real-time stats across national bulletins
   */
  calculateStats(warnings: WarningRecord[]): WarningStats {
    let severeRed = 0;
    let moderateOrange = 0;
    let advisoryYellow = 0;
    let infoPurple = 0;
    const statesSet = new Set<string>();

    warnings.forEach((w) => {
      if (w.severity === 'red') severeRed++;
      else if (w.severity === 'orange') moderateOrange++;
      else if (w.severity === 'yellow') advisoryYellow++;
      else if (w.severity === 'purple') infoPurple++;

      if (w.severity !== 'green') {
        statesSet.add(w.stateCode);
      }
    });

    const now = new Date();
    const lastUpdatedIst = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(now);

    return {
      totalActive: severeRed + moderateOrange + advisoryYellow + infoPurple,
      statesAffected: statesSet.size,
      severeRed,
      moderateOrange,
      advisoryYellow,
      infoPurple,
      greenNormalStates: 36 - statesSet.size,
      lastUpdatedIst: `${lastUpdatedIst} IST`,
    };
  }

  /**
   * Get overall highest national alert status
   */
  getNationalOverallStatus(warnings: WarningRecord[]): {
    severity: AlertSeverity;
    badgeLabel: string;
    headline: string;
    description: string;
    statusColor: string;
  } {
    const hasRed = warnings.some((w) => w.severity === 'red');
    const hasOrange = warnings.some((w) => w.severity === 'orange');
    const hasYellow = warnings.some((w) => w.severity === 'yellow');

    if (hasRed) {
      const redCount = warnings.filter((w) => w.severity === 'red').length;
      return {
        severity: 'red',
        badgeLabel: 'RED ALERT — ACTIVE SEVERE WEATHER',
        headline: 'NATIONAL WEATHER WARNING: SEVERE ADVISORIES ACTIVE',
        description: `IMD has issued Red Warnings across ${redCount} meteorological sub-divisions (Odisha Coast, Brahmaputra Basin & Meghalaya). Disaster relief teams (NDRF/SDRF) on active emergency footing.`,
        statusColor: '#FF0000',
      };
    }

    if (hasOrange) {
      return {
        severity: 'orange',
        badgeLabel: 'ORANGE ALERT — BE PREPARED',
        headline: 'NATIONAL WEATHER STATUS: MODERATE WARNINGS IN EFFECT',
        description:
          'Moderate to heavy precipitation and coastal swell warnings active across Western Ghats and coastal sectors. Public advised to monitor regional bulletins.',
        statusColor: '#FFA500',
      };
    }

    if (hasYellow) {
      return {
        severity: 'yellow',
        badgeLabel: 'YELLOW WATCH — BE UPDATED',
        headline: 'NATIONAL WEATHER STATUS: SCATTERED ADVISORIES ISSUED',
        description:
          'Scattered weather watches in effect for isolated thunderstorm activity and thermal variations. Routine precautions recommended.',
        statusColor: '#FFFF00',
      };
    }

    return {
      severity: 'green',
      badgeLabel: 'GREEN — NORMAL / NO SEVERE WEATHER',
      headline: 'NATIONAL WEATHER STATUS: SYNOPTIC ATMOSPHERE STABLE',
      description:
        'No widespread severe meteorological warnings are currently active across India. Diurnal seasonal conditions observed.',
      statusColor: '#008000',
    };
  }

  /**
   * Match warnings specifically for a selected location record
   */
  getWarningsForLocation(
    warnings: WarningRecord[],
    location?: LocationRecord
  ): WarningRecord[] {
    if (!location) return [];

    const locState = (location.state || '').toLowerCase();
    const locDistrict = (location.district || '').toLowerCase();
    const locCity = (location.city || '').toLowerCase();

    return warnings.filter((w) => {
      const wState = w.state.toLowerCase();
      const stateMatch =
        wState === locState ||
        wState.includes(locState) ||
        locState.includes(wState);

      if (!stateMatch) return false;

      // Check if location district or city matches affected districts
      const districtMatch = w.affectedDistricts.some((d) => {
        const dl = d.toLowerCase();
        return (
          dl === locDistrict ||
          dl === locCity ||
          locDistrict.includes(dl) ||
          locCity.includes(dl)
        );
      });

      return stateMatch || districtMatch;
    });
  }

  /**
   * Get all live state summaries for map rendering
   */
  getAllStateSummaries(): Record<string, StateWarningSummary> {
    return STATE_ALERT_SEVERITIES;
  }

  /**
   * Resolve official state disaster contact number
   */
  getStateDisasterContact(stateCodeOrName: string) {
    const code = stateCodeOrName.toLowerCase();
    for (const [k, v] of Object.entries(STATE_DISASTER_NUMBERS)) {
      if (
        k === code ||
        v.stateName.toLowerCase() === code ||
        v.stateName.toLowerCase().includes(code) ||
        code.includes(v.stateName.toLowerCase())
      ) {
        return v;
      }
    }
    return {
      stateName: 'State Disaster Management',
      number: '1070 (Toll-Free All-State Helpline)',
      directTel: '1070',
      agency: 'State Emergency Operations Centre',
    };
  }

  /**
   * Get visual styles for a given severity
   */
  getSeverityTheme(severity: AlertSeverity): {
    color: string;
    borderClass: string;
    bgBadgeClass: string;
    textBadgeClass: string;
    icon: string;
    label: string;
  } {
    switch (severity) {
      case 'red':
        return {
          color: '#FF0000',
          borderClass: 'border-[#FF0000]',
          bgBadgeClass: 'bg-[#FF0000]/20 border border-[#FF0000]/60',
          textBadgeClass: 'text-[#FF4D4D]',
          icon: 'warning',
          label: 'RED ALERT — TAKE ACTION',
        };
      case 'orange':
        return {
          color: '#FFA500',
          borderClass: 'border-[#FFA500]',
          bgBadgeClass: 'bg-[#FFA500]/20 border border-[#FFA500]/60',
          textBadgeClass: 'text-[#FFA500]',
          icon: 'priority_high',
          label: 'ORANGE ALERT — BE PREPARED',
        };
      case 'yellow':
        return {
          color: '#FFFF00',
          borderClass: 'border-[#FFFF00]',
          bgBadgeClass: 'bg-[#FFFF00]/20 border border-[#FFFF00]/60',
          textBadgeClass: 'text-[#FFFF00]',
          icon: 'lightbulb',
          label: 'YELLOW WATCH — BE UPDATED',
        };
      case 'purple':
        return {
          color: '#1565C0',
          borderClass: 'border-[#1565C0]',
          bgBadgeClass: 'bg-[#1565C0]/20 border border-[#1565C0]/60',
          textBadgeClass: 'text-[#E3F2FD]',
          icon: 'info',
          label: 'ADVISORY BULLETIN',
        };
      case 'green':
      default:
        return {
          color: '#008000',
          borderClass: 'border-[#008000]',
          bgBadgeClass: 'bg-[#008000]/20 border border-[#008000]/60',
          textBadgeClass: 'text-[#008000]',
          icon: 'verified',
          label: 'GREEN CODE — NO WARNING',
        };
    }
  }
}

export const warningService = new WarningService();
