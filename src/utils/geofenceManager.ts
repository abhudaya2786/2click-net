import {
  GeofenceAutoModeConfig,
  GeofenceEvaluationResult,
  GeofenceLocationEntity,
  UserCoordinates,
} from '../types';

export const GEOFENCE_LOCATIONS_STORAGE_KEY = 'voice_mom_geofence_locations_v1';
export const GEOFENCE_CONFIG_STORAGE_KEY = 'voice_mom_geofence_config_v1';

export const DEFAULT_GEOFENCE_CONFIG: GeofenceAutoModeConfig = {
  isAutoModeEnabled: true, // Default ON for seamless location-triggered recording & MoM
  autoStartDelaySeconds: 4,
  autoStopOnExit: false,
  autoTriggerMoM: true, // Automatically start Minutes of Meeting generation
  audioChimeEnabled: true,
  vibrationAlerts: true,
  minAccuracyMeters: 150,
  highAccuracyGps: true,
  notifyOnArrival: true,
  simulationActive: false,
};

export const SEED_GEOFENCE_LOCATIONS: GeofenceLocationEntity[] = [
  {
    id: 'geo-headquarters-boardroom',
    name: 'Corporate HQ - Executive Boardroom',
    category: 'Conference Room',
    address: 'DLF Cyber City, Tower B, Level 8, Gurugram',
    latitude: 28.4986,
    longitude: 77.0894,
    radiusMeters: 75,
    enabled: true,
    autoRecordOnArrival: true,
    autoGenerateMoMOnCompletion: true,
    defaultMeetingTitle: 'HQ Strategy & Executive Briefing',
    defaultDepartment: 'Leadership',
    color: '#6366f1', // Indigo
    arrivalCount: 14,
    lastArrivedAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'geo-tech-park-engineering',
    name: 'Innovation Tech Park - Sprint Room 4B',
    category: 'Office',
    address: 'Electronics City Phase 1, Bengaluru',
    latitude: 12.8452,
    longitude: 77.6602,
    radiusMeters: 100,
    enabled: true,
    autoRecordOnArrival: true,
    autoGenerateMoMOnCompletion: true,
    defaultMeetingTitle: 'Engineering Sprint & Architecture Sync',
    defaultDepartment: 'Engineering',
    color: '#0ea5e9', // Sky
    arrivalCount: 8,
    lastArrivedAt: new Date(Date.now() - 172800000).toISOString(),
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'geo-client-headquarters',
    name: 'Client Office - FinTech Partner Suite',
    category: 'Client Site',
    address: 'Bandra Kurla Complex (BKC), Mumbai',
    latitude: 19.0688,
    longitude: 72.8697,
    radiusMeters: 120,
    enabled: true,
    autoRecordOnArrival: true,
    autoGenerateMoMOnCompletion: true,
    defaultMeetingTitle: 'Client Review & Deliverables Sign-off',
    defaultDepartment: 'Product',
    color: '#10b981', // Emerald
    arrivalCount: 5,
    lastArrivedAt: new Date(Date.now() - 345600000).toISOString(),
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'geo-home-studio',
    name: 'Home Office & Soundproof Studio',
    category: 'Home',
    address: 'Personal Workspace',
    latitude: 28.5355,
    longitude: 77.3910,
    radiusMeters: 50,
    enabled: true,
    autoRecordOnArrival: true,
    autoGenerateMoMOnCompletion: true,
    defaultMeetingTitle: 'Deep Work & Daily Standup',
    defaultDepartment: 'Engineering',
    color: '#8b5cf6', // Violet
    arrivalCount: 22,
    lastArrivedAt: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Computes exact geodesic distance in meters using Haversine formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's mean radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Format meter distance into friendly text (e.g. "24 m", "450 m", "1.8 km")
 */
export function formatDistance(meters: number | null): string {
  if (meters === null || meters === undefined || isNaN(meters)) return 'Unknown';
  if (meters < 1000) {
    return `${meters} meters`;
  }
  const km = (meters / 1000).toFixed(1);
  return `${km} km`;
}

/**
 * Plays a pleasant audio chime when arriving at a geofenced location or starting auto-recording
 */
export function playGeofenceArrivalChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Play 3-tone ascending pleasant chord (C5 - E5 - G5 - C6)
    const tones = [523.25, 659.25, 783.99, 1046.5];
    const now = ctx.currentTime;

    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0, now + idx * 0.09);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.4);
    });

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 1500);
  } catch (err) {
    console.debug('Geofence chime audio unavailable:', err);
  }
}

