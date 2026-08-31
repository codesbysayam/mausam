import React from 'react';
import { MeteorologicalPublication } from '../../data/reportsAndArticles';
import { BarChart3, PieChart, TrendingUp, Layers, CheckCircle2 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart as RePieChart,
  Pie,
} from 'recharts';

interface PublicationAnalyticsProps {
  publications: MeteorologicalPublication[];
}

export const PublicationAnalytics: React.FC<PublicationAnalyticsProps> = ({ publications }) => {
  // Monthly distribution data
  const monthlyData = [
    { month: 'Jan', count: 0, full: 'January 2026' },
    { month: 'Feb', count: 0, full: 'February 2026' },
    { month: 'Mar', count: 0, full: 'March 2026' },
    { month: 'Apr', count: 0, full: 'April 2026' },
    { month: 'May', count: 2, full: 'May 2026' },
    { month: 'Jun', count: 2, full: 'June 2026' },
    { month: 'Jul', count: 3, full: 'July 2026' },
    { month: 'Aug', count: 5, full: 'August 2026' },
  ];

  // Category composition data
  const categoryData = [
    { name: 'Research Monographs', count: 5, color: '#818CF8' },
    { name: 'Official Bulletins', count: 3, color: '#38BDF8' },
    { name: 'Climatological Studies', count: 2, color: '#F59E0B' },
    { name: 'Environmental Registries', count: 2, color: '#10B981' },
  ];

  return (
    <div
      id="publication-analytics-section"
      className="rounded-3xl bg-[#0B131D] border border-[#1E2E40] p-5 sm:p-7 shadow-xl space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E2E40] gap-2">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#38BDF8]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#38BDF8]">
              Bibliometric Intelligence
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Publication Activity &amp; Research Distribution
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-[#94A3B8]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
            Active Monsoon Cycle
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Monthly Issuance Activity Bar Chart */}
        <div className="lg:col-span-2 p-4 rounded-2xl bg-[#080E16] border border-[#1E2E40]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Monthly Publication Volume (2026 Cycle)
            </span>
            <span className="text-[11px] font-mono text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 rounded border border-[#38BDF8]/20">
              Peak: August (5 Reports)
            </span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="month"
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#1E2E40' }}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#1E2E40' }}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#0F172A] border border-[#38BDF8]/40 p-2 rounded-lg text-xs font-mono shadow-xl">
                          <p className="text-white font-bold">{data.full}</p>
                          <p className="text-[#38BDF8] mt-1">{data.count} Publications Issued</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {monthlyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.month === 'Aug' ? '#38BDF8' : entry.count > 0 ? '#2563EB' : '#1E2E40'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Domain Breakdown Distribution */}
        <div className="p-4 rounded-2xl bg-[#080E16] border border-[#1E2E40] flex flex-col justify-between">
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider block mb-3">
            Domain Classification
          </span>

          <div className="space-y-3">
            {categoryData.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#CBD5E1] truncate">{item.name}</span>
                  <span className="text-white font-bold">{item.count}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#1E2E40] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(item.count / publications.length) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[#1E2E40] text-[11px] font-mono text-[#94A3B8] flex items-center justify-between">
            <span>Primary Focus:</span>
            <span className="text-[#38BDF8] font-bold">Atmospheric &amp; Synoptic</span>
          </div>
        </div>
      </div>
    </div>
  );
};
