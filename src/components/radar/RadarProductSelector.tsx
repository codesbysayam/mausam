import React from 'react';
import { RadarProductType } from '../../types/radar';

export interface RadarProductSelectorProps {
  selectedProduct: RadarProductType | 'PRECIP';
  onSelectProduct: (product: RadarProductType | 'PRECIP') => void;
  radarSourceLabel?: string;
  isRadarMode?: boolean;
}

interface ProductItem {
  id: RadarProductType | 'PRECIP';
  label: string;
  shortDesc: string;
  available: boolean;
  statusText: string;
  sourceAttribution: string;
}

const RADAR_PRODUCTS: ProductItem[] = [
  {
    id: 'PRECIP',
    label: 'Precipitation Composite',
    shortDesc: 'RainViewer precipitation radar composite overlay',
    available: true,
    statusText: 'ACTIVE (RainViewer Real-time Overlay)',
    sourceAttribution: 'RainViewer precipitation radar',
  },
  {
    id: 'MAXZ',
    label: 'MAX Z',
    shortDesc: 'Maximum Reflectivity Column (Volumetric Maximum)',
    available: false,
    statusText: 'Unavailable from current source',
    sourceAttribution: 'Requires IMD DWR Direct Volumetric Feed',
  },
  {
    id: 'PPZ',
    label: 'PPZ / Reflectivity',
    shortDesc: 'PPI Reflectivity (0.5° Base Elevation Hydrometeor Tilt)',
    available: false,
    statusText: 'Unavailable from current source',
    sourceAttribution: 'Requires IMD DWR Direct Volumetric Feed',
  },
  {
    id: 'PPV',
    label: 'PPV / Velocity',
    shortDesc: 'PPI Radial Doppler Hydrometeor Velocity (Mean Wind Field)',
    available: false,
    statusText: 'Unavailable from current source',
    sourceAttribution: 'Requires IMD DWR Direct Volumetric Feed',
  },
  {
    id: 'SRI',
    label: 'SRI / Rainfall',
    shortDesc: 'Surface Rainfall Intensity (Instantaneous rate in mm/h)',
    available: false,
    statusText: 'Unavailable from current source',
    sourceAttribution: 'Requires IMD DWR Direct Volumetric Feed',
  },
  {
    id: 'PAC',
    label: 'PAC / Accumulation',
    shortDesc: 'Precipitation Accumulation (24-hour total estimation)',
    available: false,
    statusText: 'Unavailable from current source',
    sourceAttribution: 'Requires IMD DWR Direct Volumetric Feed',
  },
  {
    id: 'VVP2',
    label: 'VVP2 / Wind',
    shortDesc: 'Volume Velocity Processing (Vertical Azimuth Wind Profile)',
    available: false,
    statusText: 'Unavailable from current source',
    sourceAttribution: 'Requires IMD DWR Direct Volumetric Feed',
  },
];

export const RadarProductSelector: React.FC<RadarProductSelectorProps> = ({
  selectedProduct,
  onSelectProduct,
  radarSourceLabel = 'RainViewer precipitation radar',
  isRadarMode = true,
}) => {
  return (
    <section className="bg-[#0B263D] border border-[#1D5278] rounded-lg p-5 shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#1D5278] mb-4">
        <div>
          <h2 className="text-base font-bold text-[#F5F9FC] tracking-wide uppercase">
            RADAR DATA / PRODUCT INFORMATION
          </h2>
          <p className="text-xs text-[#AFC4D8] mt-0.5">
            Operational product status &amp; atmospheric radar imagery availability
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#8A94A6]">Active Overlay:</span>
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#1565C0]/20 text-[#38BDF8] border border-[#1565C0]/30 font-mono">
            {radarSourceLabel}
          </span>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {RADAR_PRODUCTS.map((prod) => {
          const isSelected = selectedProduct === prod.id;
          return (
            <div
              key={prod.id}
              className={`p-3 rounded-lg border flex flex-col justify-between transition-all ${
                prod.available
                  ? isSelected
                    ? 'bg-[#102D44] border-[#38BDF8] ring-1 ring-[#38BDF8]'
                    : 'bg-[#102D44] border-[#1D5278] hover:border-[#1565C0] cursor-pointer'
                  : 'bg-[#0B263D]/60 border-[#1D5278]/50 opacity-75'
              }`}
              onClick={() => {
                if (prod.available) {
                  onSelectProduct(prod.id);
                }
              }}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-[#F5F9FC]">{prod.label}</span>
                  {prod.available ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#00C897]/20 text-[#00C897] border border-[#00C897]/30">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#102D44] text-[#8A94A6] border border-[#1D5278]">
                      UNAVAILABLE
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#AFC4D8] leading-tight mb-2">
                  {prod.shortDesc}
                </p>
              </div>

              <div className="pt-2 border-t border-[#1D5278]/40 mt-1 flex items-center justify-between text-[10px]">
                <span className={prod.available ? 'text-[#38BDF8] font-mono' : 'text-[#8A94A6] italic'}>
                  {prod.statusText}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Source Transparency Note */}
      <div className="mt-4 p-3 bg-[#102D44] border border-[#1D5278] rounded text-xs text-[#AFC4D8] flex items-start gap-2.5">
        <span className="material-symbols-outlined text-[#38BDF8] text-[18px] shrink-0 mt-0.5">
          verified_user
        </span>
        <div className="space-y-0.5">
          <span className="font-bold text-[#F5F9FC] block">Data Integrity &amp; Calibration Transparency</span>
          <p className="text-[11px] text-[#AFC4D8] leading-relaxed">
            RainViewer precipitation radar composite is utilized for real-time hydrometeor reflectivity. IMD single-station volumetric Doppler products (MAX Z, PPZ, PPV, SRI, PAC, VVP2) require direct internal institutional gateway authorization and are shown as &quot;Unavailable from current source&quot; without simulation.
          </p>
        </div>
      </div>
    </section>
  );
};

export default RadarProductSelector;
