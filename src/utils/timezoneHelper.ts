import { DayOfWeek, MeetingScheduleEntity, ScheduleStatusInfo } from '../types';

export interface TimezoneOption {
  value: string; // e.g. "Asia/Kolkata"
  label: string; // e.g. "India Standard Time (IST, UTC+05:30) - Asia/Kolkata"
  offset: string; // e.g. "UTC+05:30"
  region: string; // e.g. "Asia"
}

export const COMMON_TIMEZONES: TimezoneOption[] = [
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST, UTC+05:30)', offset: '+05:30', region: 'Asia & South Asia' },
  { value: 'America/New_York', label: 'Eastern Time - US & Canada (EDT/EST, UTC-05:00)', offset: '-05:00', region: 'Americas' },
  { value: 'America/Chicago', label: 'Central Time - US & Canada (CDT/CST, UTC-06:00)', offset: '-06:00', region: 'Americas' },
  { value: 'America/Denver', label: 'Mountain Time - US & Canada (MDT/MST, UTC-07:00)', offset: '-07:00', region: 'Americas' },
  { value: 'America/Los_Angeles', label: 'Pacific Time - US & Canada (PDT/PST, UTC-08:00)', offset: '-08:00', region: 'Americas' },
  { value: 'Europe/London', label: 'London / GMT / BST (UTC+00:00 / +01:00)', offset: '+01:00', region: 'Europe' },
  { value: 'Europe/Paris', label: 'Central European Time - Paris, Berlin (CET/CEST, UTC+02:00)', offset: '+02:00', region: 'Europe' },
  { value: 'Europe/Berlin', label: 'Germany - Berlin, Frankfurt (CET/CEST, UTC+02:00)', offset: '+02:00', region: 'Europe' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time - Dubai, UAE (GST, UTC+04:00)', offset: '+04:00', region: 'Middle East' },
  { value: 'Asia/Singapore', label: 'Singapore Standard Time (SGT, UTC+08:00)', offset: '+08:00', region: 'Asia & South Asia' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time - Tokyo (JST, UTC+09:00)', offset: '+09:00', region: 'Asia & South Asia' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong Time (HKT, UTC+08:00)', offset: '+08:00', region: 'Asia & South Asia' },
  { value: 'Asia/Dhaka', label: 'Bangladesh Standard Time (BST, UTC+06:00)', offset: '+06:00', region: 'Asia & South Asia' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time - Sydney (AEST, UTC+10:00)', offset: '+10:00', region: 'Australia & Pacific' },
  { value: 'Australia/Melbourne', label: 'Melbourne (AEST, UTC+10:00)', offset: '+10:00', region: 'Australia & Pacific' },
  { value: 'Pacific/Auckland', label: 'New Zealand - Auckland (NZST, UTC+12:00)', offset: '+12:00', region: 'Australia & Pacific' },
  { value: 'UTC', label: 'Universal Coordinated Time (UTC+00:00)', offset: '+00:00', region: 'Global' },
];

export const ALL_DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const WORKING_DAYS_PRESETS = {
  MON_SAT: {
    label: 'Monday - Saturday (6 days)',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as DayOfWeek[],
  },
  MON_FRI: {
    label: 'Monday - Friday (5 days)',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as DayOfWeek[],
  },
  ALL_DAYS: {
    label: 'All Days (Monday - Sunday)',
    days: ALL_DAYS_OF_WEEK,
  },
  WEEKENDS: {
    label: 'Weekends Only (Saturday - Sunday)',
    days: ['Saturday', 'Sunday'] as DayOfWeek[],
  },
};

/**
 * Get user's system detected timezone
 */
export function getDetectedTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) return tz;
  } catch {}
  return 'Asia/Kolkata';
}

/**
 * Converts 24h format "09:30" to 12h format "09:30 AM"
 */
export function format24To12Hour(time24: string): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr || '0', 10);
  if (isNaN(h)) return time24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; // 0 becomes 12
  const formattedH = String(h).padStart(2, '0');
  const formattedM = String(m).padStart(2, '0');
  return `${formattedH}:${formattedM} ${ampm}`;
}

/**
 * Converts 12h format "09:30 AM" to 24h format "09:30"
 */
