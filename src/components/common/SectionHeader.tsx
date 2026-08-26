import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  action?: React.ReactNode;
  id?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  icon,
  action,
  id,
}) => {
  return (
    <div className="mausam-section-header" id={id}>
      <div>
        <h3 className="mausam-section-title">
          {icon && (
            <span className="material-symbols-outlined text-[20px] text-[#4FA8E0]">
              {icon}
            </span>
          )}
          <span>{title}</span>
        </h3>
        {subtitle && <p className="mausam-section-subtitle">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};
