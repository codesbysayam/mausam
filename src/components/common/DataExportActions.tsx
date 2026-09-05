import React, { useState } from 'react';
import { Download, FileSpreadsheet, Printer, Check } from 'lucide-react';
import { StateWeatherData } from '../map/IndiaWeatherMap';
import { INDIA_WEATHER_DATA } from '../../data/indiaWeatherData';

interface DataExportActionsProps {
  data?: StateWeatherData[];
  reportTitle?: string;
}

export const DataExportActions: React.FC<DataExportActionsProps> = ({
  data = INDIA_WEATHER_DATA,
  reportTitle = 'Mausam National Atmospheric Observation Report',
}) => {
  const [downloadedFormat, setDownloadedFormat] = useState<string | null>(null);

  const generateCSVContent = () => {
    const headers = [
      'State_Code',
      'State_Name',
      'Capital_Station',
      'Temperature_C',
      'Rainfall_24h_mm',
      'Air_Quality_AQI',
      'Relative_Humidity_Pct',
      'Wind_Speed_kmh',
      'Wind_Direction',
      'Atmospheric_Condition',
      'Warning_Level',
      'Warning_Message',
      'Observation_Time_IST',
      'Data_Source_Attribution',
    ];

    const rows = data.map((item) => [
      `"${item.id}"`,
      `"${item.name}"`,
      `"${item.city || 'Regional Station'}"`,
      item.temperature ?? 'N/A',
      item.rainfall ?? 0,
      item.aqi ?? 'N/A',
      item.humidity ?? 'N/A',
      item.windSpeed ?? 'N/A',
      `"${item.windDir || 'N/A'}"`,
      `"${item.condition || 'Clear'}"`,
      `"${(item.warningLevel || 'NORMAL').toUpperCase()}"`,
      `"${(item.warningMessage || 'Routine observation').replace(/"/g, '""')}"`,
      `"${item.updatedAt || '21:00 IST'}"`,
      `"${item.dataSource || 'IMD National Synoptic Observational Grid'}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  };

  const handleDownloadCSV = () => {
    const csvData = generateCSVContent();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MAUSAM_National_Weather_Data_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadedFormat('csv');
    setTimeout(() => setDownloadedFormat(null), 2500);
  };

  const handleExportExcel = () => {
    // Generates an Excel-ready tab-delimited or CSV file with MIME type for spreadsheet apps
    const csvData = generateCSVContent();
    const blob = new Blob([csvData], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MAUSAM_National_Weather_Report_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadedFormat('excel');
    setTimeout(() => setDownloadedFormat(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="data-export-action-bar"
      className="flex flex-wrap items-center gap-2 p-2.5 bg-[#17212B] border border-[#334155] rounded-xl text-xs"
    >
      <span className="text-[#8A94A6] font-bold text-[11px] uppercase tracking-wider mr-1">
        DATA EXPORT:
      </span>

      {/* Download CSV Button */}
      <button
        type="button"
        id="btn-download-csv"
        onClick={handleDownloadCSV}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E2733] hover:bg-[#2A3749] border border-[#334155] hover:border-[#4FA8E0] text-white rounded-lg transition-colors cursor-pointer"
      >
        {downloadedFormat === 'csv' ? (
          <Check className="w-3.5 h-3.5 text-[#2ECC71]" />
        ) : (
          <Download className="w-3.5 h-3.5 text-[#4FA8E0]" />
        )}
        <span>DOWNLOAD CSV</span>
      </button>

      {/* Export Excel Button */}
      <button
        type="button"
        id="btn-export-excel"
        onClick={handleExportExcel}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E2733] hover:bg-[#2A3749] border border-[#334155] hover:border-[#2ECC71] text-white rounded-lg transition-colors cursor-pointer"
      >
        {downloadedFormat === 'excel' ? (
          <Check className="w-3.5 h-3.5 text-[#2ECC71]" />
        ) : (
          <FileSpreadsheet className="w-3.5 h-3.5 text-[#2ECC71]" />
        )}
        <span>EXPORT EXCEL</span>
      </button>

      {/* Print Report Button */}
      <button
        type="button"
        id="btn-print-report"
        onClick={handlePrint}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E2733] hover:bg-[#2A3749] border border-[#334155] hover:border-[#F1C40F] text-white rounded-lg transition-colors cursor-pointer"
      >
        <Printer className="w-3.5 h-3.5 text-[#F1C40F]" />
        <span>PRINT REPORT</span>
      </button>

      <span className="ml-auto text-[10px] text-[#8A94A6] font-mono hidden md:inline">
        Official IMD Observation Format
      </span>
    </div>
  );
};
