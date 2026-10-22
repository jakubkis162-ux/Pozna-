export type TaskCategory = 'ucenie' | 'uloha' | 'projekt';

export interface MultiDayPart {
  id: string;
  date: string; // YYYY-MM-DD
  minutes: number; // exact minutes e.g. 7, 23, 45
  label?: string; // e.g. "1. časť", "Polovica úloh"
  completed: boolean;
  completedAt?: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  category: TaskCategory;
  notes?: string;
  isMultiDay: boolean;

  // For single-day task
  scheduledDate?: string; // YYYY-MM-DD
  estimatedMinutes?: number; // exact minutes
  completed: boolean;
  completedAt?: string;

  // For multi-day task
  parts?: MultiDayPart[];

  createdAt: string;
  updatedAt?: string;
}

// Flat representation for display in day views
export interface DayTaskItem {
  taskId: string;
  partId?: string; // present if this is a part of multi-day task
  title: string;
  category: TaskCategory;
  notes?: string;
  date: string; // YYYY-MM-DD
  minutes: number;
  completed: boolean;
  completedAt?: string;
  isMultiDay: boolean;
  partIndex?: number;
  totalParts?: number;
  partLabel?: string;
}

export type ViewTab = 'dnes' | 'najblizsie' | 'vsetky' | 'hotove';
