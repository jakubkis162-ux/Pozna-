import React, { useState, useRef } from 'react';
import { DayTaskItem, TaskCategory } from '../types';
import { formatMinutes } from '../utils/dateUtils';
import {
  Check,
  Clock,
  BookOpen,
  Pencil,
  Target,
  ArrowRight,
  Trash2,
  Play,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface TaskCardProps {
  item: DayTaskItem;
  onComplete: (item: DayTaskItem) => void;
  onPostpone?: (item: DayTaskItem) => void;
  onDelete?: (item: DayTaskItem) => void;
  onStartFocus?: (item: DayTaskItem) => void;
  showDate?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  item,
  onComplete,
  onPostpone,
  onDelete,
  onStartFocus,
  showDate = false,
}) => {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSwipedAway, setIsSwipedAway] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const startXRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);
  const isPointerDownRef = useRef<boolean>(false);

  // Category styling
  const getCategoryConfig = (cat: TaskCategory) => {
    switch (cat) {
      case 'ucenie':
        return {
          label: 'Učenie / Písomka',
          textColor: 'text-indigo-700',
          bgColor: 'bg-indigo-50',
          borderColor: 'border-indigo-100',
          icon: BookOpen,
        };
      case 'uloha':
        return {
          label: 'Domáca úloha',
          textColor: 'text-amber-800',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-100',
          icon: Pencil,
        };
      case 'projekt':
        return {
          label: 'Projekt',
          textColor: 'text-emerald-800',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-100',
          icon: Target,
        };
    }
  };

  const catConfig = getCategoryConfig(item.category);
  const CategoryIcon = catConfig.icon;

  // Swipe handling
  const handlePointerDown = (e: React.PointerEvent) => {
    if (item.completed || isSwipedAway) return;
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;

    isPointerDownRef.current = true;
    startXRef.current = e.clientX;
    currentXRef.current = e.clientX;
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;
    const diff = e.clientX - startXRef.current;
    if (diff < 0) {
      const clamped = diff < -150 ? -150 + (diff + 150) * 0.2 : diff;
      currentXRef.current = clamped;
      setOffsetX(clamped);
    } else {
      setOffsetX(0);
    }
  };

  const finishDrag = () => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    setIsDragging(false);

    if (offsetX <= -70) {
      setIsSwipedAway(true);
      setOffsetX(-400);
      setTimeout(() => {
        onComplete(item);
      }, 240);
    } else {
      setOffsetX(0);
    }
  };

  const handleDirectComplete = () => {
    setIsSwipedAway(true);
    setOffsetX(-400);
    setTimeout(() => {
      onComplete(item);
    }, 240);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl select-none group touch-pan-y">
      {/* Revealed background during swipe left */}
      <div
        className={`absolute inset-0 flex items-center justify-end px-6 transition-colors duration-200 ${
          offsetX <= -60 ? 'bg-emerald-600' : 'bg-emerald-500/80'
        }`}
      >
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <span className="tracking-wide">Vybavené!</span>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Check className="w-5 h-5 text-white stroke-[3]" />
          </div>
        </div>
      </div>

      {/* Main card surface */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isDragging ? 'none' : 'transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s',
          opacity: isSwipedAway ? 0 : 1,
        }}
        className={`relative bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs transition-shadow hover:shadow-md cursor-grab active:cursor-grabbing ${
          item.completed ? 'opacity-60 bg-slate-50' : ''
        }`}
      >
        <div className="flex items-start gap-3.5">
          {/* Completion checkmark button */}
          <button
            onClick={handleDirectComplete}
            aria-label="Označiť ako vybavené"
            className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
              item.completed
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 text-transparent hover:text-emerald-600'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </button>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Meta row: Category, Multi-day slice */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mb-1.5">
              <span className={`inline-flex items-center gap-1 font-semibold ${catConfig.textColor}`}>
                <CategoryIcon className="w-3.5 h-3.5" />
                <span>{catConfig.label}</span>
              </span>

              {item.isMultiDay && item.totalParts && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                    <Layers className="w-3 h-3" />
                    <span>Časť {item.partIndex} z {item.totalParts}</span>
                  </span>
                </>
              )}

              {showDate && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-slate-600 font-mono-tabular">{item.date}</span>
                </>
              )}
            </div>

            {/* Task Title */}
            <h3
              className={`text-base font-bold tracking-tight text-slate-900 leading-snug break-words ${
                item.completed ? 'line-through text-slate-500' : ''
              }`}
            >
              {item.title}
            </h3>

            {/* Part label if multi-day */}
            {item.partLabel && item.partLabel !== item.title && (
              <p className="text-xs text-emerald-800 font-medium mt-1">
                Zameranie na dnes: <span className="font-semibold">{item.partLabel}</span>
              </p>
            )}

            {/* Notes preview or expansion */}
            {item.notes && (
              <div className="mt-1.5">
                {showNotes ? (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 whitespace-pre-wrap">
                    {item.notes}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 line-clamp-1 italic">
                    "{item.notes}"
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setShowNotes(!showNotes)}
                  className="text-[11px] font-medium text-slate-500 hover:text-slate-800 underline mt-0.5"
                >
                  {showNotes ? 'Menej poznámok' : 'Zobraziť celé poznámky'}
                </button>
              </div>
            )}

            {/* Footer row: Estimated Duration + Action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg font-mono-tabular">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>{formatMinutes(item.minutes)}</span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5">
                {onStartFocus && !item.completed && (
                  <button
                    onClick={() => onStartFocus(item)}
                    title="Spustiť časovač sústredenia"
                    className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 text-amber-600 fill-amber-600" />
                    <span>Robiť teraz</span>
                  </button>
                )}

                {onPostpone && !item.completed && (
                  <button
                    onClick={() => onPostpone(item)}
                    title="Posunúť na zajtra"
                    className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <ArrowRight className="w-3 h-3" />
                    <span className="hidden sm:inline">Na zajtra</span>
                  </button>
                )}

                {onDelete && (
                  <button
                    onClick={() => onDelete(item)}
                    title="Zmazať zadanie"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Subtle swipe hint indicator on card right edge */}
        {!item.completed && (
          <div className="hidden sm:flex items-center gap-0.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-slate-400 transition-colors pointer-events-none text-[11px]">
            <ChevronRight className="w-4 h-4 rotate-180" />
          </div>
        )}
      </div>
    </div>
  );
};
