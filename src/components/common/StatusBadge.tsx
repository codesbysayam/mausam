import React from 'react';

export type StatusVariant = 'good' | 'warning' | 'alert' | 'danger' | 'info' | 'neutral';

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  icon?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'neutral',
  icon,
  className = '',
}) => {
  return (
    <span className={`mausam-badge mausam-badge--${variant} ${className}`}>
      {icon && (
        <span className="material-symbols-outlined text-[13px]">{icon}</span>
      )}
      <span>{label}</span>
    </span>
  );
};
