import React from 'react';
import { Users, UserCheck } from 'lucide-react';

interface ParticipantsListCardProps {
  participants: string[];
}

export const ParticipantsListCard: React.FC<ParticipantsListCardProps> = ({ participants }) => {
  // Deterministic avatar styling based on initials
  const getAvatarStyle = (name: string, index: number) => {
    const styles = [
      'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
      'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    ];
    return styles[index % styles.length];
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div id="participants-list-card" className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-5 sm:p-6 backdrop-blur-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Users className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Participants ({participants.length})
          </h2>
        </div>
        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-mono font-medium">
          Verified
        </span>
      </div>

      <div className="space-y-2.5">
        {participants.map((person, idx) => {
          const avatarClass = getAvatarStyle(person, idx);
          const isHost = idx === 0;
          return (
            <div
              key={idx}
              className="flex items-center gap-3 p-2 rounded-xl bg-slate-50/60 dark:bg-slate-950/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 transition border border-slate-100 dark:border-slate-850"
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-mono font-bold flex-shrink-0 border shadow-2xs ${avatarClass}`}
              >
                {getInitials(person)}
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {person}
              </span>
              {isHost && (
                <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md border border-indigo-200/70 dark:border-indigo-900/60 ml-auto">
                  Lead / Host
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

