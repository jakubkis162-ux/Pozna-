import React from 'react';
import { DayTaskItem } from '../types';
import { TaskCard } from './TaskCard';
import { formatMinutes, formatSlovakDateFull, getTodayDateString } from '../utils/dateUtils';
import {
  Clock,
  CheckCircle2,
  ListTodo,
  Plus,
  Sparkles,
  PartyPopper,
  Flame,
  ArrowRight,
} from 'lucide-react';

interface TodayViewProps {
  items: DayTaskItem[];
  onComplete: (item: DayTaskItem) => void;
  onPostpone: (item: DayTaskItem) => void;
  onDelete: (item: DayTaskItem) => void;
  onStartFocus: (item: DayTaskItem) => void;
  onOpenAddTask: () => void;
  onGoToUpcoming: () => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  items,
  onComplete,
  onPostpone,
  onDelete,
  onStartFocus,
  onOpenAddTask,
  onGoToUpcoming,
}) => {
  const today = getTodayDateString();
  const dateFull = formatSlovakDateFull(today);

  const pendingItems = items.filter((i) => !i.completed);
  const completedItems = items.filter((i) => i.completed);

  const totalMinutes = items.reduce((acc, i) => acc + i.minutes, 0);
  const pendingMinutes = pendingItems.reduce((acc, i) => acc + i.minutes, 0);
  const completedMinutes = completedItems.reduce((acc, i) => acc + i.minutes, 0);

  const progressPercent =
    items.length > 0 ? Math.round((completedItems.length / items.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Hero Header & Daily Stat Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
              {dateFull}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Čo ťa čaká dnes
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Žiadny preplnený kalendár. Len to, čomu sa dnes večer potrebuješ venovať.
            </p>
          </div>

          <button
            onClick={onOpenAddTask}
            className="self-start sm:self-center px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nahrať zadanie po hodine</span>
          </button>
        </div>

        {/* 3 Metric Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-100">
          {/* Time to invest today */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Potrebný čas dnes</span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono-tabular">
              {formatMinutes(pendingMinutes)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {completedMinutes > 0 ? (
                <span>Hotovo už {formatMinutes(completedMinutes)}</span>
              ) : (
                <span>Celkovo {formatMinutes(totalMinutes)} naplánovaných</span>
              )}
            </div>
          </div>

          {/* Pending Tasks Count */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <ListTodo className="w-4 h-4 text-indigo-600" />
              <span>Zadania na dnes</span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono-tabular">
              {pendingItems.length} {pendingItems.length === 1 ? 'úloha' : pendingItems.length < 5 && pendingItems.length > 0 ? 'úlohy' : 'úloh'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {completedItems.length > 0 ? (
                <span className="text-emerald-700 font-medium">
                  {completedItems.length} vybavených dnes
                </span>
              ) : (
                <span>Pripravené na vybavenie</span>
              )}
            </div>
          </div>

          {/* Progress % */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Dnešný postup</span>
                </span>
                <span className="font-mono-tabular font-bold text-slate-900">
                  {progressPercent}%
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              {items.length === 0
                ? 'Zatiaľ žiadne úlohy na dnes'
                : pendingItems.length === 0
                ? 'Všetko na dnes dokončené!'
                : `Zostáva dokončiť ${pendingItems.length} z ${items.length}`}
            </div>
          </div>
        </div>
      </div>

      {/* Swipe tutorial callout banner */}
      {pendingItems.length > 0 && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-50/90 border border-amber-200/60 text-xs text-amber-900">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Rýchle vybavenie:</strong> Úlohu označíš za vybavenú jednoduchým <strong>potiahnutím doľava 👈</strong> alebo kliknutím na krúžok.
          </span>
        </div>
      )}

      {/* Today's Tasks Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">
            Dnešné zadania ({pendingItems.length})
          </h2>
          {pendingMinutes > 0 && (
            <span className="text-xs text-slate-500 font-mono-tabular font-semibold">
              Spolu: {formatMinutes(pendingMinutes)}
            </span>
          )}
        </div>

        {pendingItems.length > 0 ? (
          <div className="space-y-3">
            {pendingItems.map((item) => (
              <TaskCard
                key={`${item.taskId}_${item.partId || 'single'}`}
                item={item}
                onComplete={onComplete}
                onPostpone={onPostpone}
                onDelete={onDelete}
                onStartFocus={onStartFocus}
              />
            ))}
          </div>
        ) : (
          /* Empty pending state */
          <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-slate-200/80">
            {completedItems.length > 0 ? (
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <PartyPopper className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Skvelá práca! Na dnes máš všetko hotové.
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Dnes si vybavil všetky svoje naplánované úlohy ({formatMinutes(completedMinutes)} práce).
                  Môžeš si oddýchnuť alebo sa pozrieť na ďalšie dni.
                </p>
                <div className="pt-2 flex items-center justify-center gap-2">
                  <button
                    onClick={onGoToUpcoming}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <span>Pozrieť najbližšie dni</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={onOpenAddTask}
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nahrať nové zadanie</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                  <Flame className="w-7 h-7 text-amber-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Na dnes nemáš zatiaľ žiadne zadanie
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Práve ti skončila hodina? Nahraj si úlohu do apky hneď, kým ju máš v čerstvej pamäti.
                </p>
                <div className="pt-2">
                  <button
                    onClick={onOpenAddTask}
                    className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors inline-flex items-center gap-2 shadow-xs"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Nahrať zadanie po hodine</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Already completed section for today */}
      {completedItems.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Vybavené dnes ({completedItems.length})
            </h3>
            <span className="text-xs text-emerald-700 font-semibold font-mono-tabular">
              +{formatMinutes(completedMinutes)}
            </span>
          </div>

          <div className="space-y-2 opacity-80">
            {completedItems.map((item) => (
              <TaskCard
                key={`${item.taskId}_${item.partId || 'done'}`}
                item={item}
                onComplete={() => {}}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