export function format12To24Hour(time12: string): string {
  if (!time12) return '09:30';
  const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return time12;
  let h = parseInt(match[1], 10);
  const m = match[2];
  const ampm = (match[3] || 'AM').toUpperCase();
  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${m}`;
}

/**
 * Convert time string "09:30" to total minutes from midnight
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  // If in 12h format, convert first
  let t24 = timeStr;
  if (timeStr.includes('AM') || timeStr.includes('PM') || timeStr.includes('am') || timeStr.includes('pm')) {
    t24 = format12To24Hour(timeStr);
  }
  const [h, m] = t24.split(':').map((x) => parseInt(x, 10) || 0);
  return h * 60 + m;
}

/**
 * Get current time details in a specific target timezone
 */
export function getTimeDetailsInTimezone(timezone: string, refDate = new Date()): {
  dayOfWeek: DayOfWeek;
  time24: string; // "09:30"
  time12: string; // "09:30 AM"
  dateString: string; // "2026-08-14"
  formattedFull: string; // "Friday, Aug 14, 2026, 09:30 AM"
  minutesFromMidnight: number;
} {
  try {
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const parts = dtf.formatToParts(refDate);
    const map: Record<string, string> = {};
    for (const p of parts) {
      map[p.type] = p.value;
    }

    const dayOfWeek = (map.weekday as DayOfWeek) || 'Monday';
    const hour = parseInt(map.hour, 10);
    const minute = parseInt(map.minute, 10);
    const time24 = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    const dateString = `${map.year}-${map.month}-${map.day}`;
    const minutesFromMidnight = hour * 60 + minute;
    const time12 = format24To12Hour(time24);

    const dtfReadable = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    return {
      dayOfWeek,
      time24,
      time12,
      dateString,
      formattedFull: dtfReadable.format(refDate),
      minutesFromMidnight,
    };
  } catch (err) {
    // Fallback using local date
    const dayNames: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[refDate.getDay()];
    const hour = refDate.getHours();
    const minute = refDate.getMinutes();
    const time24 = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    const dateString = refDate.toISOString().split('T')[0];
    const minutesFromMidnight = hour * 60 + minute;

    return {
      dayOfWeek,
      time24,
      time12: format24To12Hour(time24),
      dateString,
      formattedFull: refDate.toLocaleString(),
      minutesFromMidnight,
    };
  }
}

/**
 * Evaluate whether a schedule is currently active
 */
export function evaluateSchedule(
  schedule: MeetingScheduleEntity,
  refDate = new Date()
): ScheduleStatusInfo {
  const tz = schedule.timezone || 'Asia/Kolkata';
  const timeDetails = getTimeDetailsInTimezone(tz, refDate);

  if (!schedule.enabled) {
    return {
      isWithinSchedule: false,
      activeSchedule: schedule,
      currentDayInTz: timeDetails.dayOfWeek,
      currentTimeInTz: timeDetails.time12,
      currentTime24InTz: timeDetails.time24,
      currentDateInTz: timeDetails.dateString,
      timezone: tz,
      statusMessage: 'Schedule is currently disabled.',
      timeRemainingText: 'Disabled',
    };
  }

  const isDayMatched = schedule.workingDays.includes(timeDetails.dayOfWeek);
  const startMins = timeToMinutes(schedule.startTime);
  const endMins = timeToMinutes(schedule.endTime);
  const currentMins = timeDetails.minutesFromMidnight;

  const isTimeMatched = currentMins >= startMins && currentMins <= endMins;
  const isWithin = isDayMatched && isTimeMatched;

  let statusMessage = '';
  let timeRemainingText = '';

  if (isWithin) {
    const minsLeft = endMins - currentMins;
    const hLeft = Math.floor(minsLeft / 60);
    const mLeft = minsLeft % 60;
    statusMessage = `Active schedule window (${schedule.workingDays.length} working days, ${format24To12Hour(schedule.startTime)} - ${format24To12Hour(schedule.endTime)} [${tz}]).`;
    timeRemainingText = hLeft > 0 ? `${hLeft}h ${mLeft}m remaining in window` : `${mLeft}m remaining in window`;
  } else if (isDayMatched && currentMins < startMins) {
    const minsUntil = startMins - currentMins;
    const hUntil = Math.floor(minsUntil / 60);
    const mUntil = minsUntil % 60;
    statusMessage = `Scheduled window starts today at ${format24To12Hour(schedule.startTime)} (${tz}).`;
    timeRemainingText = hUntil > 0 ? `Starts in ${hUntil}h ${mUntil}m` : `Starts in ${mUntil}m`;
  } else if (isDayMatched && currentMins > endMins) {
    statusMessage = `Today's window ended at ${format24To12Hour(schedule.endTime)}. Next window starts on the next working day.`;
    timeRemainingText = 'Window ended for today';
  } else {
    statusMessage = `Today (${timeDetails.dayOfWeek}) is not configured as a working day for this schedule.`;
    timeRemainingText = 'Non-working day';
  }

  return {
    isWithinSchedule: isWithin,
    activeSchedule: schedule,
    currentDayInTz: timeDetails.dayOfWeek,
    currentTimeInTz: timeDetails.time12,
    currentTime24InTz: timeDetails.time24,
    currentDateInTz: timeDetails.dateString,
    timezone: tz,
    statusMessage,
    timeRemainingText,
  };
}

/**
 * Format days summary like "Monday - Saturday" or "Mon, Wed, Fri"
 */
export function formatWorkingDaysSummary(days: DayOfWeek[]): string {
  if (!days || days.length === 0) return 'None';
  if (days.length === 7) return 'All Days (Mon - Sun)';
  if (
    days.length === 6 &&
    !days.includes('Sunday') &&
    days.includes('Monday') &&
    days.includes('Saturday')
  ) {
    return 'Monday - Saturday';
  }
  if (
    days.length === 5 &&
    !days.includes('Saturday') &&
    !days.includes('Sunday') &&
    days.includes('Monday') &&
    days.includes('Friday')
  ) {
    return 'Monday - Friday';
  }
  return days.map((d) => d.slice(0, 3)).join(', ');
}
