import React, { useState, useEffect, useRef } from 'react';
import {
  Ruler,
  Crosshair,
  Compass,
  Maximize2,
  Eye,
  Sparkles,
  Camera,
  Trash2,
  Plus,
  RotateCcw,
  Zap,
  CheckCircle2,
  AlertCircle,
  Video,
  Download,
  Share2,
  Layers,
  Box,
  X,
  Sliders,
  Activity
} from 'lucide-react';
import { logAnalyticsEvent } from '../lib/firebase';

export interface ArPin {
  id: string;
  x: number; // percentage on canvas (0-100) or 3D coordinate
  y: number; // percentage on canvas (0-100)
  spatialZ: number; // depth in meters (e.g., 1.2m to 5.8m)
  label: string;
}

export interface SavedArMeasurement {
  id: string;
  title: string;
  distanceMeters: number;
  elevationDeltaMeters: number;
  slopeDegrees: number;
  pinCount: number;
  timestamp: string;
}

interface ArMeasurementOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  surveyTitle?: string;
}

export const ArMeasurementOverlay: React.FC<ArMeasurementOverlayProps> = ({
  isOpen,
  onClose,
  surveyTitle = '3D LiDAR Survey Site'
}) => {
  // WebXR support state
  const [isWebXRSupported, setIsWebXRSupported] = useState<boolean | null>(null);
  const [isWebXRSessionActive, setIsWebXRSessionActive] = useState<boolean>(false);
  const [webxrStatusMsg, setWebxrStatusMsg] = useState<string>('Checking WebXR capabilities...');

  // Camera video stream feed
  const [useCameraFeed, setUseCameraFeed] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Measurement State
  const [pins, setPins] = useState<ArPin[]>([]);
  const [unit, setUnit] = useState<'m' | 'ft' | 'in' | 'cm'>('m');
  const [reticlePos, setReticlePos] = useState<{ x: number; y: number; spatialZ: number }>({ x: 50, y: 50, spatialZ: 2.8 });
  const [isTargetLocked, setIsTargetLocked] = useState<boolean>(true);
  const [savedMeasurements, setSavedMeasurements] = useState<SavedArMeasurement[]>([]);

  // Check WebXR Device API support on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'xr' in navigator && (navigator as any).xr) {
      const xr = (navigator as any).xr;
      if (xr.isSessionSupported) {
        xr.isSessionSupported('immersive-ar')
          .then((supported: boolean) => {
            setIsWebXRSupported(supported);
            if (supported) {
              setWebxrStatusMsg('WebXR Immersive-AR Hardware Detected');
            } else {
              setWebxrStatusMsg('WebXR hardware not detected — using Interactive WebXR Spatial AR Overlay Simulator');
            }
          })
          .catch(() => {
            setIsWebXRSupported(false);
            setWebxrStatusMsg('WebXR API restricted or simulated');
          });
      } else {
        setIsWebXRSupported(false);
        setWebxrStatusMsg('WebXR API not available in browser — using Spatial Canvas AR Overlay');
      }
    } else {
      setIsWebXRSupported(false);
      setWebxrStatusMsg('WebXR API not supported in iframe/browser context — using Interactive Spatial Canvas');
    }
  }, []);

  // Handle Camera Video Feed start/stop
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isOpen && useCameraFeed) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: { facingMode: 'environment' } })
          .then((s) => {
            stream = s;
            if (videoRef.current) {
              videoRef.current.srcObject = s;
            }
          })
          .catch(() => {
            setUseCameraFeed(false);
          });
      }
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, useCameraFeed]);

  // Track event on open
  useEffect(() => {
    if (isOpen) {
      logAnalyticsEvent('ar_measurement_mode_opened', {
        survey_title: surveyTitle,
        webxr_supported: isWebXRSupported
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Request actual WebXR session if available
  const handleLaunchWebXRSession = async () => {
    if (!('xr' in navigator)) return;
    try {
      const xr = (navigator as any).xr;
      const session = await xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test', 'local']
      });
      setIsWebXRSessionActive(true);
      logAnalyticsEvent('webxr_ar_session_started', {
        survey_title: surveyTitle
      });

      session.addEventListener('end', () => {
        setIsWebXRSessionActive(false);
      });
    } catch (err: any) {
      alert(`WebXR AR Session Request: ${err.message || 'Device spatial sensor not available or permission denied'}. Falling back to Interactive Spatial AR Overlay.`);
      setIsWebXRSessionActive(false);
    }
  };

  // Convert distance in meters to active unit
  const formatDistance = (distMeters: number): string => {
    switch (unit) {
      case 'ft':
        return `${(distMeters * 3.28084).toFixed(2)} ft`;
      case 'in':
        return `${(distMeters * 39.3701).toFixed(1)} in`;
      case 'cm':
        return `${(distMeters * 100).toFixed(0)} cm`;
      case 'm':
      default:
        return `${distMeters.toFixed(2)} m`;
    }
  };

  // Calculate Euclidean Distance between two 2D/3D pins
  const calculateDistanceMeters = (pinA: ArPin, pinB: ArPin): number => {
    // Map canvas % coords (0-100) to nominal meters scale (1% = 0.08m)
    const dx = (pinB.x - pinA.x) * 0.08;
    const dy = (pinB.y - pinA.y) * 0.08;
    const dz = pinB.spatialZ - pinA.spatialZ;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  };

  // Calculate Total Chain Distance
  let totalDistanceMeters = 0;
  for (let i = 0; i < pins.length - 1; i++) {
    totalDistanceMeters += calculateDistanceMeters(pins[i], pins[i + 1]);
  }

  // Calculate elevation delta between first and last pin
  const elevationDelta = pins.length >= 2 ? Math.abs(pins[pins.length - 1].spatialZ - pins[0].spatialZ) : 0;

  // Calculate slope angle
  const horizontalDist = pins.length >= 2 ? calculateDistanceMeters(pins[0], pins[pins.length - 1]) : 0;
  const slopeDegrees = horizontalDist > 0 ? (Math.atan(elevationDelta / horizontalDist) * 180) / Math.PI : 0;

  // Handle click on canvas to drop AR Pin
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Simulated depth calculation based on y-position and jitter
    const simulatedDepth = Number((1.5 + (clickY / 100) * 4.5 + Math.random() * 0.2).toFixed(2));

    const newPin: ArPin = {
      id: `pin_${Date.now()}`,
      x: clickX,
      y: clickY,
      spatialZ: simulatedDepth,
      label: `Point ${String.fromCharCode(65 + pins.length)}`
    };

    const updatedPins = [...pins, newPin];
    setPins(updatedPins);
    setReticlePos({ x: clickX, y: clickY, spatialZ: simulatedDepth });

    logAnalyticsEvent('ar_pin_placed', {
      pin_index: updatedPins.length,
      label: newPin.label,
      depth_meters: simulatedDepth
    });
  };

  // Handle Reticle hover / motion simulation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const moveX = ((e.clientX - rect.left) / rect.width) * 100;
    const moveY = ((e.clientY - rect.top) / rect.height) * 100;
    const currentZ = Number((1.5 + (moveY / 100) * 4.5).toFixed(2));
    setReticlePos({ x: moveX, y: moveY, spatialZ: currentZ });
  };

  const handleClearPins = () => {
    setPins([]);
    logAnalyticsEvent('ar_pins_cleared', {});
  };

  const handleSaveMeasurement = () => {
    if (pins.length < 2) {
      alert('Please place at least 2 AR pins to measure distance before saving!');
      return;
    }

    const saved: SavedArMeasurement = {
      id: `meas_${Date.now()}`,
      title: `${pins[0].label} to ${pins[pins.length - 1].label} Line`,
      distanceMeters: totalDistanceMeters,
      elevationDeltaMeters: elevationDelta,
      slopeDegrees: Number(slopeDegrees.toFixed(1)),
      pinCount: pins.length,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setSavedMeasurements([saved, ...savedMeasurements]);
    logAnalyticsEvent('ar_measurement_saved', {
      distance_meters: totalDistanceMeters,
      pin_count: pins.length,
      unit
    });

    alert(`Saved AR Measurement: ${formatDistance(totalDistanceMeters)} (${pins.length} Pins)`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between overflow-hidden text-white animate-fade-in">
      
      {/* TOP HUD NAV BAR */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Ruler className="w-5 h-5 animate-pulse" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white">WebXR AR Real-Time Measurement Overlay</h2>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-mono font-bold uppercase">
                {isWebXRSessionActive ? 'WebXR Active' : 'Spatial AR Simulated'}
              </span>
            </div>
            <p className="text-xs text-slate-400">{surveyTitle} · Surface Spatial Hit-Testing</p>
          </div>
        </div>

        {/* STATUS & UNITS & ACTION CONTROLS */}
        <div className="flex items-center gap-2">
          
          {/* Unit Toggle Buttons */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-bold">
            {(['m', 'ft', 'in', 'cm'] as const).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`px-2.5 py-1 rounded-lg uppercase transition ${
                  unit === u ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                {u}
              </button>
            ))}
          </div>

          {/* WebCam Toggle */}
          <button
            onClick={() => setUseCameraFeed(!useCameraFeed)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
              useCameraFeed
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            {useCameraFeed ? 'Camera ON' : 'Synthetic Point Cloud'}
          </button>

          {/* WebXR Session Button */}
          {isWebXRSupported && (
            <button
              onClick={handleLaunchWebXRSession}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs rounded-xl border border-purple-400/30 shadow-lg hover:scale-102 transition flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              Launch WebXR AR
            </button>
          )}

          {/* Close HUD */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* MAIN AR CANVAS & CAMERA FEED */}
      <div
        className="relative flex-1 w-full h-full cursor-crosshair overflow-hidden select-none"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
      >
        {/* WEBCAM FEED OR LIDAR SPATIAL CANVAS BACKDROP */}
        {useCameraFeed ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 z-0">
            
            {/* Animated 3D Depth Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c715_1px,transparent_1px),linear-gradient(to_bottom,#0284c715_1px,transparent_1px)] bg-[size:32px_32px]" />
            
            {/* Simulated Point Cloud Dots */}
            <div className="absolute inset-0 opacity-40 flex flex-wrap justify-around items-center p-12 pointer-events-none">
              {Array.from({ length: 36 }).map((_, idx) => (
                <div
                  key={idx}
                  className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"
                  style={{
                    animationDuration: `${2 + (idx % 3)}s`,
                    animationDelay: `${(idx % 5) * 0.4}s`
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* CONNECTING 3D LASER MEASUREMENT LINES BETWEEN PINS */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <linearGradient id="laserGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {pins.map((pin, index) => {
            if (index === 0) return null;
            const prevPin = pins[index - 1];
            const segmentMeters = calculateDistanceMeters(prevPin, pin);
            const midX = (prevPin.x + pin.x) / 2;
            const midY = (prevPin.y + pin.y) / 2;

            return (
              <g key={`line_${prevPin.id}_${pin.id}`}>
                {/* Glow Line */}
                <line
                  x1={`${prevPin.x}%`}
                  y1={`${prevPin.y}%`}
                  x2={`${pin.x}%`}
                  y2={`${pin.y}%`}
                  stroke="url(#laserGradient)"
                  strokeWidth="3"
                  strokeDasharray="6 3"
                  filter="url(#glow)"
                />

                {/* Midpoint Distance Badge */}
                <foreignObject
                  x={`${midX - 8}%`}
                  y={`${midY - 3}%`}
                  width="16%"
                  height="40"
                  className="overflow-visible"
                >
                  <div className="flex justify-center">
                    <span className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-teal-400 text-emerald-300 font-mono font-black text-[11px] shadow-2xl backdrop-blur-md flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" />
                      {formatDistance(segmentMeters)}
                    </span>
                  </div>
                </foreignObject>
              </g>
            );
          })}

          {/* Line from last pin to reticle (live measurement) */}
          {pins.length > 0 && (
            <line
              x1={`${pins[pins.length - 1].x}%`}
              y1={`${pins[pins.length - 1].y}%`}
              x2={`${reticlePos.x}%`}
              y2={`${reticlePos.y}%`}
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          )}
        </svg>

        {/* PLACED AR PINS ON CANVAS */}
        {pins.map((pin, index) => (
          <div
            key={pin.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none group"
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          >
            {/* Pulse Ring */}
            <span className="absolute w-8 h-8 rounded-full bg-cyan-500/30 animate-ping pointer-events-none" />

            {/* Pin Head */}
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-emerald-400 border-2 border-white shadow-2xl flex items-center justify-center font-black text-xs text-slate-950 font-mono">
              {String.fromCharCode(65 + index)}
            </div>

            {/* Pin Badge */}
            <div className="mt-1 px-2 py-0.5 rounded-lg bg-slate-900/90 border border-slate-700 text-[10px] font-mono text-cyan-300 shadow-lg">
              Depth: {pin.spatialZ}m
            </div>
          </div>
        ))}

        {/* DYNAMIC AR RETICLE & SPATIAL RAYCAST target */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none transition-all duration-75"
          style={{ left: `${reticlePos.x}%`, top: `${reticlePos.y}%` }}
        >
          <div className="relative flex items-center justify-center">
            {/* Outer Target Ring */}
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
            
            {/* Center Crosshair */}
            <Crosshair className="absolute w-6 h-6 text-amber-300 animate-pulse" />

            {/* Live Depth Radar Tooltip */}
            <div className="absolute top-14 bg-slate-900/90 border border-amber-400/50 rounded-xl px-3 py-1.5 text-center shadow-2xl backdrop-blur-md">
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                Spatial Hit-Test Locked
              </span>
              <span className="font-mono text-xs font-black text-white">
                Ray Depth: {reticlePos.spatialZ}m
              </span>
            </div>
          </div>
        </div>

        {/* BOTTOM HUD MEASUREMENT STATS & CONTROLS */}
        <div className="absolute bottom-6 left-6 right-6 z-30 flex flex-col md:flex-row items-center justify-between gap-4 pointer-events-auto">
          
          {/* Real-time Measurement Summary Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-2xl backdrop-blur-lg flex flex-wrap items-center gap-6 text-xs w-full md:w-auto">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Distance</span>
              <span className="text-xl font-black font-mono text-emerald-400">
                {formatDistance(totalDistanceMeters)}
              </span>
            </div>

            <div className="h-8 w-px bg-slate-800 hidden sm:block" />

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Elevation Delta ($\Delta Z$)</span>
              <span className="text-sm font-bold font-mono text-cyan-300">
                {formatDistance(elevationDelta)}
              </span>
            </div>

            <div className="h-8 w-px bg-slate-800 hidden sm:block" />

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Slope Angle ($\theta$)</span>
              <span className="text-sm font-bold font-mono text-amber-400">
                {slopeDegrees.toFixed(1)}°
              </span>
            </div>

            <div className="h-8 w-px bg-slate-800 hidden sm:block" />

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Active Pins</span>
              <span className="text-sm font-bold font-mono text-white">
                {pins.length} Points
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={handleClearPins}
              disabled={pins.length === 0}
              className="px-4 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs transition flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4 text-rose-400" />
              Reset Pins
            </button>

            <button
              onClick={handleSaveMeasurement}
              disabled={pins.length < 2}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition shadow-xl flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save Measurement
            </button>
          </div>

        </div>

      </div>

      {/* SAVED MEASUREMENT DRAWER / LIST AT FOOTER */}
      {savedMeasurements.length > 0 && (
        <div className="p-4 bg-slate-900 border-t border-slate-800 max-h-36 overflow-y-auto z-20">
          <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400" /> Saved AR Measurements Log
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {savedMeasurements.map((m) => (
              <div
                key={m.id}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs"
              >
                <div>
                  <div className="font-bold text-white">{m.title}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    $\Delta Z$: {m.elevationDeltaMeters.toFixed(2)}m · Slope: {m.slopeDegrees}°
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-black text-emerald-400">{formatDistance(m.distanceMeters)}</div>
                  <div className="text-[9px] text-slate-500">{m.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
