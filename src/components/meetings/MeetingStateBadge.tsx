import React from 'react';
import { MeetingState } from '../../types';
import { Play, Pause, Square, CheckCircle2, AlertTriangle, Loader2, Clock, Radio } from 'lucide-react';

interface MeetingStateBadgeProps {
  status: MeetingState;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
}

export const MeetingStateBadge: React.FC<MeetingStateBadgeProps> = ({
  status,
  size = 'md',
  showPulse = true,
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-3.5 py-1.5 gap-2 font-bold',
  };

  switch (status) {
    case 'RECORDING':
      return (
        <span
          className={`inline-flex items-center rounded-full font-bold bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 shadow-xs ${sizeClasses[size]}`}
        >
          <span className="relative flex h-2 w-2">
            {showPulse && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            )}
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
          </span>
          <Radio className="w-3 h-3 text-rose-600 animate-pulse" />
          <span>RECORDING</span>
        </span>
      );

    case 'PAUSED':
      return (
        <span
          className={`inline-flex items-center rounded-full font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shadow-xs ${sizeClasses[size]}`}
        >
          <Pause className="w-3 h-3 text-amber-600" />
          <span>PAUSED</span>
        </span>
      );

    case 'READY':
      return (
        <span
          className={`inline-flex items-center rounded-full font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 shadow-xs ${sizeClasses[size]}`}
        >
          <Play className="w-3 h-3 text-blue-600" />
          <span>READY</span>
        </span>
      );

    case 'PROCESSING':
      return (
        <span
          className={`inline-flex items-center rounded-full font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 shadow-xs ${sizeClasses[size]}`}
        >
          <Loader2 className="w-3 h-3 text-indigo-600 animate-spin" />
          <span>PROCESSING</span>
        </span>
      );

    case 'COMPLETED':
      return (
        <span
          className={`inline-flex items-center rounded-full font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-xs ${sizeClasses[size]}`}
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>COMPLETED</span>
        </span>
      );

    case 'ERROR':
      return (
        <span
          className={`inline-flex items-center rounded-full font-bold bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 shadow-xs ${sizeClasses[size]}`}
        >
          <AlertTriangle className="w-3 h-3 text-red-600" />
          <span>ERROR</span>
        </span>
      );

    case 'IDLE':
    default:
      return (
        <span
          className={`inline-flex items-center rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs ${sizeClasses[size]}`}
        >
          <Clock className="w-3 h-3 text-slate-500" />
          <span>IDLE</span>
        </span>
      );
  }
};
