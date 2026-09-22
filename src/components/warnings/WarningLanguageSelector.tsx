// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Weather Alert Center Multilingual Language Selector Adapter
// ====================================================================

import React from 'react';
import { RegionLanguageConfig, SupportedLanguageMode } from '../../types/regionLanguages';
import { LanguageSelector } from '../common/LanguageSelector';

export interface WarningLanguageSelectorProps {
  regionConfig: RegionLanguageConfig;
  selectedMode: SupportedLanguageMode;
  onSelectMode: (mode: SupportedLanguageMode) => void;
  className?: string;
}

export const WarningLanguageSelector: React.FC<WarningLanguageSelectorProps> = ({
  regionConfig,
  selectedMode,
  onSelectMode,
  className = '',
}) => {
  return (
    <LanguageSelector
      regionConfig={regionConfig}
      selectedMode={selectedMode}
      onSelectMode={onSelectMode}
      className={className}
      idPrefix=""
    />
  );
};

export default WarningLanguageSelector;
