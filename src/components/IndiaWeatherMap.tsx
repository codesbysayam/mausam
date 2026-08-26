import React, { useMemo, useState } from "react";
import India from "@svg-maps/india";
import { INDIA_WEATHER_DATA } from "../data/indiaWeatherData";
import "../styles/india-weather-map.css";

export type WeatherMapMetric =
  | "temperature"
  | "humidity"
  | "aqi"
  | "pollen"
  | "rainfall";

export interface StateWeatherData {
  id: string;
  name: string;
  temperature?: number;
  humidity?: number;
  aqi?: number;
  pollen?: number;
  rainfall?: number;
  condition?: string;
  city?: string;
  updatedAt?: string;
}

interface IndiaWeatherMapProps {
  data?: StateWeatherData[];
  metric?: WeatherMapMetric;
  onMetricChange?: (metric: WeatherMapMetric) => void;
  selectedState?: string | null;
  onStateSelect?: (state: StateWeatherData) => void;
}

const INDIA_MAP_COLORS = {
  background: "#0A0F14",
  surface: "#0F141A",
  state: "#1E2733",
  stateHover: "#0B72B9",
  stateSelected: "#4FA8E0",
  border: "#4A5568",
  text: "#FFFFFF",
  muted: "#8A94A6",
};

function getMetricValue(
  state: StateWeatherData,
  metric: WeatherMapMetric
): number | undefined {
  switch (metric) {
    case "temperature":
      return state.temperature;
    case "humidity":
      return state.humidity;
    case "aqi":
      return state.aqi;
    case "pollen":
      return state.pollen;
    case "rainfall":
      return state.rainfall;
    default:
      return undefined;
  }
}

function getTemperatureColor(value?: number) {
  if (value === undefined) return INDIA_MAP_COLORS.state;
  if (value <= 15) return "#5AC8E0";
  if (value <= 22) return "#3A6EA5";
  if (value <= 26) return "#4FA8E0";
  if (value <= 30) return "#FFC93C";
  if (value <= 34) return "#FF8C42";
  return "#E85D4C";
}

function getAQIColor(value?: number) {
  if (value === undefined) return INDIA_MAP_COLORS.state;
  if (value <= 50) return "#2ECC71"; // Good
  if (value <= 100) return "#F1C40F"; // Satisfactory/Moderate
  if (value <= 200) return "#FF8C42"; // Moderate/Poor
  if (value <= 300) return "#E85D4C"; // Poor
  if (value <= 400) return "#9B59B6"; // Very Poor
  return "#7F1D1D"; // Severe
}

function getHumidityColor(value?: number) {
  if (value === undefined) return INDIA_MAP_COLORS.state;
  if (value < 40) return "#FF8C42";
  if (value < 55) return "#FFC93C";
  if (value < 70) return "#4FA8E0";
  if (value < 85) return "#3A6EA5";
  return "#5AC8E0";
}

function getRainfallColor(value?: number) {
  if (value === undefined) return INDIA_MAP_COLORS.state;
  if (value === 0) return "#1E2733";
  if (value < 5) return "#3A6EA5";
  if (value < 15) return "#4FA8E0";
  if (value < 30) return "#5AC8E0";
  return "#2ECC71";
}

function getPollenColor(value?: number) {
  if (value === undefined) return INDIA_MAP_COLORS.state;
  if (value <= 2) return "#2ECC71";
  if (value <= 3) return "#F1C40F";
  if (value <= 4) return "#FF8C42";
  return "#E85D4C";
}

function getStateColor(
  state: StateWeatherData,
  metric: WeatherMapMetric
): string {
  const value = getMetricValue(state, metric);
  switch (metric) {
    case "temperature":
      return getTemperatureColor(value);
    case "aqi":
      return getAQIColor(value);
    case "humidity":
      return getHumidityColor(value);
    case "rainfall":
      return getRainfallColor(value);
    case "pollen":
      return getPollenColor(value);
    default:
      return INDIA_MAP_COLORS.state;
  }
}

