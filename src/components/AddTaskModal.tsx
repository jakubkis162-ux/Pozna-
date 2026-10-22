import React, { useState, useEffect } from 'react';
import { Task, TaskCategory, MultiDayPart } from '../types';
import {
  getTodayDateString,
  getDateOffsetString,
  getQuickDayPresets,
  formatMinutes,
  formatSlovakDateFriendly,
} from '../utils/dateUtils';
import {
  X,
  Plus,
  Minus,
  Pencil,
  BookOpen,
  Target,
  Layers,
  Trash2,
  Clock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'userId' | 'completed'>) => void;
  initialDate?: string;
}

const TITLE_SUGGESTIONS: Record<TaskCategory, string[]> = {
  uloha: [
    'Príklady z učebnice',
    'Cvičenie v pracovnom zošite',
    'Prepočítať vzorce',
    'Dopísať poznámky',
  ],
  ucenie: [
    'Naučiť sa novú látku',
    'Opakovanie na písomku',
    'Slovná zásoba a frézy',
    'Prečítať kapitolu',
  ],
  projekt: [
    'Prezentácia na hodinu',
    'Referát a osnova',
    'Podklady a rešerš',
    'Grafické spracovanie',
  ],
};

const COMMON_MINUTE_PRESETS = [5, 10, 15, 20, 25, 30, 45, 60, 90];

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDate,
}) => {
  const today = getTodayDateString();
  const defaultDate = initialDate || today;

  // Form State - strictly cleared every time modal is opened
  const [category, setCategory] = useState<TaskCategory>('uloha');
  const [title, setTitle] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Single day state - stored as string so the user can backspace freely without snapback!
  const [isMultiDay, setIsMultiDay] = useState<boolean>(false);
  const [scheduledDate, setScheduledDate] = useState<string>(defaultDate);
  const [estimatedMinutes, setEstimatedMinutes] = useState<string>('15');

  // Multi-day state - each part minutes stored as string for full typing freedom
  const [parts, setParts] = useState<Array<{ date: string; minutes: string; label: string }>>([
    {
      date: defaultDate,
      minutes: '15',
      label: '1. časť: Úvod a podklady',
    },
    {
      date: getDateOffsetString(1),
      minutes: '15',
      label: '2. časť: Dokončenie',
    },
  ]);

  const [timeError, setTimeError] = useState<string | null>(null);

  // CRITICAL REQUIREMENT: Reset form fields completely whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      setCategory('uloha');
      setTitle('');
      setNotes('');
      setIsMultiDay(false);
      setScheduledDate(initialDate || getTodayDateString());
      setEstimatedMinutes('15');
      setParts([
        {
          date: initialDate || getTodayDateString(),
          minutes: '15',
          label: '1. časť: Úvod a podklady',
        },
        {
          date: getDateOffsetString(1),
          minutes: '15',
          label: '2. časť: Dokončenie',
        },
      ]);
      setTimeError(null);
    }
  }, [isOpen, initialDate]);

  if (!isOpen) return null;

  const quickDays = getQuickDayPresets();

  const handleSuggestionClick = (suggestion: string) => {
    setTitle(suggestion);
  };

  // Single-day minute helpers
  const handleSingleMinutesChange = (val: string) => {
    // Keep only numbers, allow complete clearing / empty string
    const cleaned = val.replace(/\D/g, '');
    setEstimatedMinutes(cleaned);
    if (timeError) setTimeError(null);
  };

  const adjustSingleMinutes = (delta: number) => {
    const current = Number(estimatedMinutes) || 0;
    const next = Math.max(1, current + delta);
    setEstimatedMinutes(String(next));
    if (timeError) setTimeError(null);
  };

  // Multi-day handlers
  const handleAddPart = () => {
    const nextOffset = parts.length;
    const nextDate = getDateOffsetString(nextOffset);
    setParts([
      ...parts,
      {
        date: nextDate,
        minutes: '15',
        label: `${parts.length + 1}. časť`,
      },
    ]);
  };

  const handleRemovePart = (index: number) => {
    if (parts.length <= 2) return;
    setParts(parts.filter((_, i) => i !== index));
  };

  const handlePartDateOrLabelChange = (
    index: number,
    field: 'date' | 'label',
    value: string
  ) => {
    const updated = [...parts];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setParts(updated);
  };

  // Multi-day minute change allows empty string so user can freely backspace 0 and 1!
  const handlePartMinutesChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '');
    const updated = [...parts];
    updated[index] = {
      ...updated[index],
      minutes: cleaned,
    };
    setParts(updated);
    if (timeError) setTimeError(null);
  };

  const adjustPartMinutes = (index: number, delta: number) => {
    const current = Number(parts[index].minutes) || 0;
    const next = Math.max(1, current + delta);
    const updated = [...parts];
    updated[index] = {
      ...updated[index],
      minutes: String(next),
    };
    setParts(updated);
    if (timeError) setTimeError(null);
  };

  const handleSplitEvenly = (numDays: number) => {
    const total = Number(estimatedMinutes) > 0 ? Number(estimatedMinutes) : 30;
    const minutesPerDay = Math.max(1, Math.round(total / numDays));

    const newParts = Array.from({ length: numDays }, (_, i) => ({
      date: getDateOffsetString(i),
      minutes: String(minutesPerDay),
      label: `${i + 1}. časť zo ${numDays}`,
    }));
    setParts(newParts);
    if (timeError) setTimeError(null);
  };

  const totalMultiDayMinutes = parts.reduce((acc, p) => acc + (Number(p.minutes) || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    if (!isMultiDay) {
      const parsedMinutes = Number(estimatedMinutes);
      // Validate that minutes is greater than 0
      if (!parsedMinutes || parsedMinutes <= 0) {
        setTimeError('Zadaj počet minút (čas musí byť aspoň 1 minúta).');
        return;
      }

      onSave({
        title: cleanTitle,
        category,
        notes: notes.trim() || undefined,
        isMultiDay: false,
        scheduledDate,
        estimatedMinutes: parsedMinutes,
      });
    } else {
      // Validate each part in multi-day
      const invalidPartIndex = parts.findIndex(
        (p) => !Number(p.minutes) || Number(p.minutes) <= 0
      );
      if (invalidPartIndex !== -1) {
        setTimeError(
          `V ${invalidPartIndex + 1}. časti zadaj platný čas (aspoň 1 minúta).`
        );
        return;
      }

      const formattedParts: MultiDayPart[] = parts.map((p, idx) => ({
        id: `part_${Date.now()}_${idx}`,
        date: p.date,
        minutes: Number(p.minutes),
        label: p.label.trim() || `${idx + 1}. časť`,
        completed: false,
      }));

      onSave({
        title: cleanTitle,
        category,
        notes: notes.trim() || undefined,
        isMultiDay: true,
        parts: formattedParts,
      });
    }

    // Reset and close
    setTitle('');
    setNotes('');
    setTimeError(null);
    onClose();
  };

  const currentSingleNum = Number(estimatedMinutes) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Nahrať zadanie
            </h2>
            <p className="text-xs text-slate-500">
              Zapíš si čo treba urobiť hneď po hodine, kým to máš v hlave
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* 1. Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Typ zadania
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCategory('uloha')}
                className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  category === 'uloha'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Pencil className="w-4 h-4" />
                <span>Domáca úloha</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('ucenie')}
                className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  category === 'ucenie'
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Učenie / Písomka</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('projekt')}
                className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  category === 'projekt'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Target className="w-4 h-4" />
                <span>Projekt</span>
              </button>
            </div>
          </div>

          {/* 2. Title input + quick suggestions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Čo presne máš urobiť? *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Napr. Príklady zo strany 42 alebo Prečítať kapitolu 3..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm font-medium border border-slate-200 rounded-xl focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all placeholder:text-slate-400"
            />

            {/* Quick autocomplete suggestions */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Rýchla voľba:
              </span>
              {TITLE_SUGGESTIONS[category].map((sugg) => (
                <button
                  key={sugg}
                  type="button"
                  onClick={() => handleSuggestionClick(sugg)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  {sugg}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Notes (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Poznámky <span className="text-slate-400 font-normal lowercase">(nepovinné)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Čísla príkladov, strana v zošite, link na zadanie..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* 4. MULTI-DAY TOGGLE */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                    isMultiDay ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Rozložiť úlohu na viac dní
                  </h4>
                  <p className="text-xs text-slate-500">
                    Polovicu spraviť v piatok a druhú v sobotu
                  </p>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => {
                  setIsMultiDay(!isMultiDay);
                  setTimeError(null);
                }}
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  isMultiDay ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    isMultiDay ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* SINGLE DAY VIEW */}
            {!isMultiDay && (
              <div className="mt-5 pt-4 border-t border-slate-200/70 space-y-4">
                {/* When to work on it */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-700">
                      Deň kedy sa ideš učiť / robiť úlohu
                    </label>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {quickDays.slice(0, 5).map((qd) => (
                      <button
                        key={qd.date}
                        type="button"
                        onClick={() => setScheduledDate(qd.date)}
                        className={`py-2 px-3 rounded-xl border text-left transition-all ${
                          scheduledDate === qd.date
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs font-semibold">{qd.label}</div>
                        <div
                          className={`text-[10px] ${
                            scheduledDate === qd.date ? 'text-slate-300' : 'text-slate-400'
                          }`}
                        >
                          {qd.sublabel}
                        </div>
                      </button>
                    ))}

                    <div className="relative">
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full h-full min-h-[44px] py-1.5 px-3 text-xs font-medium border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-hidden focus:border-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* SIMPLE, INTUITIVE & DIRECT TIME INPUT */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Koľko času ti to bude trvať?</span>
                    </label>

                    {currentSingleNum > 0 && (
                      <span className="text-xs font-bold text-slate-900 font-mono-tabular bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md">
                        {formatMinutes(currentSingleNum)}
                      </span>
                    )}
                  </div>

                  {/* Manual input box with easy steppers */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => adjustSingleMinutes(-5)}
                      className="h-10 px-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-mono-tabular"
                    >
                      -5m
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustSingleMinutes(-1)}
                      className="w-10 h-10 flex items-center justify-center text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                      title="Menej o 1 minútu"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    {/* Direct Text Input: allows complete clearing, backspacing, typing any digits */}
                    <div className="relative flex-1">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="napr. 7"
                        value={estimatedMinutes}
                        onChange={(e) => handleSingleMinutesChange(e.target.value)}
                        className="w-full h-10 text-center text-lg font-extrabold font-mono-tabular border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                        min
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => adjustSingleMinutes(1)}
                      className="w-10 h-10 flex items-center justify-center text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                      title="Viac o 1 minútu"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustSingleMinutes(5)}
                      className="h-10 px-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-mono-tabular"
                    >
                      +5m
                    </button>
                  </div>

                  {/* Quick one-tap preset chips */}
                  <div>
                    <div className="text-[11px] text-slate-400 mb-1.5">
                      Alebo klikni rýchlu predvoľbu:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {COMMON_MINUTE_PRESETS.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            setEstimatedMinutes(String(m));
                            if (timeError) setTimeError(null);
                          }}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all font-mono-tabular ${
                            estimatedMinutes === String(m)
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {m} min
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MULTI DAY BUILDER */}
            {isMultiDay && (
              <div className="mt-5 pt-4 border-t border-slate-200/70 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    Rýchle rozdelenie:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSplitEvenly(2)}
                      className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
                    >
                      Na 2 dni
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSplitEvenly(3)}
                      className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
                    >
                      Na 3 dni
                    </button>
                  </div>
                </div>

                {/* List of day slots */}
                <div className="space-y-3">
                  {parts.map((part, index) => {
                    const partMinsNum = Number(part.minutes) || 0;
                    return (
                      <div
                        key={index}
                        className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-2.5 shadow-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {index + 1}. časť úlohy
                          </span>
                          {parts.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePart(index)}
                              className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {/* Day selection */}
                          <div>
                            <label className="block text-[11px] font-medium text-slate-500 mb-1">
                              Deň práce
                            </label>
                            <input
                              type="date"
                              value={part.date}
                              onChange={(e) =>
                                handlePartDateOrLabelChange(index, 'date', e.target.value)
                              }
                              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900"
                            />
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {formatSlovakDateFriendly(part.date)}
                            </div>
                          </div>

                          {/* Free minute input: backspacing works naturally without snapping back! */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-[11px] font-medium text-slate-500">
                                Čas (minúty)
                              </label>
                              {partMinsNum > 0 && (
                                <span className="text-[11px] font-bold text-slate-700 font-mono-tabular">
                                  {formatMinutes(partMinsNum)}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => adjustPartMinutes(index, -5)}
                                className="h-8 px-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-mono-tabular"
                              >
                                -5m
                              </button>

                              {/* Direct text input allowing full backspacing */}
                              <div className="relative flex-1">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  placeholder="napr. 20"
                                  value={part.minutes}
                                  onChange={(e) =>
                                    handlePartMinutesChange(index, e.target.value)
                                  }
                                  className="w-full h-8 text-center text-xs font-bold font-mono-tabular border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:border-amber-500"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none">
                                  min
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => adjustPartMinutes(index, 5)}
                                className="h-8 px-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-mono-tabular"
                              >
                                +5m
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Part description */}
                        <div>
                          <input
                            type="text"
                            placeholder="Popis časti (napr. 1. polovica otázok, vyhľadanie zdrojov)..."
                            value={part.label}
                            onChange={(e) =>
                              handlePartDateOrLabelChange(index, 'label', e.target.value)
                            }
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-100 bg-slate-50 rounded-lg focus:outline-hidden focus:border-slate-900 placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleAddPart}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Pridať ďalší deň</span>
                  </button>

                  <div className="text-xs font-semibold text-slate-800 font-mono-tabular">
                    Spolu: {formatMinutes(totalMultiDayMinutes)} ({parts.length} dni)
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Inline Error notice if time is 0 or empty when saving */}
          {timeError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{timeError}</span>
            </div>
          )}

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <span>Uložiť zadanie</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