/**
 * Evaluates current GPS coordinates against all active Geofence locations
 */
export function evaluateGeofence(
  userCoords: UserCoordinates | null,
  locations: GeofenceLocationEntity[],
  config: GeofenceAutoModeConfig
): GeofenceEvaluationResult {
  if (!config.isAutoModeEnabled) {
    return {
      isInsideAnyGeofence: false,
      matchedLocation: null,
      nearestLocation: null,
      distanceToNearestMeters: null,
      distanceToMatchedMeters: null,
      trackingStatus: 'IDLE',
      currentCoords: userCoords,
      statusMessage: 'Location Auto Mode is currently turned OFF.',
    };
  }

  if (!userCoords) {
    return {
      isInsideAnyGeofence: false,
      matchedLocation: null,
      nearestLocation: null,
      distanceToNearestMeters: null,
      distanceToMatchedMeters: null,
      trackingStatus: 'MONITORING',
      currentCoords: null,
      statusMessage: 'Acquiring GPS location lock...',
    };
  }

  const enabledLocations = locations.filter((loc) => loc.enabled);
  if (enabledLocations.length === 0) {
    return {
      isInsideAnyGeofence: false,
      matchedLocation: null,
      nearestLocation: null,
      distanceToNearestMeters: null,
      distanceToMatchedMeters: null,
      trackingStatus: 'MONITORING',
      currentCoords: userCoords,
      statusMessage: 'No active geofence locations configured.',
    };
  }

  let minDistance = Infinity;
  let nearest: GeofenceLocationEntity | null = null;
  let matched: GeofenceLocationEntity | null = null;
  let matchedDist: number | null = null;

  for (const loc of enabledLocations) {
    const dist = calculateHaversineDistance(
      userCoords.latitude,
      userCoords.longitude,
      loc.latitude,
      loc.longitude
    );

    if (dist < minDistance) {
      minDistance = dist;
      nearest = loc;
    }

    if (dist <= loc.radiusMeters) {
      matched = loc;
      matchedDist = dist;
      break; // Found the active geofence
    }
  }

  if (matched) {
    return {
      isInsideAnyGeofence: true,
      matchedLocation: matched,
      nearestLocation: matched,
      distanceToNearestMeters: matchedDist,
      distanceToMatchedMeters: matchedDist,
      trackingStatus: 'INSIDE_GEOFENCE',
      currentCoords: userCoords,
      statusMessage: `Arrived at ${matched.name} (${matchedDist}m inside geofence perimeter). Auto-Recording & MoM armed!`,
    };
  }

  return {
    isInsideAnyGeofence: false,
    matchedLocation: null,
    nearestLocation: nearest,
    distanceToNearestMeters: minDistance !== Infinity ? minDistance : null,
    distanceToMatchedMeters: null,
    trackingStatus: 'MONITORING',
    currentCoords: userCoords,
    statusMessage: nearest
      ? `Approaching ${nearest.name} (${formatDistance(minDistance)} away). Geofence radius: ${nearest.radiusMeters}m.`
      : 'Monitoring GPS perimeter...',
  };
}

/**
 * Storage helpers
 */
export const geofenceStorage = {
  loadLocations(): GeofenceLocationEntity[] {
    try {
      const raw = localStorage.getItem(GEOFENCE_LOCATIONS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load geofence locations:', e);
    }
    return SEED_GEOFENCE_LOCATIONS;
  },

  saveLocations(locations: GeofenceLocationEntity[]): void {
    try {
      localStorage.setItem(GEOFENCE_LOCATIONS_STORAGE_KEY, JSON.stringify(locations));
    } catch (e) {
      console.error('Failed to save geofence locations:', e);
    }
  },

  loadConfig(): GeofenceAutoModeConfig {
    try {
      const raw = localStorage.getItem(GEOFENCE_CONFIG_STORAGE_KEY);
      if (raw) {
        return { ...DEFAULT_GEOFENCE_CONFIG, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.error('Failed to load geofence config:', e);
    }
    return DEFAULT_GEOFENCE_CONFIG;
  },

  saveConfig(config: GeofenceAutoModeConfig): void {
    try {
      localStorage.setItem(GEOFENCE_CONFIG_STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save geofence config:', e);
    }
  },
};
