import React from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  Trash2,
  X,
  ExternalLink,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface LocationPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearSavedLocation?: () => void;
  hasSavedLocation?: boolean;
}

export const LocationPrivacyModal: React.FC<LocationPrivacyModalProps> = ({
  isOpen,
  onClose,
  onClearSavedLocation,
  hasSavedLocation = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-privacy-title"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        id="location-privacy-dialog"
        className="relative w-full max-w-2xl bg-[#0B131E] border border-[#1E2E42] rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2E42] bg-[#070D15]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1499E8]/15 border border-[#1499E8]/30 flex items-center justify-center text-[#43C7F4]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 id="location-privacy-title" className="text-base font-bold text-white tracking-tight">
                Location Privacy &amp; Data Transparency
              </h2>
              <p className="text-[11px] font-mono text-[#94A3B8]">
                MAUSAM National Atmospheric Intelligence Platform
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#111C27] hover:bg-[#1E2E42] border border-[#1E2E42] text-[#94A3B8] hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close Privacy Dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#CBD5E1] leading-relaxed">
          {/* Summary Box */}
          <div className="p-4 rounded-xl bg-[#1499E8]/10 border border-[#1499E8]/30 text-[#E2E8F0] space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#43C7F4]">
              <Lock className="w-4 h-4" />
              <span>Zero Continuous Tracking • User-Controlled Geolocation</span>
            </div>
            <p className="text-[11px] text-[#93A4B8]">
              MAUSAM uses your location <strong>only</strong> when you explicitly click “Use My Location” to find the nearest meteorological observation station and provide accurate local forecasts.
            </p>
          </div>

          {/* Key Questions Matrix */}
          <div className="space-y-3">
            <div className="border border-[#1E2E42] rounded-xl p-3.5 bg-[#0F1926] space-y-1">
              <h3 className="font-bold text-white flex items-center gap-2 text-xs">
                <MapPin className="w-3.5 h-3.5 text-[#22C7A0]" />
                1. What data is collected when I click “Use My Location”?
              </h3>
              <p className="text-[#94A3B8] pl-5.5">
                Only the latitude, longitude, and approximate horizontal accuracy provided by your browser's Geolocation API. We do not track IP addresses for ad profiling or store continuous background location traces.
              </p>
            </div>

            <div className="border border-[#1E2E42] rounded-xl p-3.5 bg-[#0F1926] space-y-1">
              <h3 className="font-bold text-white flex items-center gap-2 text-xs">
                <Eye className="w-3.5 h-3.5 text-[#38BDF8]" />
                2. How is my location used?
              </h3>
              <p className="text-[#94A3B8] pl-5.5">
                Your coordinates are reverse-geocoded to identify your State, District, and City, and to compute the nearest IMD Automatic Weather Station (AWS), Doppler radar sector, and agricultural advisory cluster.
              </p>
            </div>

            <div className="border border-[#1E2E42] rounded-xl p-3.5 bg-[#0F1926] space-y-1">
              <h3 className="font-bold text-white flex items-center gap-2 text-xs">
                <Lock className="w-3.5 h-3.5 text-[#F59E0B]" />
                3. Where is my location saved?
              </h3>
              <p className="text-[#94A3B8] pl-5.5">
                Your detected location is stored solely in your browser's client-side local cache so you don't have to re-locate on every page navigation. It is never transmitted to third-party ad networks or tracking servers.
              </p>
            </div>

            <div className="border border-[#1E2E42] rounded-xl p-3.5 bg-[#0F1926] space-y-1">
              <h3 className="font-bold text-white flex items-center gap-2 text-xs">
                <HelpCircle className="w-3.5 h-3.5 text-[#A855F7]" />
                4. How do I enable or revoke location permissions?
              </h3>
              <div className="text-[#94A3B8] pl-5.5 space-y-1">
                <p>You can manage permissions directly in your browser:</p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  <li><strong>Chrome / Edge / Brave:</strong> Click the padlock / settings icon next to the URL bar → Permissions → Location.</li>
                  <li><strong>Safari (iOS / macOS):</strong> Settings → Safari → Location → Allow / Ask / Deny.</li>
                  <li><strong>Firefox:</strong> Click the permissions icon in the address bar → Clear location exception.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Clear Location Section */}
          {hasSavedLocation && onClearSavedLocation && (
            <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-[#FCA5A5] block">Stored Location Cached in Browser</span>
                <span className="text-[11px] text-[#94A3B8]">Clear cached coordinates and reset to national primary hub.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClearSavedLocation();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#EF4444] border border-[#EF4444]/40 font-semibold text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Saved Location</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#1E2E42] bg-[#070D15] flex items-center justify-between">
          <span className="text-[10px] font-mono text-[#64748B]">
            Compliant with Digital Personal Data Protection (DPDP) Guidelines
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#1499E8] hover:bg-[#0C78BA] text-white font-bold text-xs transition-colors shadow-sm shadow-[#1499E8]/20"
          >
            Understood &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
