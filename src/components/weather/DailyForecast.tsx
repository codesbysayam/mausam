import React from 'react';
import { DailyForecastItem } from '../../types';
import { SectionHeader } from '../common/SectionHeader';
import { DataTable, ColumnDef } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { useLanguage } from '../../i18n/LanguageContext';

interface DailyForecastProps {
  daily: DailyForecastItem[];
}

export const DailyForecast: React.FC<DailyForecastProps> = ({ daily }) => {
  const { t, tCondition, language } = useLanguage();

  const getDayTranslation = (dayStr: string) => {
    const lower = dayStr.toLowerCase();
    if (lower.includes('today')) return t('today', 'Today');
    if (lower.includes('tomorrow')) return t('tomorrow', 'Tomorrow');
    if (language === 'hi') {
      const map: Record<string, string> = {
        Mon: 'सोमवार', Tue: 'मंगलवार', Wed: 'बुधवार', Thu: 'गुरुवार',
        Fri: 'शुक्रवार', Sat: 'शनिवार', Sun: 'रविवार',
        Monday: 'सोमवार', Tuesday: 'मंगलवार', Wednesday: 'बुधवार',
        Thursday: 'गुरुवार', Friday: 'शुक्रवार', Saturday: 'शनिवार', Sunday: 'रविवार'
      };
      return map[dayStr] || dayStr;
    }
    if (language === 'or') {
      const map: Record<string, string> = {
        Mon: 'ସୋମବାର', Tue: 'ମଙ୍ଗଳବାର', Wed: 'ବୁଧବାର', Thu: 'ଗୁରୁବାର',
        Fri: 'ଶୁକ୍ରବାର', Sat: 'ଶନିବାର', Sun: 'ରବିବାର',
        Monday: 'ସୋମବାର', Tuesday: 'ମଙ୍ଗଳବାର', Wednesday: 'ବୁଧବାର',
        Thursday: 'ଗୁରୁବାର', Friday: 'ଶୁକ୍ରବାର', Saturday: 'ଶନିବାର', Sunday: 'ରବିବାର'
      };
      return map[dayStr] || dayStr;
    }
    return dayStr;
  };

  const columns: ColumnDef<DailyForecastItem>[] = [
    {
      header: language === 'hi' ? 'दिनांक एवं वार' : language === 'or' ? 'ତାରିଖ ଏବଂ ବାର' : 'Date & Day',
      render: (item) => (
        <div>
          <div className="font-bold text-white text-xs">{getDayTranslation(item.day)}</div>
          <div className="text-[11px] text-[#8A94A6]">{item.date}</div>
        </div>
      ),
      width: '140px',
    },
    {
      header: language === 'hi' ? 'स्थिति' : language === 'or' ? 'ସ୍ଥିତି' : 'Condition',
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className="text-white font-medium text-xs">
            {tCondition(item.condition)}
          </span>
        </div>
      ),
      width: '160px',
    },
    {
      header: language === 'hi' ? 'अधिकतम / न्यूनतम' : language === 'or' ? 'ସର୍ବୋଚ୍ଚ / ସର୍ବନିମ୍ନ' : 'Max / Min Temp',
      render: (item) => {
        const highVal = typeof item.high === 'number' && !Number.isNaN(item.high) ? `${Math.round(item.high)}°C` : '—';
        const lowVal = typeof item.low === 'number' && !Number.isNaN(item.low) ? `${Math.round(item.low)}°C` : '—';
        return (
          <div className="font-mono text-xs">
            <span className="text-white font-bold">{highVal}</span>
            <span className="text-[#8A94A6] mx-1">/</span>
            <span className="text-[#8A94A6]">{lowVal}</span>
          </div>
        );
      },
      width: '120px',
    },
    {
      header: language === 'hi' ? 'वर्षा की संभावना' : language === 'or' ? 'ବର୍ଷାର ସମ୍ଭାବନା' : 'Rainfall & Probability',
      render: (item) => {
        const prob = item.rainProb || 0;
        return (
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono font-bold ${prob > 40 ? 'text-[#4FA8E0]' : 'text-[#8A94A6]'}`}>
              {prob}%
            </span>
            {prob > 60 && (
              <StatusBadge
                label={language === 'hi' ? 'संभावित' : language === 'or' ? 'ସମ୍ଭାବ୍ୟ' : 'Likely'}
                variant="info"
              />
            )}
          </div>
        );
      },
      width: '180px',
    },
    {
      header: language === 'hi' ? 'आर्द्रता एवं हवा' : language === 'or' ? 'ଆର୍ଦ୍ରତା ଏବଂ ପବନ' : 'Humidity & Wind',
      render: (item) => (
        <div className="text-xs text-[#8A94A6]">
          <span>RH: <strong className="text-[#D7DEE8] font-mono">{item.humidity}%</strong></span>
          <span className="mx-1.5">•</span>
          <span>Wind: <strong className="text-[#D7DEE8] font-mono">{item.wind || '12 km/h NE'}</strong></span>
        </div>
      ),
    },
    {
      header: language === 'hi' ? 'मौसम दृष्टिकोण' : language === 'or' ? 'ପାଣିପାଗ ପରିଦୃଶ୍ୟ' : 'Meteorological Outlook',
      render: (item) => (
        <div className="text-xs text-[#8A94A6]">
          {item.condition ? `${tCondition(item.condition)} • UV ${item.uv}` : 'Fair weather with clear to partly cloudy skies'}
        </div>
      ),
    },
  ];

  return (
    <div className="mausam-card">
      <SectionHeader
        title={t('sevenDayForecast', '7-Day Medium Range Outlook & Forecast')}
        subtitle="Operational meteorological forecast bulletin for districts and sub-divisions"
        icon="date_range"
      />

      <DataTable
        data={daily}
        columns={columns}
        keyExtractor={(item, idx) => item.date || String(idx)}
      />
    </div>
  );
};
