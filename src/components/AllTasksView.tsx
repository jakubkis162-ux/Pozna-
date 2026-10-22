import React, { useState } from 'react';
import { Task, TaskCategory } from '../types';
import { formatMinutes, formatSlovakDateFriendly } from '../utils/dateUtils';
import {
  Layers,
  Pencil,
  BookOpen,
  Target,
  Trash2,
  CheckCircle2,
  Clock,
  Search,
} from 'lucide-react';

interface AllTasksViewProps {
  tasks: Task[];
  onDeleteTask: (taskId: string) => void;
  onTogglePartComplete: (taskId: string, partId?: string) => void;
}

export const AllTasksView: React.FC<AllTasksViewProps> = ({
  tasks,
  onDeleteTask,
  onTogglePartComplete,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTasks = tasks.filter((t) => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchNotes = t.notes?.toLowerCase().includes(q);
      if (!matchTitle && !matchNotes) return false;
    }
    return true;
  });

  const getCategoryConfig = (cat: TaskCategory) => {
    switch (cat) {
      case 'ucenie':
        return { label: 'Učenie', icon: BookOpen, color: 'text-indigo-600' };
      case 'uloha':
        return { label: 'Domáca úloha', icon: Pencil, color: 'text-amber-600' };
      case 'projekt':
        return { label: 'Projekt', icon: Target, color: 'text-emerald-600' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Všetky zadané úlohy & projekty
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Kompletný zoznam všetkých tvojich zadaní, viacdňových projektov a prípravy na skúšky.
        </p>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-6 pt-6 border-t border-slate-100">
          {/* Segmented Category Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Všetky ({tasks.length})
            </button>
            <button
              onClick={() => setSelectedCategory('uloha')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === 'uloha'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Pencil className="w-3.5 h-3.5 text-amber-500" />
              <span>Domáce úlohy</span>
            </button>
            <button
              onClick={() => setSelectedCategory('ucenie')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === 'ucenie'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span>Učenie</span>
            </button>
            <button
              onClick={() => setSelectedCategory('projekt')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === 'projekt'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-emerald-500" />
              <span>Projekty</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Hľadať zadanie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:border-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const catConfig = getCategoryConfig(task.category);
            const Icon = catConfig.icon;

            if (task.isMultiDay && task.parts) {
              const completedPartsCount = task.parts.filter((p) => p.completed).length;
              const totalTime = task.parts.reduce((a, b) => a + (Number(b.minutes) || 0), 0);

              return (
                <div
                  key={task.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <span className={`flex items-center gap-1 font-semibold ${catConfig.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                          <span>Projekt na viac dní</span>
                        </span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="font-mono-tabular font-bold text-slate-800">
                          Spolu {formatMinutes(totalTime)}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{task.title}</h3>
                      {task.notes && (
                        <p className="text-xs text-slate-500 mt-1 italic">{task.notes}</p>
                      )}
                    </div>

                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Zmazať projekt"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Multi-day schedule parts cards */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Rozpis jednotlivých dní ({completedPartsCount} z {task.parts.length} hotových)</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {task.parts.map((part, pIdx) => (
                        <div
                          key={part.id}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                            part.completed
                              ? 'bg-emerald-50/50 border-emerald-200 text-slate-600'
                              : 'bg-slate-50/80 border-slate-200 text-slate-900'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate">
                              {part.label || `${pIdx + 1}. časť`}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono-tabular flex items-center gap-1.5 mt-0.5">
                              <span>{formatSlovakDateFriendly(part.date)}</span>
                              <span>·</span>
                              <span>{formatMinutes(part.minutes)}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => onTogglePartComplete(task.id, part.id)}
                            className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                              part.completed
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-300 hover:border-emerald-500 bg-white'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            // Single day task
            return (
              <div
                key={task.id}
                className={`bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center justify-between gap-3 ${
                  task.completed ? 'opacity-60 bg-slate-50' : ''
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    onClick={() => onTogglePartComplete(task.id)}
                    className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      task.completed
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-emerald-500 bg-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 flex-wrap">
                      <span className={`flex items-center gap-1 font-semibold ${catConfig.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                        <span>{catConfig.label}</span>
                      </span>
                      {task.scheduledDate && (
                        <>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="font-mono-tabular">
                            {formatSlovakDateFriendly(task.scheduledDate)}
                          </span>
                        </>
                      )}
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="font-mono-tabular font-bold text-slate-800">
                        {formatMinutes(task.estimatedMinutes || 15)}
                      </span>
                    </div>

                    <h3
                      className={`text-sm sm:text-base font-bold text-slate-900 ${
                        task.completed ? 'line-through text-slate-500' : ''
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.notes && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">
                        {task.notes}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                  title="Zmazať úlohu"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
            <p className="text-sm text-slate-500">Nenašli sa žiadne úlohy pre zvolený filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
