import React from 'react';
import { Task, DayTaskItem } from '../types';
import { TaskCard } from './TaskCard';
import {
  getDateOffsetString,
  formatSlovakDateFriendly,
  formatSlovakDateFull,
  formatMinutes,
} from '../utils/dateUtils';
import { getFlatTasksForDay } from '../services/storage';
import { Plus, Coffee, Calendar } from 'lucide-react';

interface UpcomingViewProps {
  tasks: Task[];
  onComplete: (item: DayTaskItem) => void;
  onPostpone: (item: DayTaskItem) => void;
  onDelete: (item: DayTaskItem) => void;
  onStartFocus: (item: DayTaskItem) => void;
  onOpenAddTaskForDate: (date: string) => void;
}

export const UpcomingView: React.FC<UpcomingViewProps> = ({
  tasks,
  onComplete,
  onPostpone,
  onDelete,
  onStartFocus,
  onOpenAddTaskForDate,
}) => {
  // Generate next 7 upcoming days (starting from Tomorrow: offset +1 to +7)
  const upcomingDays = Array.from({ length: 7 }, (_, i) => {
    const offset = i + 1;
    const dateStr = getDateOffsetString(offset);
    const dayItems = getFlatTasksForDay(tasks, dateStr);
    const pendingItems = dayItems.filter((item) => !item.completed);
    const totalMinutes = pendingItems.reduce((acc, item) => acc + item.minutes, 0);

    return {
      offset,
      date: dateStr,
      friendlyLabel: formatSlovakDateFriendly(dateStr),
      fullLabel: formatSlovakDateFull(dateStr),
      items: dayItems,
      pendingItems,
      totalMinutes,
    };
  });

  return (
    <div className="space-y-6">
      {/* Overview Intro */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 tracking-wide uppercase flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Najbližší týždeň</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Čo ťa čaká v najbližších dňoch
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Prehľadný zoznam po jednotlivých dňoch bez zbytočných hodinových mriežok.
            </p>
          </div>
        </div>
      </div>

      {/* Day by Day Stream */}
      <div className="space-y-6">
        {upcomingDays.map((day) => (
          <div
            key={day.date}
            className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-xs"
          >
            {/* Day Header */}
            <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-base sm:text-lg font-bold text-slate-900">
                  {day.friendlyLabel}
                </span>
                <span className="text-xs text-slate-500 font-mono-tabular">
                  ({day.date})
                </span>
              </div>

              <div className="flex items-center gap-2">
                {day.totalMinutes > 0 ? (
                  <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg font-mono-tabular">
                    {formatMinutes(day.totalMinutes)}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                    Voľný večer
                  </span>
                )}

                <button
                  onClick={() => onOpenAddTaskForDate(day.date)}
                  title="Nahrať zadanie na tento deň"
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Pridať</span>
                </button>
              </div>
            </div>

            {/* Day Tasks */}
            {day.items.length > 0 ? (
              <div className="space-y-3">
                {day.items.map((item) => (
                  <TaskCard
                    key={`${item.taskId}_${item.partId || 'upcoming'}`}
                    item={item}
                    onComplete={onComplete}
                    onPostpone={onPostpone}
                    onDelete={onDelete}
                    onStartFocus={onStartFocus}
                  />
                ))}
              </div>
            ) : (
              <div className="py-4 px-3 flex items-center justify-between text-xs text-slate-400 bg-slate-50/60 rounded-xl">
                <div className="flex items-center gap-2 text-slate-500">
                  <Coffee className="w-4 h-4 text-slate-400" />
                  <span>Žiadne úlohy na tento deň. Môžeš oddychovať.</span>
                </div>
                <button
                  onClick={() => onOpenAddTaskForDate(day.date)}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-950 underline"
                >
                  Naplánovať sem niečo
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
