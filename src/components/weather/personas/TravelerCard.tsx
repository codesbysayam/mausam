import React, { useState, useEffect } from 'react';
import { AuthoritativeAlert, SavedDestination, authoritativeClient } from '../../../services/authoritativeService';

interface TravelerCardProps {
  activeAlerts: AuthoritativeAlert[];
  packingSuggestions: string[];
  travelSafetyRating: 'Favorable' | 'Minor Delays Expected' | 'Caution Advised' | 'Hazardous';
  city: string;
  state: string;
  lat: number;
  lng: number;
}

export const TravelerCard: React.FC<TravelerCardProps> = ({
  activeAlerts,
  packingSuggestions,
  travelSafetyRating,
  city,
  state,
  lat,
  lng,
}) => {
  const [destinations, setDestinations] = useState<SavedDestination[]>([]);
  const [newCityName, setNewCityName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    setDestinations(authoritativeClient.getSavedDestinations());
  }, []);

  const handleBookmarkCurrent = () => {
    const updated = authoritativeClient.addDestination(city, state, lat, lng);
    setDestinations(updated);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim()) return;
    const updated = authoritativeClient.addDestination(newCityName.trim(), 'Travel Destination', 20.0, 78.0);
    setDestinations(updated);
    setNewCityName('');
    setShowAddModal(false);
  };

  const handleRemove = (id: string) => {
    const updated = authoritativeClient.removeDestination(id);
    setDestinations(updated);
  };

  const ratingBadgeColor =
    travelSafetyRating === 'Favorable'
      ? 'bg-[#2ECC71]/15 text-[#2ECC71] border-[#2ECC71]/40'
      : travelSafetyRating === 'Minor Delays Expected'
      ? 'bg-[#F1C40F]/15 text-[#F1C40F] border-[#F1C40F]/40'
      : travelSafetyRating === 'Caution Advised'
      ? 'bg-[#FF8C42]/15 text-[#FF8C42] border-[#FF8C42]/40'
      : 'bg-[#E74C3C]/15 text-[#E74C3C] border-[#E74C3C]/40';

  const isCurrentBookmarked = destinations.some(
    (d) => d.name.toLowerCase() === city.toLowerCase() || (Math.abs(d.lat - lat) < 0.05 && Math.abs(d.lng - lng) < 0.05)
  );

  return (
    <div className="mausam-card p-4 sm:p-5 border border-[#334155] flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#9B59B6]/15 text-[#9B59B6] flex items-center justify-center border border-[#9B59B6]/30">
              <span className="material-symbols-outlined text-[20px]">luggage</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                Travelers &amp; Destination Intel
              </h3>
              <p className="text-[11px] text-[#8A94A6]">
                Azure Maps Severe Alerts &amp; Packing Guide • {city}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBookmarkCurrent}
              disabled={isCurrentBookmarked}
              className={`text-[11px] px-2.5 py-1 rounded font-medium transition-all flex items-center gap-1 border ${
                isCurrentBookmarked
                  ? 'bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/30 cursor-default'
                  : 'bg-[#0B72B9]/20 hover:bg-[#0B72B9]/30 text-[#4FA8E0] border-[#0B72B9]/40'
              }`}
              title="Save current station to travel destinations"
            >
              <span className="material-symbols-outlined text-[14px]">
                {isCurrentBookmarked ? 'bookmark_added' : 'bookmark_add'}
              </span>
              <span>{isCurrentBookmarked ? 'Saved' : 'Save City'}</span>
            </button>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${ratingBadgeColor}`}>
              {travelSafetyRating}
            </span>
          </div>
        </div>

        {/* Dynamic Packing Suggestions */}
        <div className="mt-4 p-3.5 rounded bg-[#17212B] border border-[#334155]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#9B59B6]">checkroom</span>
              Recommended Packing Items ({city})
            </span>
            <span className="text-[10px] text-[#8A94A6]">Synoptic Forecast Derived</span>
          </div>
          <ul className="space-y-1.5 text-xs text-[#D7DEE8]">
            {packingSuggestions.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#2ECC71] font-bold text-xs mt-0.5">✓</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Saved Travel Destinations (Live Alert Hub) */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#4FA8E0]">flight_takeoff</span>
              Saved Travel Destinations &amp; En-Route Alerts
            </span>
            <button
              type="button"
              onClick={() => setShowAddModal(!showAddModal)}
              className="text-[11px] text-[#4FA8E0] hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">add_circle</span>
              <span>Add Destination</span>
            </button>
          </div>

          {showAddModal && (
            <form onSubmit={handleAddCustom} className="mb-3 p-2 bg-[#131A22] rounded border border-[#334155] flex gap-2">
              <input
                type="text"
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                placeholder="Enter city (e.g., London, Bengaluru, Jaipur)..."
                className="flex-1 bg-[#0F141A] text-white text-xs px-2.5 py-1.5 rounded border border-[#334155] focus:outline-none focus:border-[#4FA8E0]"
              />
              <button
                type="submit"
                className="bg-[#0B72B9] hover:bg-[#0A5A94] text-white text-xs px-3 py-1.5 rounded font-semibold transition-all"
              >
                Add
              </button>
            </form>
          )}

          <div className="space-y-2">
            {destinations.map((dest) => (
              <div
                key={dest.id}
                className="p-2.5 bg-[#131A22] hover:bg-[#17212B] rounded border border-[#334155] flex items-center justify-between text-xs transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-white truncate">{dest.name}</strong>
                    <span className="text-[10px] text-[#8A94A6] truncate">{dest.state}</span>
                    {dest.temp && (
                      <span className="text-[11px] font-mono text-[#4FA8E0] font-bold">
                        {dest.temp}°C
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#8A94A6] mt-0.5 truncate flex items-center gap-1.5">
                    {dest.activeAlert ? (
                      <span className="text-[#FF8C42] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">warning</span>
                        {dest.activeAlert}
                      </span>
                    ) : (
                      <span className="text-[#2ECC71] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">check_circle</span>
                        Weather Favorable
                      </span>
                    )}
                    {dest.packingTip && <span>• {dest.packingTip}</span>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(dest.id)}
                  className="text-[#8A94A6] hover:text-[#E74C3C] p-1 transition-colors ml-2"
                  title="Remove saved destination"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Active Severe Alert Banner if present */}
        {activeAlerts.length > 0 && (
          <div className="mt-3 p-3 rounded bg-[#E74C3C]/10 border border-[#E74C3C]/40 text-xs">
            <div className="flex items-center gap-1.5 text-[#E74C3C] font-bold">
              <span className="material-symbols-outlined text-[16px]">crisis_alert</span>
              <span>Active Travel Alert: {activeAlerts[0].title}</span>
            </div>
            <p className="text-[11px] text-[#D7DEE8] mt-1">
              {activeAlerts[0].description} ({activeAlerts[0].actionItem})
            </p>
          </div>
        )}
      </div>

      {/* Footer Source */}
      <div className="mt-4 pt-3 border-t border-[#334155] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[11px] text-[#8A94A6]">
        <span>Source: <strong>Azure Maps Severe Weather Alerts &amp; IMD Synoptic Forecasting</strong></span>
        <span>Storage: <strong>Persistent Client Bookmarks</strong></span>
      </div>
    </div>
  );
};
