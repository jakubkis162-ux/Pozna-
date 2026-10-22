import { Task, DayTaskItem } from '../types';

// Completely empty default - NO dummy or demo tasks as requested by the user
export function getInitialDemoTasks(_userId: string): Task[] {
  return [];
}

// Clean any old demo tasks that might have been saved in localStorage
export function cleanOldDemoTasksFromLocalStorage(): void {
  try {
    const keys = ['poznoc_guest_tasks', 'dnesrobit_student_tasks_v1'];
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter(
              (t: any) =>
                !t.id?.startsWith('task_demo_') &&
                !t.id?.startsWith('task_init_') &&
                !t.title?.includes('derivácie') &&
                !t.title?.includes('fotosyntéze')
            );
            localStorage.setItem(key, JSON.stringify(cleaned));
          }
        } catch {
          localStorage.removeItem(key);
        }
      }
    }
  } catch (err) {
    console.warn('Could not clean old demo tasks from localStorage:', err);
  }
}

export function getFlatTasksForDay(tasks: Task[], targetDate: string): DayTaskItem[] {
  const result: DayTaskItem[] = [];

  for (const task of tasks) {
    if (!task.isMultiDay) {
      if (task.scheduledDate === targetDate) {
        result.push({
          taskId: task.id,
          title: task.title,
          category: task.category,
          notes: task.notes,
          date: targetDate,
          minutes: task.estimatedMinutes || 15,
          completed: !!task.completed,
          completedAt: task.completedAt,
          isMultiDay: false,
        });
      }
    } else if (task.parts && Array.isArray(task.parts)) {
      const totalParts = task.parts.length;
      task.parts.forEach((part, index) => {
        if (part.date === targetDate) {
          result.push({
            taskId: task.id,
            partId: part.id,
            title: task.title,
            category: task.category,
            notes: task.notes,
            date: targetDate,
            minutes: part.minutes || 15,
            completed: !!part.completed,
            completedAt: part.completedAt,
            isMultiDay: true,
            partIndex: index + 1,
            totalParts,
            partLabel: part.label || `${index + 1}. časť`,
          });
        }
      });
    }
  }

  // Sort: pending first, then completed
  return result.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return 0;
  });
}

export function getAllFlatCompletedTasks(tasks: Task[]): DayTaskItem[] {
  const result: DayTaskItem[] = [];

  for (const task of tasks) {
    if (!task.isMultiDay) {
      if (task.completed) {
        result.push({
          taskId: task.id,
          title: task.title,
          category: task.category,
          notes: task.notes,
          date: task.scheduledDate || '',
          minutes: task.estimatedMinutes || 15,
          completed: true,
          completedAt: task.completedAt,
          isMultiDay: false,
        });
      }
    } else if (task.parts && Array.isArray(task.parts)) {
      const totalParts = task.parts.length;
      task.parts.forEach((part, index) => {
        if (part.completed) {
          result.push({
            taskId: task.id,
            partId: part.id,
            title: task.title,
            category: task.category,
            notes: task.notes,
            date: part.date,
            minutes: part.minutes || 15,
            completed: true,
            completedAt: part.completedAt,
            isMultiDay: true,
            partIndex: index + 1,
            totalParts,
            partLabel: part.label,
          });
        }
      });
    }
  }

  // Sort by completedAt descending
  return result.sort((a, b) => {
    const timeA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const timeB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
    return timeB - timeA;
  });
}
