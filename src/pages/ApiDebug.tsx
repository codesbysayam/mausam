import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, Activity, Database, Server, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { imdService } from '../services/imdService';
import { LiveDataIndicator } from '../components/common/LiveDataIndicator';

export const ApiDebugPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await imdService.getDebugStats();
      setStats(res?.stats || null);
    } catch (e: any) {
      console.error('Debug stats fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const runEndpointTest = async (name: string, fn: () => Promise<any>) => {
    setTestingEndpoint(name);
    const start = performance.now();
    try {
      const res = await fn();
      const duration = Math.round(performance.now() - start);
      setTestResults((prev) => ({
        ...prev,
        [name]: {
          status: res?.status || 'success',
          ok: res?.status === 'success' || res?.status === 'stale',
          durationMs: duration,
          data: res?.data,
          error: res?.error,
          fetchedAt: res?.fetchedAt,
          stale: res?.stale,
        },
      }));
    } catch (err: any) {
      const duration = Math.round(performance.now() - start);
      setTestResults((prev) => ({
        ...prev,
        [name]: {
          status: 'error',
          ok: false,
          durationMs: duration,
          error: { message: err.message },
        },
      }));
    } finally {
      setTestingEndpoint(null);
      fetchStats();
    }
  };

  const testEndpoints = [
    { name: 'Current Weather (National/All)', path: '/api/imd/current-weather', fn: () => imdService.getCurrentWeather() },
    { name: 'Current Weather (Bhubaneswar - 42971)', path: '/api/imd/current-weather/42971', fn: () => imdService.getCurrentWeather('42971') },
    { name: 'City Forecast (Delhi - 42182)', path: '/api/imd/city-forecast/42182', fn: () => imdService.getCityForecast('42182') },
    { name: 'District Warnings', path: '/api/imd/district-warning', fn: () => imdService.getDistrictWarnings() },
    { name: 'State Rainfall', path: '/api/imd/state-rainfall', fn: () => imdService.getStateRainfall() },
    { name: 'AWS Surface Telemetry', path: '/api/imd/aws', fn: () => imdService.getAWSData() },
    { name: 'Sun/Moon Ephemeris (20.3°N, 85.8°E)', path: '/api/imd/sunmoon', fn: () => imdService.getSunMoon(20.2961, 85.8245) },
    { name: 'Cyclone Bundle (Track/Wind/Cone)', path: '/api/imd/cyclone-bundle', fn: () => imdService.getCycloneBundle() },
    { name: 'Marine Bulletins (Port/Sea/Coastal)', path: '/api/imd/marine-bundle', fn: () => imdService.getMarineBundle() },
    { name: 'National Synoptic Overview', path: '/api/imd/overview', fn: () => imdService.getNationalOverview() },
    { name: 'AQI Provider (Rule 30 - No Fake Data)', path: '/api/imd/environment/aqi', fn: () => imdService.getAQI(28.61, 77.20, 'Delhi') },
    { name: 'Pollen Provider (Rule 30 - No Fake Data)', path: '/api/imd/environment/pollen', fn: () => imdService.getPollen(28.61, 77.20) },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-bold font-mono">IMD API Integration & Diagnostics Engine</h1>
          </div>
          <p className="text-slate-400 text-sm">
            Real-time telemetry, cache hit/miss statistics, latency monitoring, and official IMD endpoint validation.
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-mono text-xs flex items-center gap-2 transition-all shadow-md"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
      </div>

      {/* Cache & Deduplication Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-mono font-semibold uppercase">Cache Hits</span>
            <Database className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{stats?.hits ?? 0}</div>
          <div className="text-xs text-slate-400 mt-1">Instant server memory returns</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-mono font-semibold uppercase">Cache Misses</span>
            <Server className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{stats?.misses ?? 0}</div>
          <div className="text-xs text-slate-400 mt-1">Upstream requests dispatched</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-mono font-semibold uppercase">Deduplicated Calls</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{stats?.dedupes ?? 0}</div>
          <div className="text-xs text-slate-400 mt-1">In-flight concurrent reuse</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-mono font-semibold uppercase">Stale Serves</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{stats?.staleServes ?? 0}</div>
          <div className="text-xs text-slate-400 mt-1">Fallback on upstream latency</div>
        </div>
      </div>

      {/* Active Cache Entries */}
      {stats?.entries && stats.entries.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-mono text-sm font-semibold text-slate-700 flex justify-between items-center">
            <span>In-Memory Cache Registry ({stats.entries.length} entries)</span>
            <span className="text-xs text-slate-500 font-normal">TTL: 60s - 300s</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {stats.entries.map((entry: any, i: number) => (
              <div key={i} className="p-3 text-xs font-mono flex items-center justify-between hover:bg-slate-50">
                <span className="font-semibold text-slate-800">{entry.key}</span>
                <div className="flex items-center gap-4 text-slate-500">
                  <span>Hits: {entry.hitCount}</span>
                  <span className={entry.isExpired ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                    {entry.isExpired ? 'STALE' : `Expires in ${entry.expiresInSec}s`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Endpoint Validation Runner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-mono text-sm font-semibold text-slate-700 flex justify-between items-center">
          <span>Live IMD Endpoint Test Suite</span>
          <span className="text-xs text-slate-500 font-normal">Test single or multiple endpoints</span>
        </div>

        <div className="divide-y divide-slate-200">
          {testEndpoints.map((ep, idx) => {
            const result = testResults[ep.name];
            const isTesting = testingEndpoint === ep.name;

            return (
              <div key={idx} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="space-y-1">
                  <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                    <span>{ep.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-mono">
                      {ep.path}
                    </span>
                  </div>
                  {result && (
                    <div className="text-xs font-mono flex items-center gap-3 mt-1">
                      <span className={`inline-flex items-center gap-1 font-semibold ${result.ok ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {result.ok ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                        {result.status.toUpperCase()}
                      </span>
                      <span className="text-slate-500">Latency: {result.durationMs}ms</span>
                      {result.error && (
                        <span className="text-rose-600 font-normal truncate max-w-md">
                          ({result.error.code || 'ERR'}: {result.error.message})
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => runEndpointTest(ep.name, ep.fn)}
                  disabled={isTesting}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all disabled:opacity-50 shrink-0"
                >
                  <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                  {isTesting ? 'Testing...' : 'Execute Test'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default ApiDebugPage;
