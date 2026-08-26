import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface DataSourceBadgeProps {
  sourceName?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({
  sourceName = 'India Meteorological Department (IMD)',
  className = '',
  size = 'sm',
}) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 font-medium text-slate-700 bg-slate-100/90 hover:bg-slate-200/90 border border-slate-300/80 rounded-md transition-colors ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      } ${className}`}
    >
      <ShieldCheck className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-emerald-600`} />
      <span>Source: <strong className="font-semibold text-slate-900">{sourceName}</strong></span>
    </div>
  );
};
export default DataSourceBadge;
