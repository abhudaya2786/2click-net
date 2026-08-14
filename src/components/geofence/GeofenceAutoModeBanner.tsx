import React from 'react';
import {
  MapPin,
  Radio,
  Power,
  Play,
  X,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  LocateFixed,
  Compass,
  Zap,
} from 'lucide-react';
import { useGeofence } from '../../context/GeofenceContext';
import { formatDistance } from '../../utils/geofenceManager';

interface GeofenceAutoModeBannerProps {
  onOpenSettings?: () => void;
  onNavigate?: (path: string) => void;
}

export const GeofenceAutoModeBanner: React.FC<GeofenceAutoModeBannerProps> = ({
  onOpenSettings,
  onNavigate,
}) => {
  const {
    isAutoModeEnabled,
    toggleAutoMode,
    evaluation,
    countdownSeconds,
    cancelCountdown,
    isSimulating,
    resetSimulation,
    simulateArrival,
    locations,
    permissionStatus,
    requestGpsPermission,
  } = useGeofence();

  const matched = evaluation.matchedLocation;
  const nearest = evaluation.nearestLocation;

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 text-white relative z-20 shadow-md">
      {/* Top Countdown Overlay Alert (When Arrived Inside Geofence) */}
      {countdownSeconds !== null && matched && (
        <div className="bg-gradient-to-r from-emerald-600 via-hs-600 to-indigo-600 px-4 py-2.5 text-white shadow-lg animate-in slide-in-from-top-2 duration-300">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-black text-lg animate-pulse">
                {countdownSeconds}
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-100">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Geofence Arrival Detected: {matched.name}</span>
                </div>
                <p className="text-xs text-white/90 font-medium">
                  Auto-Recording & Minutes of Meeting (MoM) launching in{' '}
                  <strong className="text-amber-200">{countdownSeconds}s</strong>...
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={cancelCountdown}
                className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Status Bar */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Indicator & Status */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleAutoMode()}
              className={`px-2.5 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${
                isAutoModeEnabled
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Location Auto-Recording Mode ON / OFF"
            >
              <Power className="w-3.5 h-3.5" />
              <span>Auto Mode: {isAutoModeEnabled ? 'ON' : 'OFF'}</span>
            </button>

            {isSimulating && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" />
                <span>SIMULATED GPS</span>
              </span>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs">
            {isAutoModeEnabled ? (
              matched ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Inside {matched.name} (Armed for Recording & MoM)
                </span>
              ) : nearest ? (
                <span className="text-slate-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Nearest: <strong>{nearest.name}</strong> ({formatDistance(evaluation.distanceToNearestMeters)} away)</span>
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-slate-500" />
                  <span>Monitoring location perimeter...</span>
                </span>
              )
            ) : (
              <span className="text-slate-400 text-xs">
                Auto-Record on location arrival is disabled.
              </span>
            )}
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          {permissionStatus === 'denied' && (
            <button
              onClick={() => requestGpsPermission()}
              className="px-2.5 py-1 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-1 hover:bg-rose-500/30 transition cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Enable GPS Permission</span>
            </button>
          )}

          {isSimulating ? (
            <button
              onClick={resetSimulation}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
              title="Reset simulated GPS coordinates back to real device hardware"
            >
              <LocateFixed className="w-3.5 h-3.5 text-indigo-400" />
              <span>Exit Simulation</span>
            </button>
          ) : (
            locations.length > 0 && (
              <button
                onClick={() => simulateArrival(locations[0].id)}
                className="px-2.5 py-1 rounded-xl bg-indigo-950/80 border border-indigo-700/60 hover:bg-indigo-900 text-indigo-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                title={`Test instant arrival at ${locations[0].name}`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Simulate Arrival:</span> {locations[0].name.split('-')[0].trim()}
              </button>
            )
          )}

          <button
            onClick={() => {
              if (onOpenSettings) onOpenSettings();
              else if (onNavigate) onNavigate('/settings/location');
            }}
            className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Locations ({locations.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
