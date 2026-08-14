import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  GeofenceAutoModeConfig,
  GeofenceEvaluationResult,
  GeofenceLocationEntity,
  UserCoordinates,
} from '../types';
import {
  DEFAULT_GEOFENCE_CONFIG,
  evaluateGeofence,
  geofenceStorage,
  playGeofenceArrivalChime,
} from '../utils/geofenceManager';
import { meetingDb } from '../utils/meetingDatabase';

interface GeofenceContextType {
  isAutoModeEnabled: boolean;
  toggleAutoMode: (enabled?: boolean) => void;
  config: GeofenceAutoModeConfig;
  updateConfig: (updates: Partial<GeofenceAutoModeConfig>) => void;
  locations: GeofenceLocationEntity[];
  addLocation: (
    location: Omit<GeofenceLocationEntity, 'id' | 'createdAt' | 'updatedAt' | 'arrivalCount'>
  ) => GeofenceLocationEntity;
  updateLocation: (id: string, updates: Partial<GeofenceLocationEntity>) => void;
  deleteLocation: (id: string) => void;
  evaluation: GeofenceEvaluationResult;
  userCoords: UserCoordinates | null;
  permissionStatus: 'granted' | 'prompt' | 'denied' | 'unsupported';
  requestGpsPermission: () => Promise<boolean>;
  simulateArrival: (locationId: string) => void;
  resetSimulation: () => void;
  isSimulating: boolean;
  countdownSeconds: number | null;
  activeAutoRecordingMeetingId: string | null;
  cancelCountdown: () => void;
  manualTriggerAutoMeeting: (location: GeofenceLocationEntity) => Promise<string>;
}

const GeofenceContext = createContext<GeofenceContextType | undefined>(undefined);

