import React from 'react';
import {
  FileText,
  BarChart2,
  CloudRain,
  Sprout,
  Satellite,
  Radio,
  Wind,
  Sliders,
  ShieldCheck,
  Flame,
  Activity,
  Layers,
  BookOpen,
} from 'lucide-react';
import { MeteorologicalPublication } from '../../data/reportsAndArticles';

export interface CategoryTheme {
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  accentColor: string;
  icon: React.ElementType;
  classification: 'OFFICIAL' | 'RESEARCH' | 'TECHNICAL';
}

export function getCategoryTheme(pub: MeteorologicalPublication): CategoryTheme {
  const cat = pub.category;
  const type = pub.type;

  if (cat === 'National Weather Observation' || type === 'PDF Bulletin') {
    return {
      label: 'Official Synoptic Bulletin',
      badgeBg: 'bg-[#0B72B9]/15',
      badgeText: 'text-[#38BDF8]',
      badgeBorder: 'border-[#38BDF8]/30',
      accentColor: '#38BDF8',
      icon: CloudRain,
      classification: 'OFFICIAL',
    };
  }

  if (cat === 'Sub-Divisional Report') {
    return {
      label: 'Regional Telemetry',
      badgeBg: 'bg-[#06B6D4]/15',
      badgeText: 'text-[#22D3EE]',
      badgeBorder: 'border-[#22D3EE]/30',
      accentColor: '#22D3EE',
      icon: Radio,
      classification: 'OFFICIAL',
    };
  }

  if (cat === 'Agricultural Meteorology' || type === 'GKMS Bulletin') {
    return {
      label: 'Agrometeorological Advisory',
      badgeBg: 'bg-[#2ECC71]/15',
      badgeText: 'text-[#2ECC71]',
      badgeBorder: 'border-[#2ECC71]/30',
      accentColor: '#2ECC71',
      icon: Sprout,
      classification: 'OFFICIAL',
    };
  }

  if (cat === 'Environmental Registry') {
    return {
      label: 'Environmental Registry',
      badgeBg: 'bg-[#10B981]/15',
      badgeText: 'text-[#34D399]',
      badgeBorder: 'border-[#34D399]/30',
      accentColor: '#34D399',
      icon: Wind,
      classification: 'OFFICIAL',
    };
  }

  if (cat === 'Climatological Study') {
    return {
      label: 'Climatological Study',
      badgeBg: 'bg-[#F59E0B]/15',
      badgeText: 'text-[#FBBF24]',
      badgeBorder: 'border-[#FBBF24]/30',
      accentColor: '#FBBF24',
      icon: BarChart2,
      classification: 'RESEARCH',
    };
  }

  if (pub.id.includes('radar') || pub.keywords.some(k => k.toLowerCase().includes('radar'))) {
    return {
      label: 'Radar & Nowcasting',
      badgeBg: 'bg-[#8B5CF6]/15',
      badgeText: 'text-[#A78BFA]',
      badgeBorder: 'border-[#A78BFA]/30',
      accentColor: '#A78BFA',
      icon: Radio,
      classification: 'TECHNICAL',
    };
  }

  if (pub.id.includes('satellite') || pub.keywords.some(k => k.toLowerCase().includes('satellite') || k.toLowerCase().includes('isro'))) {
    return {
      label: 'Satellite Meteorology',
      badgeBg: 'bg-[#EC4899]/15',
      badgeText: 'text-[#F472B6]',
      badgeBorder: 'border-[#F472B6]/30',
      accentColor: '#F472B6',
      icon: Satellite,
      classification: 'TECHNICAL',
    };
  }

  if (cat === 'Scientific Monograph' || type === 'Research Article') {
    return {
      label: 'Scientific Monograph',
      badgeBg: 'bg-[#6366F1]/15',
      badgeText: 'text-[#818CF8]',
      badgeBorder: 'border-[#818CF8]/30',
      accentColor: '#818CF8',
      icon: BookOpen,
      classification: 'RESEARCH',
    };
  }

  return {
    label: 'Technical Publication',
    badgeBg: 'bg-[#14B8A6]/15',
    badgeText: 'text-[#2DD4BF]',
    badgeBorder: 'border-[#2DD4BF]/30',
    accentColor: '#2DD4BF',
    icon: FileText,
    classification: 'TECHNICAL',
  };
}

export function estimateReadingTime(pub: MeteorologicalPublication): string {
  const wordCount = (pub.abstract + ' ' + (pub.synopticSummary || '') + ' ' + pub.sections.map(s => s.content).join(' ')).split(/\s+/).length;
  const minutes = Math.max(3, Math.ceil(wordCount / 120));
  return `${minutes} min read`;
}
