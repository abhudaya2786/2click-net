import { ScheduledEvent } from '../types';
import { downloadFile } from './exportUtils';

/**
 * Format a Date to ICS UTC string: YYYYMMDDTHHMMSSZ
 */
function toIcsDate(dateStr: string, timeStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = (timeStr || '10:00').split(':').map(Number);
  
  const d = new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0);
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Generates an RFC 5545 standard .ics file string
 */
export function generateIcsContent(event: ScheduledEvent): string {
  const dtStart = toIcsDate(event.date, event.time);
  
  // Calculate end time
  const [year, month, day] = event.date.split('-').map(Number);
  const [hours, minutes] = (event.time || '10:00').split(':').map(Number);
  const startDate = new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0);
  const endDate = new Date(startDate.getTime() + (event.durationMinutes || 30) * 60000);
  const dtEnd = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const cleanDescription = (event.description || '').replace(/\n/g, '\\n');
  const cleanSummary = (event.title || 'Scheduled Meeting').replace(/\n/g, ' ');

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Voice MoM AI//Meeting Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:mom-${event.id}-${Date.now()}@voicemom.ai`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${cleanSummary}`,
    `DESCRIPTION:${cleanDescription}`,
    event.attendees && event.attendees.length > 0 ? `ATTENDEE;CN=${event.attendees.join(', ')}:mailto:attendees@organization.com` : '',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);

  return icsLines.join('\r\n');
}

/**
 * Download .ics calendar invite
 */
export function downloadIcsInvite(event: ScheduledEvent) {
  const icsContent = generateIcsContent(event);
  const safeName = (event.title || 'Scheduled_Meeting').replace(/[^a-zA-Z0-9_-]/g, '_');
  downloadFile(icsContent, `${safeName}.ics`, 'text/calendar;charset=utf-8');
}

/**
 * Generate Google Calendar Web URL with prefilled parameters
 */
export function getGoogleCalendarUrl(event: ScheduledEvent): string {
  const [year, month, day] = event.date.split('-').map(Number);
  const [hours, minutes] = (event.time || '10:00').split(':').map(Number);
  const startDate = new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0);
  const endDate = new Date(startDate.getTime() + (event.durationMinutes || 30) * 60000);

  const formatUtc = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const datesParam = `${formatUtc(startDate)}/${formatUtc(endDate)}`;
  const text = encodeURIComponent(event.title || 'Scheduled Meeting');
  const details = encodeURIComponent(
    `${event.description || ''}\n\nAttendees: ${event.attendees?.join(', ') || 'Team'}\nGenerated via Voice MoM AI`
  );
  const addAttendees = event.attendees ? encodeURIComponent(event.attendees.join(',')) : '';

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${datesParam}&details=${details}&add=${addAttendees}`;
}

/**
 * Generate Outlook Web Calendar URL
 */
export function getOutlookCalendarUrl(event: ScheduledEvent): string {
  const [year, month, day] = event.date.split('-').map(Number);
  const [hours, minutes] = (event.time || '10:00').split(':').map(Number);
  const startDate = new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0);
  const endDate = new Date(startDate.getTime() + (event.durationMinutes || 30) * 60000);

  const startdt = startDate.toISOString();
  const enddt = endDate.toISOString();
  const subject = encodeURIComponent(event.title || 'Scheduled Meeting');
  const body = encodeURIComponent(event.description || '');

  return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${subject}&startdt=${startdt}&enddt=${enddt}&body=${body}&path=%2Fcalendar%2Faction%2Fcompose&rru=addevent`;
}