export const GeofenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<GeofenceAutoModeConfig>(() => geofenceStorage.loadConfig());
  const [locations, setLocations] = useState<GeofenceLocationEntity[]>(() =>
    geofenceStorage.loadLocations()
  );
  const [userCoords, setUserCoords] = useState<UserCoordinates | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulatedCoords, setSimulatedCoords] = useState<UserCoordinates | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<
    'granted' | 'prompt' | 'denied' | 'unsupported'
  >('prompt');

  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);
  const [activeAutoRecordingMeetingId, setActiveAutoRecordingMeetingId] = useState<string | null>(
    null
  );
  const [lastTriggeredLocationId, setLastTriggeredLocationId] = useState<string | null>(null);

  const countdownIntervalRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);

  // Save config changes
  const updateConfig = useCallback((updates: Partial<GeofenceAutoModeConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updates };
      geofenceStorage.saveConfig(next);
      return next;
    });
  }, []);

  const toggleAutoMode = useCallback(
    (enabled?: boolean) => {
      const nextVal = enabled !== undefined ? enabled : !config.isAutoModeEnabled;
      updateConfig({ isAutoModeEnabled: nextVal });
    },
    [config.isAutoModeEnabled, updateConfig]
  );

  // Save locations changes
  const saveLocationsState = useCallback((nextLocations: GeofenceLocationEntity[]) => {
    setLocations(nextLocations);
    geofenceStorage.saveLocations(nextLocations);
  }, []);

  const addLocation = useCallback(
    (
      data: Omit<GeofenceLocationEntity, 'id' | 'createdAt' | 'updatedAt' | 'arrivalCount'>
    ): GeofenceLocationEntity => {
      const newLoc: GeofenceLocationEntity = {
        ...data,
        id: `geo-loc-${Date.now()}`,
        arrivalCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [newLoc, ...locations];
      saveLocationsState(updated);
      return newLoc;
    },
    [locations, saveLocationsState]
  );

  const updateLocation = useCallback(
    (id: string, updates: Partial<GeofenceLocationEntity>) => {
      const updated = locations.map((loc) =>
        loc.id === id ? { ...loc, ...updates, updatedAt: new Date().toISOString() } : loc
      );
      saveLocationsState(updated);
    },
    [locations, saveLocationsState]
  );

  const deleteLocation = useCallback(
    (id: string) => {
      const updated = locations.filter((loc) => loc.id !== id);
      saveLocationsState(updated);
    },
    [locations, saveLocationsState]
  );

  // Request GPS Permission & Start Watcher
  const requestGpsPermission = useCallback(async (): Promise<boolean> => {
    if (!('geolocation' in navigator)) {
      setPermissionStatus('unsupported');
      return false;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPermissionStatus('granted');
          setUserCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracyMeters: pos.coords.accuracy,
            altitude: pos.coords.altitude,
            speed: pos.coords.speed,
            heading: pos.coords.heading,
            timestamp: pos.timestamp,
          });
          resolve(true);
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            setPermissionStatus('denied');
          }
          resolve(false);
        },
        {
          enableHighAccuracy: config.highAccuracyGps,
          timeout: 10000,
          maximumAge: 5000,
        }
      );
    });
  }, [config.highAccuracyGps]);

  // Setup Continuous Watch Position
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setPermissionStatus('unsupported');
      return;
    }

    if (!config.isAutoModeEnabled) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    const successHandler = (pos: GeolocationPosition) => {
      setPermissionStatus('granted');
      setUserCoords({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracyMeters: pos.coords.accuracy,
        altitude: pos.coords.altitude,
        speed: pos.coords.speed,
        heading: pos.coords.heading,
        timestamp: pos.timestamp,
      });
    };

    const errorHandler = (err: GeolocationPositionError) => {
      if (err.code === err.PERMISSION_DENIED) {
        setPermissionStatus('denied');
      }
    };

    const watchId = navigator.geolocation.watchPosition(successHandler, errorHandler, {
      enableHighAccuracy: config.highAccuracyGps,
      maximumAge: 3000,
      timeout: 15000,
    });

    watchIdRef.current = watchId;

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [config.isAutoModeEnabled, config.highAccuracyGps]);

  // Simulation controls
  const simulateArrival = useCallback(
    (locationId: string) => {
      const target = locations.find((l) => l.id === locationId);
      if (!target) return;
      setIsSimulating(true);
      setSimulatedCoords({
        latitude: target.latitude,
        longitude: target.longitude,
        accuracyMeters: 5,
        timestamp: Date.now(),
      });
    },
    [locations]
  );

  const resetSimulation = useCallback(() => {
    setIsSimulating(false);
    setSimulatedCoords(null);
  }, []);

  // Effective Active Coordinates
  const effectiveCoords = isSimulating ? simulatedCoords : userCoords;

  // Real-time Geofence Evaluation
  const evaluation = evaluateGeofence(effectiveCoords, locations, config);

  // Helper to create & launch an automatic meeting on location arrival
  const manualTriggerAutoMeeting = useCallback(
    async (location: GeofenceLocationEntity): Promise<string> => {
      const dateStr = new Date().toISOString().split('T')[0];
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      
      const newMtg = await meetingDb.createMeeting({
        title: location.defaultMeetingTitle || `${location.name} - Auto Session`,
        department: location.defaultDepartment || 'General',
        project: 'Location Auto-Record',
        organizer: 'Auto Mode Assistant',
        date: dateStr,
        startTime: nowTime,
        endTime: '',
        duration: 'Ongoing',
        location: location.name,
        agenda: `Auto-created via Geofence detection at ${location.name} (${location.category}).`,
        notes: `Arrived at coordinates (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}) with radius ${location.radiusMeters}m.`,
      });

      // Update arrival count
      updateLocation(location.id, {
        arrivalCount: (location.arrivalCount || 0) + 1,
        lastArrivedAt: new Date().toISOString(),
      });

      setActiveAutoRecordingMeetingId(newMtg.id);
      return newMtg.id;
    },
    [updateLocation]
  );

  // Auto Trigger Countdown & Launch Workflow
  useEffect(() => {
    if (!config.isAutoModeEnabled) {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setCountdownSeconds(null);
      return;
    }

    const matched = evaluation.matchedLocation;
    if (matched && matched.autoRecordOnArrival) {
      // If we haven't triggered for this arrival yet
      if (lastTriggeredLocationId !== matched.id && countdownSeconds === null && !activeAutoRecordingMeetingId) {
        // Play Audio Chime
        if (config.audioChimeEnabled) {
          playGeofenceArrivalChime();
        }

        // Start Countdown (e.g. 4 seconds)
        let remaining = config.autoStartDelaySeconds || 4;
        setCountdownSeconds(remaining);

        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

        countdownIntervalRef.current = setInterval(async () => {
          remaining -= 1;
          setCountdownSeconds(remaining);

          if (remaining <= 0) {
            clearInterval(countdownIntervalRef.current);
            setCountdownSeconds(null);
            setLastTriggeredLocationId(matched.id);

            // Create Auto Meeting and arm recording
            try {
              const mtgId = await manualTriggerAutoMeeting(matched);
              // Navigate or signal meeting launch
              window.history.pushState({}, '', `/meetings/${mtgId}`);
              window.dispatchEvent(new PopStateEvent('popstate'));
            } catch (err) {
              console.error('Failed to auto-launch meeting on geofence arrival:', err);
            }
          }
        }, 1000);
      }
    } else if (!matched) {
      // Stepped out of geofence
      if (lastTriggeredLocationId) {
        setLastTriggeredLocationId(null);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setCountdownSeconds(null);
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [
    evaluation.matchedLocation,
    config.isAutoModeEnabled,
    config.autoStartDelaySeconds,
    config.audioChimeEnabled,
    lastTriggeredLocationId,
    countdownSeconds,
    activeAutoRecordingMeetingId,
    manualTriggerAutoMeeting,
  ]);

  const cancelCountdown = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdownSeconds(null);
    if (evaluation.matchedLocation) {
      setLastTriggeredLocationId(evaluation.matchedLocation.id); // prevent immediate re-triggering
    }
  }, [evaluation.matchedLocation]);

  return (
    <GeofenceContext.Provider
      value={{
        isAutoModeEnabled: config.isAutoModeEnabled,
        toggleAutoMode,
        config,
        updateConfig,
        locations,
        addLocation,
        updateLocation,
        deleteLocation,
        evaluation,
        userCoords: effectiveCoords,
        permissionStatus,
        requestGpsPermission,
        simulateArrival,
        resetSimulation,
        isSimulating,
        countdownSeconds,
        activeAutoRecordingMeetingId,
        cancelCountdown,
        manualTriggerAutoMeeting,
      }}
    >
      {children}
    </GeofenceContext.Provider>
  );
};

export const useGeofence = (): GeofenceContextType => {
  const context = useContext(GeofenceContext);
  if (!context) {
    throw new Error('useGeofence must be used within a GeofenceProvider');
  }
  return context;
};
