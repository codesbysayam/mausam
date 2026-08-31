import React from 'react';
import {
  CloudRain,
  Flame,
  Radio,
  Satellite,
  Wind,
  Sprout,
  Cpu,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { MeteorologicalPublication } from '../../data/reportsAndArticles';

interface ExploreByTopicProps {
  publications: MeteorologicalPublication[];
  onSelectTopic: (topicQuery: string) => void;
  activeQuery: string;
}

interface TopicDefinition {
  id: string;
  title: string;
  query: string;
  icon: React.ElementType;
  description: string;
  accentColor: string;
  borderColor: string;
  bgColor: string;
}

export const ExploreByTopic: React.FC<ExploreByTopicProps> = ({
  publications,
  onSelectTopic,
  activeQuery,
}) => {
  const topics: TopicDefinition[] = [
    {
      id: 'monsoon',
      title: 'MONSOON & CIRCULATION',
      query: 'monsoon',
      icon: CloudRain,
      description: 'Seasonal rainfall, synoptic troughs, ENSO teleconnections & MJO variability.',
      accentColor: '#38BDF8',
      borderColor: 'border-[#38BDF8]/40',
      bgColor: 'hover:bg-[#0E2032]',
    },
    {
      id: 'climatology',
      title: 'CLIMATE & URBAN HEAT',
      query: 'climatological',
      icon: Flame,
      description: 'Urban Heat Island (UHI), thermal anomalies & 30-year climate baselines.',
      accentColor: '#F59E0B',
      borderColor: 'border-[#F59E0B]/40',
      bgColor: 'hover:bg-[#251A10]',
    },
    {
      id: 'radar',
      title: 'RADAR & NOWCASTING',
      query: 'radar',
      icon: Radio,
      description: 'Dual-polarization DWR, TITAN convective tracking & microburst warnings.',
      accentColor: '#818CF8',
      borderColor: 'border-[#818CF8]/40',
      bgColor: 'hover:bg-[#1A1C35]',
    },
    {
      id: 'satellite',
      title: 'SATELLITE METEOROLOGY',
      query: 'satellite',
      icon: Satellite,
      description: 'INSAT-3D/3DR radiometry, MOSDAC ocean winds & cloud-top thermal imaging.',
      accentColor: '#EC4899',
      borderColor: 'border-[#EC4899]/40',
      bgColor: 'hover:bg-[#2A1424]',
    },
    {
      id: 'air-quality',
      title: 'AIR QUALITY & POLLEN',
      query: 'air quality',
      icon: Wind,
      description: 'NAQI ambient criteria pollutants, CAAQMS networks & bio-aeroallergens.',
      accentColor: '#10B981',
      borderColor: 'border-[#10B981]/40',
      bgColor: 'hover:bg-[#10241A]',
    },
    {
      id: 'agromet',
      title: 'AGROMETEOROLOGY',
      query: 'agrometeorology',
      icon: Sprout,
      description: 'GKMS district farm advisories, Kharif crop protection & phenology matrices.',
      accentColor: '#2ECC71',
      borderColor: 'border-[#2ECC71]/40',
      bgColor: 'hover:bg-[#12241A]',
    },
    {
      id: 'nwp',
      title: 'NUMERICAL PREDICTION',
      query: 'ncmrwf',
      icon: Cpu,
      description: 'NCMRWF Unified Model (NCUM 12km), 4D-Var assimilation & NEPS ensembles.',
      accentColor: '#06B6D4',
      borderColor: 'border-[#06B6D4]/40',
      bgColor: 'hover:bg-[#0E2228]',
    },
    {
      id: 'standards',
      title: 'OBSERVATION STANDARDS',
      query: 'wmo',
      icon: ShieldAlert,
      description: 'WMO-No. 8 sensor calibration traceability & NDMA color-coded alert matrix.',
      accentColor: '#A855F7',
      borderColor: 'border-[#A855F7]/40',
      bgColor: 'hover:bg-[#20122E]',
    },
  ];

  return (
    <div id="explore-by-topic-section" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#38BDF8]">
            Domain Taxonomy
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Explore Meteorological Research by Topic
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {topics.map((topic) => {
          const Icon = topic.icon;
          // Count publications matching topic
          const count = publications.filter(
            (p) =>
              p.title.toLowerCase().includes(topic.query) ||
              p.abstract.toLowerCase().includes(topic.query) ||
              p.category.toLowerCase().includes(topic.query) ||
              p.keywords.some((k) => k.toLowerCase().includes(topic.query))
          ).length;

          const isMatching = activeQuery.toLowerCase() === topic.query.toLowerCase();

          return (
            <div
              key={topic.id}
              onClick={() => onSelectTopic(topic.query)}
              className={`p-4 rounded-2xl bg-[#0B131D] border transition-all duration-200 cursor-pointer flex flex-col justify-between group ${topic.borderColor} ${topic.bgColor} ${
                isMatching ? 'ring-2 ring-[#38BDF8] scale-[1.02]' : 'hover:scale-[1.01]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm"
                    style={{
                      backgroundColor: `${topic.accentColor}18`,
                      borderColor: `${topic.accentColor}40`,
                      color: topic.accentColor,
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#141F2C] border border-[#1E2E40] text-[#94A3B8]">
                    {count} {count === 1 ? 'pub' : 'pubs'}
                  </span>
                </div>

                <h4 className="text-xs font-black text-white uppercase tracking-wider group-hover:text-[#38BDF8] transition-colors">
                  {topic.title}
                </h4>

                <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
                  {topic.description}
                </p>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-[#1E2E40] flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#64748B]">Filter Library</span>
                <span
                  className="flex items-center gap-1 font-bold group-hover:translate-x-1 transition-transform"
                  style={{ color: topic.accentColor }}
                >
                  <span>EXPLORE</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
