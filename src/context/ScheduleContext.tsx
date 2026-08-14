import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { DayOfWeek, MeetingScheduleEntity, ScheduleStatusInfo } from '../types';
import { meetingDb } from '../utils/meetingDatabase';
import { evaluateSchedule, getDetectedTimezone } from '../utils/timezoneHelper';

interface ScheduleContextType {
  schedules: MeetingScheduleEntity[];
  loading: boolean;
  activeSchedule: MeetingScheduleEntity | null;
  scheduleStatus: ScheduleStatusInfo;
  isWithinSchedule: boolean;
  isReadyStateActive: boolean;
  isReadyBannerDismissed: boolean;
  dismissReadyBanner: () => void;
  resetDismissBanner: () => void;
  refreshSchedules: () => Promise<void>;
  createSchedule: (data: Omit<MeetingScheduleEntity, 'id' | 'createdAt' | 'updatedAt'>) => Promise<MeetingScheduleEntity>;
  updateSchedule: (id: string, updates: Partial<MeetingScheduleEntity>) => Promise<MeetingScheduleEntity | null>;
  deleteSchedule: (id: string) => Promise<boolean>;
  toggleSchedule: (id: string, enabled?: boolean) => Promise<void>;
}

const defaultStatus: ScheduleStatusInfo = {
  isWithinSchedule: false,
  activeSchedule: null,
  currentDayInTz: 'Monday',
  currentTimeInTz: '09:30 AM',
  currentTime24InTz: '09:30',
  currentDateInTz: new Date().toISOString().split('T')[0],
  timezone: getDetectedTimezone(),
  statusMessage: 'Checking schedule...',
  timeRemainingText: '',
};

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schedules, setSchedules] = useState<MeetingScheduleEntity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [scheduleStatus, setScheduleStatus] = useState<ScheduleStatusInfo>(defaultStatus);
  const [isReadyBannerDismissed, setIsReadyBannerDismissed] = useState<boolean>(false);

  const fetchSchedules = useCallback(async () => {
    try {
      const data = await meetingDb.getSchedules();
      setSchedules(data);
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // Primary active schedule (first enabled schedule, or first schedule)
  const activeSchedule = useMemo(() => {
    return schedules.find((s) => s.enabled) || schedules[0] || null;
  }, [schedules]);

  // Periodic Schedule Evaluator (runs every 3 seconds to ensure real-time responsiveness)
  useEffect(() => {
    const evaluate = () => {
      if (!activeSchedule) {
        setScheduleStatus({
          ...defaultStatus,
          statusMessage: 'No recording schedules configured.',
        });
        return;
      }

      const evalResult = evaluateSchedule(activeSchedule, new Date());
      setScheduleStatus(evalResult);
    };

    evaluate();
    const interval = setInterval(evaluate, 3000);
    return () => clearInterval(interval);
  }, [activeSchedule]);

  const isWithinSchedule = scheduleStatus.isWithinSchedule;
  const isReadyStateActive = isWithinSchedule && (activeSchedule?.autoReadyState ?? true);

  const dismissReadyBanner = () => {
    setIsReadyBannerDismissed(true);
  };

  const resetDismissBanner = () => {
    setIsReadyBannerDismissed(false);
  };

  const createSchedule = async (
    data: Omit<MeetingScheduleEntity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<MeetingScheduleEntity> => {
    const created = await meetingDb.createSchedule(data);
    await fetchSchedules();
    setIsReadyBannerDismissed(false);
    return created;
  };

  const updateSchedule = async (
    id: string,
    updates: Partial<MeetingScheduleEntity>
  ): Promise<MeetingScheduleEntity | null> => {
    const updated = await meetingDb.updateSchedule(id, updates);
    await fetchSchedules();
    return updated;
  };

  const deleteSchedule = async (id: string): Promise<boolean> => {
    const success = await meetingDb.deleteSchedule(id);
    await fetchSchedules();
    return success;
  };

  const toggleSchedule = async (id: string, enabled?: boolean) => {
    const target = schedules.find((s) => s.id === id);
    if (!target) return;
    const newEnabled = enabled !== undefined ? enabled : !target.enabled;
    await meetingDb.updateSchedule(id, { enabled: newEnabled });
    await fetchSchedules();
  };

  return (
    <ScheduleContext.Provider
      value={{
        schedules,
        loading,
        activeSchedule,
        scheduleStatus,
        isWithinSchedule,
        isReadyStateActive,
        isReadyBannerDismissed,
        dismissReadyBanner,
        resetDismissBanner,
        refreshSchedules: fetchSchedules,
        createSchedule,
        updateSchedule,
        deleteSchedule,
        toggleSchedule,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

export function useSchedule(): ScheduleContextType {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
}
