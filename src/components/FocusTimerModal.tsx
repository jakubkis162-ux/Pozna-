import React, { useState, useEffect } from 'react';
import { DayTaskItem } from '../types';
import { formatMinutes } from '../utils/dateUtils';
import { X, Play, Pause, RotateCcw, CheckCircle2, Flame, Award } from 'lucide-react';

interface FocusTimerModalProps {
  item: DayTaskItem | null;
  onClose: () => void;
  onComplete: (item: DayTaskItem) => void;
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  item,
  onClose,
  onComplete,
}) => {
  if (!item) return null;

  const totalSecondsInitial = (item.minutes || 25) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(totalSecondsInitial);
  const [isRunning, setIsRunning] = useState<boolean>(true);

  useEffect(() => {
    setSecondsRemaining((item.minutes || 25) * 60);
    setIsRunning(true);
  }, [item]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsRemaining]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressPercent = Math.min(
    100,
    Math.round(((totalSecondsInitial - secondsRemaining) / totalSecondsInitial) * 100)
  );

  const handleFinish = () => {
    onComplete(item);
    onClose();
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsRemaining(totalSecondsInitial);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 text-center overflow-hidden">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Task Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold mb-2">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>Čas na sústredenie</span>
          </div>

          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            {item.category === 'ucenie' ? 'Učenie' : item.category === 'projekt' ? 'Projekt' : 'Domáca úloha'}
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug line-clamp-2">
            {item.title}
          </h2>
          {item.partLabel && (
            <p className="text-xs text-emerald-700 font-semibold mt-1">
              {item.partLabel}
            </p>
          )}
        </div>

        {/* Big Circular/Numeric Countdown */}
        <div className="relative my-6 py-6 px-4 bg-slate-50 rounded-3xl border border-slate-100">
          <div className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight font-mono-tabular">
            {formattedTime}
          </div>

          <div className="text-xs text-slate-500 mt-2 font-medium">
            {secondsRemaining > 0
              ? `Plánovaný čas: ${formatMinutes(item.minutes)}`
              : 'Čas vypršal! Skvelá práca.'}
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-4">
            <div
              className="h-full bg-amber-500 transition-all duration-1000 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="h-12 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center gap-2 shadow-sm transition-all"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Pozastaviť</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Pokračovať</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="w-12 h-12 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors"
            title="Resetovať časovač"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Mark Done Button */}
        <button
          onClick={handleFinish}
          className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          <span>Mám to hotové! (Vybaviť)</span>
        </button>
      </div>
    </div>
  );
};
