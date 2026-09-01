import React from 'react';

interface BrandLogoProps {
  onClick?: () => void;
  showSubtitle?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  onClick,
  showSubtitle = true,
  className = '',
}) => {
  return (
    <div
      id="mausam-brand-logo"
      className={`mausam-brand group ${className}`}
      onClick={onClick}
    >
      <div className="imd-logo-wrapper">
        <picture>
          <source type="image/svg+xml" srcSet="/assets/imd-logo.svg" />
          <source type="image/webp" srcSet="/assets/imd-logo.webp" />
          <img
            src="/assets/imd-logo.svg"
            alt="India Meteorological Department"
            className="imd-logo"
            loading="eager"
            width={76}
            height={76}
          />
        </picture>
      </div>

      <div className="brand-copy">
        <div className="brand-title">
          MAUSAM
          <span className="india-badge">INDIA</span>
        </div>

        {showSubtitle && (
          <div className="brand-subtitle hidden sm:block">
            Atmospheric Intelligence Platform
          </div>
        )}
      </div>
    </div>
  );
};
