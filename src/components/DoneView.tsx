import React from 'react';
import { DayTaskItem } from '../types';
import { formatMinutes, formatSlovakDateFriendly } from '../utils/dateUtils';
import { CheckCircle2, RotateCcw, Trash2, Award, Clock } from 'lucide-react';

interface DoneViewProps {
  completedItems: DayTaskItem[];
  onRestore: (item: DayTaskItem) => void;
  onClearHistory: () => void;
}

export const DoneView: React.FC<DoneViewProps> = ({
  completedItems,
  onRestore,
  onClearHistory,
}) => {
  const totalCompletedMinutes = completedItems.reduce((acc, i) => acc + (Number(i.minutes) || 0), 0);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'ucenie':
        return 'Učenie';
      case 'uloha':
        return 'Domáca úloha';
      case 'projekt':
        return 'Projekt';
      default:
        return 'Zadanie';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 tracking-wide uppercase flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Archív vybavených úloh</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Vybavené zadania
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Všetko čo si úspešne zvládol a odškrtol potiahnutím doľava.
            </p>
          </div>

          {completedItems.length > 0 && (
            <button
              onClick={onClearHistory}
              className="self-start sm:self-center px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vyčistiť archív</span>
            </button>
          )}
        </div>

        {/* Motivation Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100/70 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-emerald-900">Vybavené zadania</div>
              <div className="text-2xl font-black text-emerald-950 font-mono-tabular">
                {completedItems.length}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-slate-700" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600">Investovaný čas štúdia</div>
              <div className="text-2xl font-black text-slate-900 font-mono-tabular">
                {formatMinutes(totalCompletedMinutes)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {completedItems.length > 0 ? (
          completedItems.map((item) => (
            <div
              key={`${item.taskId}_${item.partId || 'done'}`}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5 flex-wrap">
                    <span className="font-semibold text-slate-800">
                      {getCategoryLabel(item.category)}
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span>{formatSlovakDateFriendly(item.date)}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="font-mono-tabular font-bold text-slate-800">
                      {formatMinutes(item.minutes)}
                    </span>
                    {item.isMultiDay && item.partLabel && (
                      <>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-emerald-700 font-medium">{item.partLabel}</span>
                      </>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-semibold text-slate-700 line-through">
                    {item.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => onRestore(item)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
                title="Vrátiť späť medzi aktívne úlohy"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Vrátiť späť</span>
              </button>
            </div>
          ))
        ) : (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
            <p className="text-sm text-slate-500">Zatiaľ nemáš žiadne vybavené úlohy.</p>
          </div>
        )}
      </div>
    </div>
  );
};
