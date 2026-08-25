import React, { useState } from 'react';
import {
  WEATHER_EVENT_OPTIONS,
  DAMAGE_OPTIONS,
  INITIAL_CROWDSOURCE_REPORTS,
} from '../data/crowdsourceData';
import { CrowdsourceReport, WeatherEventType, DamageAssessmentType } from '../types';

export const CrowdsourceView: React.FC = () => {
  const [reports, setReports] = useState<CrowdsourceReport[]>(INITIAL_CROWDSOURCE_REPORTS);
  const [filterEvent, setFilterEvent] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  // Form states
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedTime, setSelectedTime] = useState<string>(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  );
  const [selectedEvent, setSelectedEvent] = useState<WeatherEventType>('Rain');
  const [selectedDamage, setSelectedDamage] = useState<DamageAssessmentType>('None / Nil');
  const [detailsText, setDetailsText] = useState<string>('');
  const [locationName, setLocationName] = useState<string>('Connaught Place, New Delhi');
  const [districtName, setDistrictName] = useState<string>('New Delhi');
  const [stateName, setStateName] = useState<string>('Delhi NCR');
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    type: 'photo' | 'video';
    previewUrl?: string;
  } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Automatic Location Detection
  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsDetectingLocation(false);
          setLocationName(`Lat: ${position.coords.latitude.toFixed(3)}, Lng: ${position.coords.longitude.toFixed(3)} (Auto-detected)`);
          setDistrictName('Local Sector');
          setStateName('Current GPS Zone');
        },
        () => {
          setIsDetectingLocation(false);
          setLocationName('Central Station Corridor');
          setDistrictName('Central District');
          setStateName('Delhi NCR');
        }
      );
    } else {
      setIsDetectingLocation(false);
    }
  };

  // Media upload validation (Photo < 1.5MB, Video < 10MB)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isImage && !isVideo) {
      setFileError('Please upload a valid image (PNG, JPG) or video (MP4, MOV).');
      return;
    }

    if (isImage && file.size > 1.5 * 1024 * 1024) {
      setFileError('Photo size exceeds 1.5 MB limit. Please select a smaller photo.');
      return;
    }

    if (isVideo && file.size > 10 * 1024 * 1024) {
      setFileError('Video size exceeds 10 MB limit. Please select a shorter video clip.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setUploadedFile({
      name: file.name,
      size: Math.round(file.size / 1024),
      type: isVideo ? 'video' : 'photo',
      previewUrl,
    });
  };

  // Submit report to IMD
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();

    // Time limit validation: only today or yesterday
    if (selectedDate !== todayStr && selectedDate !== yesterdayStr) {
      setFileError('Time Limit Error: Observations can only be submitted for Current Day or Previous Day.');
      return;
    }

    const refId = `IMD-CS-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReport: CrowdsourceReport = {
      id: refId,
      timestamp: `${selectedTime} Local (${selectedDate === todayStr ? 'Today' : 'Yesterday'})`,
      date: selectedDate,
      time: selectedTime,
      location: locationName,
      district: districtName,
      state: stateName,
      weatherEvent: selectedEvent,
      damage: selectedDamage,
      details: detailsText || `Citizen weather observation of ${selectedEvent.toLowerCase()} reported in ${districtName}.`,
      reporterName: 'Citizen Weather Observer (You)',
      mediaType: uploadedFile?.type,
      mediaUrl: uploadedFile?.previewUrl || (selectedEvent === 'Rain' ? 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=600&auto=format&fit=crop&q=80' : undefined),
      status: 'Submitted',
      upvotes: 1,
    };

    setReports([newReport, ...reports]);
    setSubmissionSuccess(refId);
    setIsModalOpen(false);

    // Reset form
    setDetailsText('');
    setUploadedFile(null);
    setFileError(null);
  };

  const handleUpvote = (id: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r))
    );
  };

  const filteredReports = reports.filter((r) => {
    if (filterEvent === 'all') return true;
    return r.weatherEvent.toLowerCase() === filterEvent.toLowerCase();
  });

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto select-none">
      {/* Top Banner with Crowdsource Info */}
      <div className="bg-[#131b2e] card-border rounded-xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#38bdf8]/15 border border-[#38bdf8]/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#38bdf8] text-[20px]">
                groups
              </span>
            </div>
            <h2 className="font-label-caps text-xs uppercase text-[#dae2fd] tracking-widest font-bold">
              Mausam Crowdsource • India Meteorological Department (IMD)
            </h2>
          </div>
          <p className="font-data-sm text-xs text-[#bdc8d1] max-w-3xl leading-relaxed">
            Citizens share real-time, local weather observations directly with the IMD. Your crowdsourced ground truth enhances regional numerical nowcasts and disaster warning models.
          </p>
        </div>

        {/* Start Report Action Button */}
        <button
          onClick={() => {
            setIsModalOpen(true);
            setSubmissionSuccess(null);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#38bdf8] text-[#00354a] font-label-caps text-xs uppercase font-bold hover:bg-[#7dd3fc] transition-all cursor-pointer shadow-lg hover:shadow-[#38bdf8]/20 shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          <span>+ Start New Observation</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {submissionSuccess && (
        <div className="bg-[#4edea3]/15 border border-[#4edea3]/40 rounded-lg p-4 flex items-center justify-between gap-3 text-[#dae2fd]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#4edea3] text-[24px]">
              check_circle
            </span>
            <div>
              <p className="font-label-caps text-xs uppercase text-[#4edea3] font-bold">
                Report Successfully Transmitted to IMD Central Server
              </p>
              <p className="font-data-sm text-xs text-[#bdc8d1]">
                Reference Tracking ID: <span className="text-[#38bdf8] font-bold font-mono">{submissionSuccess}</span> • Tagged into IMD Nowcast Radar Stream
              </p>
            </div>
          </div>
          <button
            onClick={() => setSubmissionSuccess(null)}
            className="text-[#bdc8d1] hover:text-[#dae2fd] p-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Filter Chips & Overview Matrix */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0b1326] p-3 rounded-lg card-border font-sans">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#87929a] font-semibold">
            Filter event:
          </span>
          <div className="flex flex-wrap gap-1">
            {['all', 'Rain', 'Drizzle', 'Thunder / Lightning', 'Hailstorm', 'Dust Storm', 'Fog', 'Gusty Wind'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterEvent(f)}
                className={`px-2.5 py-1 text-xs rounded-md transition-all cursor-pointer ${
                  filterEvent.toLowerCase() === f.toLowerCase()
                    ? 'bg-[#38bdf8] text-[#00354a] font-semibold shadow'
                    : 'bg-[#131b2e] text-[#bdc8d1] hover:text-[#dae2fd]'
                }`}
              >
                {f === 'all' ? 'All Events' : f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#bdc8d1]">
          <span>{filteredReports.length} Ground Reports</span>
          <span>•</span>
          <span className="text-[#4edea3] font-semibold">IMD Verified Feed</span>
        </div>
      </div>

      {/* Live Community Reports Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredReports.map((rep) => {
          const eventMeta = WEATHER_EVENT_OPTIONS.find((e) => e.type === rep.weatherEvent) || WEATHER_EVENT_OPTIONS[0];

          return (
            <div
              key={rep.id}
              className="bg-[#131b2e] card-border rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-[#38bdf8]/60 transition-all group"
            >
              <div>
                {/* Header Badge */}
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[18px] card-border"
                      style={{ backgroundColor: `${eventMeta.color}20`, color: eventMeta.color }}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {eventMeta.icon}
                      </span>
                    </span>
                    <div>
                      <h4 className="font-headline-md text-sm font-bold text-[#dae2fd]">
                        {rep.weatherEvent}
                      </h4>
                      <span className="font-data-sm text-[10px] text-[#87929a]">
                        {rep.district}, {rep.state}
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded bg-[#4edea3]/20 text-[#4edea3] text-[9px] font-mono font-bold border border-[#4edea3]/30">
                    {rep.status}
                  </span>
                </div>

                {/* Specific Location & Time */}
                <div className="flex items-center justify-between text-[11px] font-data-sm text-[#bdc8d1] mb-3 bg-[#0b1326] p-2 rounded card-border">
                  <span className="truncate">{rep.location}</span>
                  <span className="text-[#38bdf8] font-bold shrink-0">{rep.timestamp}</span>
                </div>

                {/* Text details */}
                <p className="font-body-md text-xs text-[#dae2fd] leading-relaxed mb-3">
                  {rep.details}
                </p>

                {/* Damage Indicator */}
                <div className="bg-[#171f33] p-2.5 rounded-lg card-border mb-3 flex items-start gap-2">
                  <span className="material-symbols-outlined text-[#fbbf24] text-[16px] shrink-0 mt-0.5">
                    warning
                  </span>
                  <div>
                    <span className="font-label-caps text-[9px] uppercase text-[#87929a] font-bold block">
                      Damage Assessment
                    </span>
                    <span className="font-data-sm text-xs font-semibold text-[#fbbf24]">
                      {rep.damage}
                    </span>
                  </div>
                </div>

                {/* Media Attachment if available */}
                {rep.mediaUrl && (
                  <div className="rounded-lg overflow-hidden card-border mb-3 max-h-40 relative group/img">
                    <img
                      src={rep.mediaUrl}
                      alt="Weather observation"
                      referrerPolicy="no-referrer"
                      className="w-full h-36 object-cover transition-transform group-hover/img:scale-105"
                    />
                    <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-[#dae2fd] text-[9px] font-mono px-2 py-0.5 rounded">
                      {rep.mediaType === 'video' ? 'Video Evidence' : 'Photo Evidence'}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Footer with Reporter & Upvote */}
              <div className="pt-3 border-t border-[#3e484f] flex justify-between items-center text-xs font-data-sm text-[#87929a]">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">person</span>
                  <span className="truncate max-w-[130px]">{rep.reporterName}</span>
                </div>

                <button
                  onClick={() => handleUpvote(rep.id)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#0b1326] hover:bg-[#38bdf8] hover:text-[#00354a] text-[#38bdf8] transition-colors cursor-pointer card-border font-bold"
                >
                  <span className="material-symbols-outlined text-[14px]">thumb_up</span>
                  <span>{rep.upvotes}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Observation Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 select-none animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-[#0b1326] card-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 card-header-divider flex justify-between items-center bg-[#131b2e]">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#38bdf8] text-[22px]">
                  edit_note
                </span>
                <div>
                  <h3 className="font-label-caps text-xs uppercase text-[#dae2fd] tracking-widest font-bold">
                    Submit Mausam Weather Observation
                  </h3>
                  <p className="font-data-sm text-[11px] text-[#bdc8d1]">
                    Direct Citizen Telemetry to India Meteorological Department (IMD)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#bdc8d1] hover:text-[#dae2fd] p-1.5 rounded hover:bg-[#2d3449] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmitReport} className="p-6 overflow-y-auto flex flex-col gap-4">
              {fileError && (
                <div className="p-3 rounded bg-[#ffb4ab]/15 border border-[#ffb4ab]/30 text-[#ffb4ab] text-xs font-body-md flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{fileError}</span>
                </div>
              )}

              {/* 1. Location Selection & Geolocation */}
              <div className="bg-[#131b2e] p-3.5 rounded-lg card-border flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="font-label-caps text-[10px] uppercase text-[#38bdf8] font-bold">
                    1. Observation Location
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isDetectingLocation}
                    className="flex items-center gap-1 text-[10px] font-mono text-[#4edea3] hover:underline cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {isDetectingLocation ? 'sync' : 'my_location'}
                    </span>
                    {isDetectingLocation ? 'Detecting GPS...' : 'Auto-Detect Location'}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Specific Landmark / Street"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="bg-[#0b1326] card-border rounded px-3 py-2 text-xs font-body-md text-[#dae2fd] focus:outline-none focus:border-[#38bdf8]"
                  />
                  <input
                    type="text"
                    required
                    placeholder="District / City (e.g. New Delhi)"
                    value={districtName}
                    onChange={(e) => setDistrictName(e.target.value)}
                    className="bg-[#0b1326] card-border rounded px-3 py-2 text-xs font-body-md text-[#dae2fd] focus:outline-none focus:border-[#38bdf8]"
                  />
                </div>
              </div>

              {/* 2. Date & Time Selection (Restricted to Today or Yesterday) */}
              <div className="bg-[#131b2e] p-3.5 rounded-lg card-border flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="font-label-caps text-[10px] uppercase text-[#38bdf8] font-bold">
                    2. Date &amp; Time (Time Limit: Today or Yesterday)
                  </label>
                  <span className="font-data-sm text-[9px] text-[#fbbf24]">
                    Max 48h limit enforced
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-[#0b1326] card-border rounded px-3 py-2 text-xs font-mono text-[#dae2fd] focus:outline-none focus:border-[#38bdf8]"
                  >
                    <option value={todayStr}>Today ({todayStr})</option>
                    <option value={yesterdayStr}>Yesterday ({yesterdayStr})</option>
                  </select>
                  <input
                    type="time"
                    required
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="bg-[#0b1326] card-border rounded px-3 py-2 text-xs font-mono text-[#dae2fd] focus:outline-none focus:border-[#38bdf8]"
                  />
                </div>
              </div>

              {/* 3. Weather Event Selection */}
              <div>
                <label className="font-label-caps text-[10px] uppercase text-[#38bdf8] font-bold block mb-1.5">
                  3. Select Observed Weather Event
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {WEATHER_EVENT_OPTIONS.map((evt) => {
                    const isSelected = selectedEvent === evt.type;
                    return (
                      <button
                        type="button"
                        key={evt.type}
                        onClick={() => setSelectedEvent(evt.type)}
                        className={`p-2 rounded-lg card-border flex flex-col items-center gap-1 transition-all cursor-pointer text-center ${
                          isSelected
                            ? 'bg-[#38bdf8]/20 border-[#38bdf8] text-[#dae2fd] shadow-md ring-1 ring-[#38bdf8]'
                            : 'bg-[#131b2e] text-[#bdc8d1] hover:bg-[#171f33]'
                        }`}
                      >
                        <span
                          className="material-symbols-outlined text-[20px]"
                          style={{ color: evt.color }}
                        >
                          {evt.icon}
                        </span>
                        <span className="font-label-caps text-[9px] uppercase font-bold">
                          {evt.type}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Damage Assessment */}
              <div>
                <label className="font-label-caps text-[10px] uppercase text-[#38bdf8] font-bold block mb-1.5">
                  4. Damage Assessment Caused
                </label>
                <select
                  value={selectedDamage}
                  onChange={(e) => setSelectedDamage(e.target.value as DamageAssessmentType)}
                  className="w-full bg-[#131b2e] card-border rounded-lg px-3.5 py-2.5 text-xs font-body-md text-[#dae2fd] focus:outline-none focus:border-[#38bdf8]"
                >
                  {DAMAGE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Details Text */}
              <div>
                <label className="font-label-caps text-[10px] uppercase text-[#38bdf8] font-bold block mb-1.5">
                  5. Brief Weather Observations &amp; Ground Context
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe intensity, wind gusts, hail size, street water accumulation..."
                  value={detailsText}
                  onChange={(e) => setDetailsText(e.target.value)}
                  className="w-full bg-[#131b2e] card-border rounded-lg px-3.5 py-2 text-xs font-body-md text-[#dae2fd] focus:outline-none focus:border-[#38bdf8]"
                />
              </div>

              {/* 6. Media Attachment (Photo < 1.5MB, Video < 10MB) */}
              <div className="bg-[#131b2e] p-3.5 rounded-lg card-border">
                <div className="flex justify-between items-center mb-2">
                  <label className="font-label-caps text-[10px] uppercase text-[#38bdf8] font-bold">
                    6. Upload Photo (&lt; 1.5 MB) or Video (&lt; 10 MB)
                  </label>
                  <span className="font-data-sm text-[9px] text-[#87929a]">
                    Optional evidence
                  </span>
                </div>

                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-[#bdc8d1] file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#38bdf8] file:text-[#00354a] hover:file:bg-[#7dd3fc] cursor-pointer"
                />

                {uploadedFile && (
                  <div className="mt-2.5 p-2 rounded bg-[#0b1326] card-border flex items-center justify-between text-xs font-data-sm text-[#4edea3]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">
                        {uploadedFile.type === 'photo' ? 'image' : 'videocam'}
                      </span>
                      <span>
                        {uploadedFile.name} ({uploadedFile.size} KB) - Validated
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedFile(null)}
                      className="text-[#ffb4ab] hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-[#3e484f] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#171f33] text-[#bdc8d1] font-label-caps text-xs uppercase hover:bg-[#2d3449] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#38bdf8] text-[#00354a] font-label-caps text-xs uppercase font-bold hover:bg-[#7dd3fc] transition-all cursor-pointer shadow-md"
                >
                  Submit to IMD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
