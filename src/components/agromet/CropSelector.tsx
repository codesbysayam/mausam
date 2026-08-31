import React from 'react';
import { CROP_CATEGORIES } from '../../services/agrometService';

export interface CropSelectorProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  selectedCrop: string;
  onSelectCrop: (cropName: string) => void;
  availableCrops?: string[];
  className?: string;
}

export const getCropEmoji = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('rice') || lower.includes('paddy')) return '🌾';
  if (lower.includes('wheat')) return '🌱';
  if (lower.includes('maize') || lower.includes('corn')) return '🌽';
  if (lower.includes('cotton')) return '🧵';
  if (lower.includes('potato')) return '🥔';
  if (lower.includes('mustard')) return '🌻';
  if (lower.includes('sugarcane')) return '🎋';
  if (lower.includes('gram') || lower.includes('chickpea')) return '🫘';
  if (lower.includes('tomato')) return '🍅';
  if (lower.includes('onion')) return '🧅';
  if (lower.includes('mango')) return '🥭';
  if (lower.includes('groundnut') || lower.includes('peanut')) return '🥜';
  if (lower.includes('soybean') || lower.includes('soya')) return '🫘';
  if (lower.includes('chilli') || lower.includes('chili')) return '🌶️';
  return '🌿';
};

export const CropSelector: React.FC<CropSelectorProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedCrop,
  onSelectCrop,
  availableCrops: customCrops,
  className = '',
}) => {
  const currentCategoryObj =
    CROP_CATEGORIES.find((c) => c.id === selectedCategory) || CROP_CATEGORIES[0];
  const cropsToDisplay = customCrops && customCrops.length > 0 ? customCrops : currentCategoryObj.crops;

  return (
    <div
      id="agromet-crop-selector"
      className={`rounded-2xl bg-[#0F1722]/90 backdrop-blur-md border border-[#1E2E40] p-4 sm:p-5 shadow-lg ${className}`}
    >
      {/* Category Pills Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-3.5 border-b border-[#1E2E40]/70 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2ECC71]" />
          <span className="text-xs font-bold font-mono uppercase tracking-wider text-[#94A3B8]">
            Crop Category Filters
          </span>
        </div>

        <div className="text-[11px] text-[#38BDF8] font-mono flex items-center gap-1.5 self-start sm:self-auto">
          <span>Active Target:</span>
          <span className="px-2 py-0.5 rounded-md bg-[#162434] border border-[#24394E] text-white font-bold">
            {selectedCrop}
          </span>
        </div>
      </div>

      {/* Pill-based Categories Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
        {CROP_CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              id={`crop-category-btn-${category.id}`}
              type="button"
              onClick={() => {
                onSelectCategory(category.id);
                // When selecting category, optionally auto-select first crop in category if current crop not in it
                if (category.crops.length > 0 && !category.crops.includes(selectedCrop)) {
                  onSelectCrop(category.crops[0]);
                }
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer focus:outline-none ${
                isSelected
                  ? 'bg-[#2ECC71] text-[#0A1017] shadow-md shadow-[#2ECC71]/25 font-black scale-[1.02]'
                  : 'bg-[#14202E] text-[#94A3B8] hover:text-white hover:bg-[#1A2A3D] border border-[#1E2E40]'
              }`}
            >
              {category.name}
            </button>
          );
        })}
      </div>

      {/* Crop Pills Horizontal List with 200ms Smooth Transition */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        {cropsToDisplay.map((cropName) => {
          const isSelected = selectedCrop.toLowerCase() === cropName.toLowerCase();
          const emoji = getCropEmoji(cropName);

          return (
            <button
              key={cropName}
              id={`crop-pill-btn-${cropName.replace(/\s+/g, '-').toLowerCase()}`}
              type="button"
              onClick={() => onSelectCrop(cropName)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer focus:outline-none ${
                isSelected
                  ? 'bg-gradient-to-r from-[#173827] to-[#122A1E] border-2 border-[#2ECC71] text-white shadow-lg shadow-[#2ECC71]/20 scale-[1.03]'
                  : 'bg-[#121D2A] border border-[#1E2E40] text-[#CBD5E1] hover:border-[#2ECC71]/50 hover:bg-[#162434] hover:scale-[1.01]'
              }`}
            >
              <span className="text-base">{emoji}</span>
              <span className="font-medium">{cropName}</span>
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-pulse ml-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
