import { useState, useEffect } from 'react';

const SAVED_REPORTS_KEY = 'mausam_saved_reports_v1';
const RECENTLY_VIEWED_KEY = 'mausam_recent_reports_v1';

export function useSavedReports() {
  const [savedReportIds, setSavedReportIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(SAVED_REPORTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_REPORTS_KEY, JSON.stringify(savedReportIds));
    } catch (e) {
      console.error('Failed to save bookmarks to localStorage', e);
    }
  }, [savedReportIds]);

  useEffect(() => {
    try {
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentlyViewedIds));
    } catch (e) {
      console.error('Failed to save recent reports to localStorage', e);
    }
  }, [recentlyViewedIds]);

  const toggleSaveReport = (reportId: string) => {
    setSavedReportIds(prev =>
      prev.includes(reportId) ? prev.filter(id => id !== reportId) : [...prev, reportId]
    );
  };

  const isReportSaved = (reportId: string) => savedReportIds.includes(reportId);

  const addRecentlyViewed = (reportId: string) => {
    setRecentlyViewedIds(prev => {
      const filtered = prev.filter(id => id !== reportId);
      return [reportId, ...filtered].slice(0, 6);
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewedIds([]);
  };

  return {
    savedReportIds,
    toggleSaveReport,
    isReportSaved,
    recentlyViewedIds,
    addRecentlyViewed,
    clearRecentlyViewed,
  };
}