export default function IndiaWeatherMap({
  data = INDIA_WEATHER_DATA,
  metric: controlledMetric,
  onMetricChange,
  selectedState,
  onStateSelect,
}: IndiaWeatherMapProps) {
  const [internalMetric, setInternalMetric] = useState<WeatherMapMetric>("temperature");
  const metric = controlledMetric || internalMetric;

  const [hoveredState, setHoveredState] = useState<StateWeatherData | null>(null);

  const handleMetricSelect = (newMetric: WeatherMapMetric) => {
    setInternalMetric(newMetric);
    if (onMetricChange) {
      onMetricChange(newMetric);
    }
  };

  // Map data lookup table with aliases for flexible matching
  const dataMap = useMemo(() => {
    const map = new Map<string, StateWeatherData>();
    const safeData = data || INDIA_WEATHER_DATA;
    safeData.forEach((item) => {
      map.set(item.name.toLowerCase().trim(), item);
      map.set(item.id.toLowerCase().trim(), item);
      if (item.name === "Dadra and Nagar Haveli and Daman and Diu") {
        map.set("dadra and nagar haveli", item);
        map.set("daman and diu", item);
      }
      if (item.name === "Odisha") {
        map.set("orissa", item);
        map.set("or", item);
      }
      if (item.name === "Uttarakhand") {
        map.set("uttaranchal", item);
        map.set("ut", item);
      }
      if (item.name === "Telangana") {
        map.set("tg", item);
        map.set("ts", item);
      }
      if (item.name === "Chhattisgarh") {
        map.set("ct", item);
        map.set("cg", item);
      }
      if (item.name === "Puducherry") {
        map.set("pondicherry", item);
        map.set("py", item);
      }
      if (item.name === "Delhi") {
        map.set("national capital territory of delhi", item);
        map.set("dl", item);
      }
    });
    return map;
  }, [data]);

  const getStateData = (location: { id: string; name: string }): StateWeatherData | undefined => {
    return (
      dataMap.get(location.name.toLowerCase().trim()) ||
      dataMap.get(location.id.toLowerCase().trim())
    );
  };

  // Normalize India SVG map object
  const indiaMap = useMemo(() => {
    const mapObj = (India as any)?.default || India;
    return {
      viewBox: mapObj?.viewBox || "0 0 612 696",
      label: mapObj?.label || "Map of India",
      locations: mapObj?.locations || [],
    };
  }, []);

  const getLegendDetails = () => {
    switch (metric) {
      case "temperature":
        return {
          title: "Temperature (°C)",
          gradient: "linear-gradient(90deg, #5AC8E0 0%, #3A6EA5 25%, #4FA8E0 45%, #FFC93C 70%, #FF8C42 85%, #E85D4C 100%)",
          labels: ["13°C (Cool)", "24°C (Mild)", "30°C (Warm)", "38°C (Hot)"],
        };
      case "aqi":
        return {
          title: "Air Quality Index (AQI - PM2.5)",
          gradient: "linear-gradient(90deg, #2ECC71 0%, #F1C40F 30%, #FF8C42 60%, #E85D4C 85%, #9B59B6 100%)",
          labels: ["0-50 Good", "51-100 Moderate", "101-200 Poor", "201-300 Unhealthy", "300+ Severe"],
        };
      case "humidity":
        return {
          title: "Relative Humidity (%)",
          gradient: "linear-gradient(90deg, #FF8C42 0%, #FFC93C 30%, #4FA8E0 65%, #3A6EA5 85%, #5AC8E0 100%)",
          labels: ["30% (Dry)", "55% (Balanced)", "75% (Humid)", "90%+ (Very Humid)"],
        };
      case "rainfall":
        return {
          title: "24-Hour Precipitation (mm)",
          gradient: "linear-gradient(90deg, #1E2733 0%, #3A6EA5 25%, #4FA8E0 50%, #5AC8E0 75%, #2ECC71 100%)",
          labels: ["0 mm", "5 mm (Light)", "15 mm (Moderate)", "30+ mm (Heavy)"],
        };
      case "pollen":
        return {
          title: "Pollen Risk Index (1 - 5)",
          gradient: "linear-gradient(90deg, #2ECC71 0%, #F1C40F 40%, #FF8C42 75%, #E85D4C 100%)",
          labels: ["1-2 Low", "3 Moderate", "4 High", "5 Extreme"],
        };
    }
  };

  const legend = getLegendDetails();

  return (
    <div className="india-weather-map" id="india-weather-map-container">
      {/* Header */}
      <div className="india-weather-map__header">
        <div>
          <div className="india-weather-map__eyebrow">
            INDIA SYNOPTIC WEATHER MAP
          </div>
          <h2 id="india-weather-map-title">Current Conditions Across India</h2>
          <p>
            Interactive State &amp; Union Territory environmental overview
            (28 States + 8 Union Territories)
          </p>
        </div>

        {/* Metric Switcher Controls */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-wrap items-center gap-1.5 bg-[#0b1326] p-1.5 rounded-xl border border-[#1e2733]">
            {(
              [
                { key: "temperature", label: "Temperature", icon: "device_thermostat" },
                { key: "aqi", label: "AQI", icon: "air" },
                { key: "humidity", label: "Humidity", icon: "water_drop" },
                { key: "pollen", label: "Pollen", icon: "grain" },
                { key: "rainfall", label: "Rainfall", icon: "rainy" },
              ] as const
            ).map((m) => (
              <button
                key={m.key}
                id={`map-layer-btn-${m.key}`}
                type="button"
                onClick={() => handleMetricSelect(m.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  metric === m.key
                    ? "bg-[#0B72B9] text-white shadow-md border border-[#4FA8E0]/40"
                    : "text-[#8A94A6] hover:text-white hover:bg-[#171f33]"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          <div className="india-weather-map__metric">
            <span>ACTIVE LAYER</span>
            <strong>{metric.toUpperCase()}</strong>
          </div>
        </div>
      </div>

      {/* Map Interactive Body */}
      <div className="india-weather-map__body">
        <div className="india-map-wrapper">
          <svg
            viewBox={indiaMap.viewBox}
            className="india-map-svg"
            role="img"
            aria-label="Interactive weather map of India showing all 28 states and 8 union territories"
          >
            {indiaMap.locations.map((loc: { id: string; name: string; path: string }) => {
              const stateData = getStateData(loc);
              const isSelected =
                Boolean(
                  selectedState &&
                    (selectedState.toLowerCase() === loc.name.toLowerCase() ||
                      selectedState.toLowerCase() === loc.id.toLowerCase() ||
                      (stateData &&
                        selectedState.toLowerCase() === stateData.name.toLowerCase()))
                );

              const stateColor = stateData
                ? getStateColor(stateData, metric)
                : INDIA_MAP_COLORS.state;

              return (
                <path
                  key={loc.id}
                  id={`state-path-${loc.id}`}
                  d={loc.path}
                  fill={stateColor}
                  className={isSelected ? "is-selected" : ""}
                  tabIndex={0}
                  role="button"
                  aria-label={`${loc.name} - ${
                    stateData
                      ? `${stateData.city || ""}: ${
                          metric === "temperature"
                            ? `${stateData.temperature}°C`
                            : metric === "aqi"
                            ? `AQI ${stateData.aqi}`
                            : metric === "humidity"
                            ? `${stateData.humidity}%`
                            : metric === "rainfall"
                            ? `${stateData.rainfall} mm`
                            : `Pollen ${stateData.pollen}`
                        }`
                      : "Data unavailable"
                  }`}
                  onMouseEnter={() => {
                    if (stateData) {
                      setHoveredState(stateData);
                    } else {
                      setHoveredState({
                        id: loc.id,
                        name: loc.name,
                        condition: "Data synced with Regional Met Center",
                      });
                    }
                  }}
                  onMouseLeave={() => setHoveredState(null)}
                  onClick={() => {
                    if (stateData && onStateSelect) {
                      onStateSelect(stateData);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (stateData && onStateSelect) {
                        onStateSelect(stateData);
                      }
                    }
                  }}
                  style={{
                    fill: isSelected
                      ? INDIA_MAP_COLORS.stateSelected
                      : stateColor,
                  }}
                />
              );
            })}
          </svg>
        </div>

        {/* Hover / Selected Details Tooltip */}
        {hoveredState && (
          <div className="india-map-tooltip animate-in fade-in zoom-in-95 duration-150" id="india-map-state-tooltip">
            <div className="tooltip-title">{hoveredState.name}</div>

            {hoveredState.city && (
              <div className="tooltip-city">
                Regional Hub: {hoveredState.city}
              </div>
            )}

            <div className="tooltip-value">
              {metric === "temperature" &&
                hoveredState.temperature !== undefined &&
                `${hoveredState.temperature}°C`}

              {metric === "humidity" &&
                hoveredState.humidity !== undefined &&
                `${hoveredState.humidity}%`}

              {metric === "aqi" &&
                hoveredState.aqi !== undefined &&
                `AQI ${hoveredState.aqi}`}

              {metric === "pollen" &&
                hoveredState.pollen !== undefined &&
                `Pollen ${hoveredState.pollen}/5`}

              {metric === "rainfall" &&
                hoveredState.rainfall !== undefined &&
                `${hoveredState.rainfall} mm`}

              {getMetricValue(hoveredState, metric) === undefined && "Data Synced"}
            </div>

            {hoveredState.condition && (
              <div className="tooltip-condition flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">
                  cloud_sync
                </span>
                {hoveredState.condition}
              </div>
            )}

            <div className="mt-2 pt-1.5 border-t border-white/10 text-[10px] text-[#4FA8E0] font-medium flex items-center justify-between">
              <span>Click to sync dashboard</span>
              <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Legend */}
      <div className="india-weather-map__legend">
        <div className="flex justify-between items-center mb-1.5">
          <span className="legend-title">{legend.title}</span>
          <span className="text-[10px] text-[#8A94A6]">Source: IMD Synoptic Network</span>
        </div>

        <div
          className="legend-gradient"
          style={{ background: legend.gradient }}
        />

        <div className="legend-labels">
          {legend.labels.map((lbl, idx) => (
            <span key={idx}>{lbl}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
