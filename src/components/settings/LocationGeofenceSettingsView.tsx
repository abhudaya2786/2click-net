import React, { useState } from 'react';
import {
  MapPin,
  Power,
  Compass,
  LocateFixed,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Sparkles,
  Zap,
  Radio,
  Sliders,
  Volume2,
  Shield,
  Clock,
  ArrowLeft,
  Navigation,
  Activity,
  Layers,
  Building,
  Home,
  Briefcase,
  Coffee,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { useGeofence } from '../../context/GeofenceContext';
import { GeofenceLocationEntity } from '../../types';
import { formatDistance } from '../../utils/geofenceManager';
import { reverseGeocode } from '../../utils/reverseGeocode';
import { FieldSessionControls } from '../field/FieldSessionControls';

interface LocationGeofenceSettingsViewProps {
  onNavigate: (path: string) => void;
}

export const LocationGeofenceSettingsView: React.FC<LocationGeofenceSettingsViewProps> = ({
  onNavigate,
}) => {
  const {
    isAutoModeEnabled,
    toggleAutoMode,
    config,
    updateConfig,
    locations,
    addLocation,
    updateLocation,
    deleteLocation,
    userCoords,
    evaluation,
    permissionStatus,
    requestGpsPermission,
    simulateArrival,
    resetSimulation,
    isSimulating,
  } = useGeofence();

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocId, setEditingLocId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<GeofenceLocationEntity['category']>('Office');
  const [formAddress, setFormAddress] = useState('');
  const [formLat, setFormLat] = useState<number>(28.4986);
  const [formLng, setFormLng] = useState<number>(77.0894);
  const [formRadius, setFormRadius] = useState<number>(75);
  const [formAutoRecord, setFormAutoRecord] = useState(true);
  const [formAutoMoM, setFormAutoMoM] = useState(true);
  const [formDefaultTitle, setFormDefaultTitle] = useState('');
  const [formDefaultDept, setFormDefaultDept] = useState('General');
  const [geoBusy, setGeoBusy] = useState(false);
  const [geoHint, setGeoHint] = useState<string | null>(null);

  const fillAddressFromCoords = async (lat: number, lng: number) => {
    setGeoBusy(true);
    setGeoHint(null);
    try {
      const place = await reverseGeocode(lat, lng);
      setFormAddress(place.displayName);
      setGeoHint(
        [place.city, place.state].filter(Boolean).join(', ') || place.displayName.slice(0, 80),
      );
    } catch (err: any) {
      setGeoHint(err?.message || 'Address lookup failed');
    } finally {
      setGeoBusy(false);
    }
  };

  const openAddModal = () => {
    setEditingLocId(null);
    setFormName('');
    setFormCategory('Office');
    setFormAddress('');
    if (userCoords) {
      setFormLat(Number(userCoords.latitude.toFixed(6)));
      setFormLng(Number(userCoords.longitude.toFixed(6)));
    } else {
      setFormLat(28.4986);
      setFormLng(77.0894);
    }
    setFormRadius(75);
    setFormAutoRecord(true);
    setFormAutoMoM(true);
    setFormDefaultTitle('');
    setFormDefaultDept('General');
    setIsModalOpen(true);
  };

  const openEditModal = (loc: GeofenceLocationEntity) => {
    setEditingLocId(loc.id);
    setFormName(loc.name);
    setFormCategory(loc.category);
    setFormAddress(loc.address || '');
    setFormLat(loc.latitude);
    setFormLng(loc.longitude);
    setFormRadius(loc.radiusMeters);
    setFormAutoRecord(loc.autoRecordOnArrival);
    setFormAutoMoM(loc.autoGenerateMoMOnCompletion);
    setFormDefaultTitle(loc.defaultMeetingTitle || '');
    setFormDefaultDept(loc.defaultDepartment || 'General');
    setIsModalOpen(true);
  };

  const handleUseCurrentGps = async () => {
    const granted = await requestGpsPermission();
    if (granted && userCoords) {
      const lat = Number(userCoords.latitude.toFixed(6));
      const lng = Number(userCoords.longitude.toFixed(6));
      setFormLat(lat);
      setFormLng(lng);
      await fillAddressFromCoords(lat, lng);
    }
  };

  const handleFillAddressFromFormCoords = async () => {
    await fillAddressFromCoords(Number(formLat), Number(formLng));
  };

  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingLocId) {
      updateLocation(editingLocId, {
        name: formName.trim(),
        category: formCategory,
        address: formAddress.trim() || undefined,
        latitude: Number(formLat),
        longitude: Number(formLng),
        radiusMeters: Number(formRadius),
        autoRecordOnArrival: formAutoRecord,
        autoGenerateMoMOnCompletion: formAutoMoM,
        defaultMeetingTitle: formDefaultTitle.trim() || undefined,
        defaultDepartment: formDefaultDept,
      });
    } else {
      addLocation({
        name: formName.trim(),
        category: formCategory,
        address: formAddress.trim() || undefined,
        latitude: Number(formLat),
        longitude: Number(formLng),
        radiusMeters: Number(formRadius),
        enabled: true,
        autoRecordOnArrival: formAutoRecord,
        autoGenerateMoMOnCompletion: formAutoMoM,
        defaultMeetingTitle: formDefaultTitle.trim() || undefined,
        defaultDepartment: formDefaultDept,
        color:
          formCategory === 'Conference Room'
            ? '#6366f1'
            : formCategory === 'Office'
            ? '#0ea5e9'
            : formCategory === 'Client Site'
            ? '#10b981'
            : '#8b5cf6',
      });
    }
    setIsModalOpen(false);
  };

  const getCategoryIcon = (cat: GeofenceLocationEntity['category']) => {
    switch (cat) {
      case 'Office':
        return <Building className="w-4 h-4 text-sky-500" />;
      case 'Conference Room':
        return <Layers className="w-4 h-4 text-indigo-500" />;
      case 'Client Site':
        return <Briefcase className="w-4 h-4 text-emerald-500" />;
      case 'Home':
        return <Home className="w-4 h-4 text-violet-500" />;
      case 'Cafe':
        return <Coffee className="w-4 h-4 text-amber-500" />;
      default:
        return <MapPin className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <button
            onClick={() => onNavigate('/meetings')}
            className="text-xs font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 mb-2 cursor-pointer transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Meetings</span>
          </button>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <Compass className="w-3.5 h-3.5" />
            Location Geofencing & Smart Automation
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Auto Mode (Location Auto-Recording & MoM)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            When you arrive at a designated meeting location, auto-recording starts and Minutes of Meeting (MoM) are automatically generated.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Meeting Location</span>
        </button>
      </div>

      {/* 1. MASTER AUTO MODE SWITCH CARD */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-6 transition">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Location Auto Mode Master Switch
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isAutoModeEnabled
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {isAutoModeEnabled ? 'ACTIVE (ON)' : 'DISABLED (OFF)'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Automatically trigger recording and Minutes of Meeting (MoM) generation as soon as your device enters a conference room or office geofence.
            </p>
          </div>

          <button
            onClick={() => toggleAutoMode()}
            className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2.5 shadow-sm cursor-pointer ${
              isAutoModeEnabled
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isAutoModeEnabled ? 'Auto Mode is ON' : 'Turn Auto Mode ON'}</span>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <FieldSessionControls
          siteName={evaluation?.matchedLocation?.name || evaluation?.nearestLocation?.name}
          latitude={userCoords?.latitude}
          longitude={userCoords?.longitude}
        />
      </div>

      {/* 2. LIVE GPS RADAR & STATUS HUD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* GPS Live Coordinates */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-indigo-500">
              <LocateFixed className="w-3.5 h-3.5" />
              Live Device GPS
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] ${
                permissionStatus === 'granted'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
              }`}
            >
              {permissionStatus === 'granted' ? 'GPS LOCKED' : 'GPS STANDBY'}
            </span>
          </div>

          {userCoords ? (
            <div className="space-y-1 font-mono text-xs text-slate-700 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Latitude:</span>
                <span className="font-bold">{userCoords.latitude.toFixed(5)}°</span>
              </div>
              <div className="flex justify-between">
                <span>Longitude:</span>
                <span className="font-bold">{userCoords.longitude.toFixed(5)}°</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Accuracy:</span>
                <span>±{Math.round(userCoords.accuracyMeters || 10)} meters</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 space-y-2 py-1">
              <p>GPS coordinates not yet acquired.</p>
              <button
                onClick={requestGpsPermission}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-bold text-xs hover:bg-indigo-100 transition cursor-pointer"
              >
                Acquire GPS Lock
              </button>
            </div>
          )}
        </div>

        {/* Current Geofence Status */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-emerald-500">
              <Activity className="w-3.5 h-3.5" />
              Active Geofence
            </span>
            {isSimulating && (
              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
                SIMULATION
              </span>
            )}
          </div>

          {evaluation.matchedLocation ? (
            <div className="space-y-1">
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Inside {evaluation.matchedLocation.name}</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Distance to center: {evaluation.distanceToMatchedMeters}m (Radius: {evaluation.matchedLocation.radiusMeters}m)
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-3 h-3" />
                <span>Auto-Record & MoM Armed</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 space-y-1 py-1">
              <p>Outside all saved geofences.</p>
              {evaluation.nearestLocation && (
                <p className="text-[11px] text-slate-400">
                  Nearest: <strong>{evaluation.nearestLocation.name}</strong> ({formatDistance(evaluation.distanceToNearestMeters)} away)
                </p>
              )}
            </div>
          )}
        </div>

        {/* Quick Simulation Controller (Test Without Walking) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-amber-500">
              <Zap className="w-3.5 h-3.5" />
              Test & Simulation Mode
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Test arrival without physically walking to the location.
          </p>

          {isSimulating ? (
            <button
              onClick={resetSimulation}
              className="w-full py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              Exit GPS Simulation
            </button>
          ) : (
            locations.length > 0 && (
              <button
                onClick={() => simulateArrival(locations[0].id)}
                className="w-full py-1.5 px-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-500/20 transition cursor-pointer"
              >
                Simulate Arrival ({locations[0].name.split('-')[0].trim()})
              </button>
            )
          )}
        </div>
      </div>

      {/* 3. SAVED LOCATIONS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-500" />
            <span>Configured Meeting Geofences ({locations.length})</span>
          </h2>
          <span className="text-xs text-slate-500">
            Click "Simulate Arrival" on any location to test auto-recording immediately
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locations.map((loc) => {
            const isInsideThis = evaluation.matchedLocation?.id === loc.id;

            return (
              <div
                key={loc.id}
                className={`p-5 rounded-3xl border transition shadow-xs relative overflow-hidden ${
                  isInsideThis
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500 dark:border-emerald-600 ring-2 ring-emerald-500/30'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                      {getCategoryIcon(loc.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                          {loc.name}
                        </h3>
                        {isInsideThis && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white animate-pulse">
                            ACTIVE INSIDE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {loc.address || `${loc.latitude.toFixed(4)}°, ${loc.longitude.toFixed(4)}°`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(loc)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Edit location"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete geofence for ${loc.name}?`)) {
                          deleteLocation(loc.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Delete location"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Badges & Automation Flags */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                      {loc.radiusMeters}m Radius
                    </span>

                    {loc.autoRecordOnArrival && (
                      <span className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold text-[11px] flex items-center gap-1">
                        <Zap className="w-3 h-3 text-indigo-500" />
                        Auto-Record
                      </span>
                    )}

                    {loc.autoGenerateMoMOnCompletion && (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-500" />
                        Auto-MoM
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => simulateArrival(loc.id)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                    title="Simulate entering this location right now"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Simulate Arrival</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. ADVANCED AUTOMATION PREFERENCES */}
      <div className="mt-8 p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-500" />
          <span>Automation Behavior & Preferences</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Audio Chime */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                Arrival Audio Chime
              </span>
              <p className="text-slate-500 text-[11px]">
                Plays a gentle chime when you enter the meeting perimeter.
              </p>
            </div>
            <input
              type="checkbox"
              checked={config.audioChimeEnabled}
              onChange={(e) => updateConfig({ audioChimeEnabled: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
            />
          </div>

          {/* Auto Trigger MoM on Complete */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                Auto-Generate Minutes (MoM)
              </span>
              <p className="text-slate-500 text-[11px]">
                Immediately runs Gemini AI Minutes generation when recording stops.
              </p>
            </div>
            <input
              type="checkbox"
              checked={config.autoTriggerMoM}
              onChange={(e) => updateConfig({ autoTriggerMoM: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
            />
          </div>

          {/* Countdown Delay */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Launch Countdown Delay
              </span>
              <p className="text-slate-500 text-[11px]">
                Grace period before auto-recording starts ({config.autoStartDelaySeconds} seconds).
              </p>
            </div>
            <select
              value={config.autoStartDelaySeconds}
              onChange={(e) => updateConfig({ autoStartDelaySeconds: Number(e.target.value) })}
              className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold cursor-pointer"
            >
              <option value={2}>2 Seconds</option>
              <option value={4}>4 Seconds</option>
              <option value={6}>6 Seconds</option>
              <option value={10}>10 Seconds</option>
            </select>
          </div>

          {/* High Accuracy GPS */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-500" />
                High Accuracy GPS Engine
              </span>
              <p className="text-slate-500 text-[11px]">
                Uses precision hardware GPS for pinpoint room-level accuracy.
              </p>
            </div>
            <input
              type="checkbox"
              checked={config.highAccuracyGps}
              onChange={(e) => updateConfig({ highAccuracyGps: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 5. ADD / EDIT LOCATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>{editingLocId ? 'Edit Geofence Location' : 'Add New Meeting Location'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLocation} className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Location / Room Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Executive Boardroom 4A"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium cursor-pointer"
                >
                  <option value="Conference Room">Conference Room</option>
                  <option value="Office">Office</option>
                  <option value="Client Site">Client Site</option>
                  <option value="Home">Home Studio</option>
                  <option value="Cafe">Cafe / Coworking</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Address / Landmark */}
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Address / Building Landmark (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={() => void handleFillAddressFromFormCoords()}
                    disabled={geoBusy}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{geoBusy ? 'Looking up…' : 'Fill from lat/lon'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. DLF Cyber City, Tower B, Level 8"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                />
                {geoHint && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{geoHint}</p>
                )}
              </div>

              {/* GPS Coordinates */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    GPS Coordinates (Latitude, Longitude)
                  </label>
                  <button
                    type="button"
                    onClick={handleUseCurrentGps}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <LocateFixed className="w-3.5 h-3.5" />
                    <span>Get Current GPS</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    step="0.000001"
                    required
                    placeholder="Latitude"
                    value={formLat}
                    onChange={(e) => setFormLat(Number(e.target.value))}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                  <input
                    type="number"
                    step="0.000001"
                    required
                    placeholder="Longitude"
                    value={formLng}
                    onChange={(e) => setFormLng(Number(e.target.value))}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Radius */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Geofence Radius: {formRadius} meters
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {formRadius <= 50 ? 'Single Room' : formRadius <= 150 ? 'Entire Floor' : 'Full Building'}
                  </span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={500}
                  step={10}
                  value={formRadius}
                  onChange={(e) => setFormRadius(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Automation Toggles */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 space-y-2">
                <label className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  <span>Auto-Record on Arrival</span>
                  <input
                    type="checkbox"
                    checked={formAutoRecord}
                    onChange={(e) => setFormAutoRecord(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  <span>Auto-Generate Minutes of Meeting (MoM)</span>
                  <input
                    type="checkbox"
                    checked={formAutoMoM}
                    onChange={(e) => setFormAutoMoM(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingLocId ? 'Update Location' : 'Save Location'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
