/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Task, DayTaskItem, ViewTab } from './types';
import {
  auth,
  testFirestoreConnection,
  loginWithGoogle,
  logoutUser,
  deleteUserAccountAndData,
  subscribeToUserTasks,
  saveTaskToFirestore,
  deleteTaskFromFirestore,
} from './services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  cleanOldDemoTasksFromLocalStorage,
  getFlatTasksForDay,
  getAllFlatCompletedTasks,
} from './services/storage';
import { getTodayDateString, getDateOffsetString } from './utils/dateUtils';
import { Header } from './components/Header';
import { TodayView } from './components/TodayView';
import { UpcomingView } from './components/UpcomingView';
import { AllTasksView } from './components/AllTasksView';
import { DoneView } from './components/DoneView';
import { AddTaskModal } from './components/AddTaskModal';
import { FocusTimerModal } from './components/FocusTimerModal';
import { PrivacyModal } from './components/PrivacyModal';
import { Check, Plus, AlertCircle, Loader2, CloudCheck, LogIn } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<ViewTab>('dnes');
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [addTaskDate, setAddTaskDate] = useState<string | undefined>(undefined);
  const [focusTask, setFocusTask] = useState<DayTaskItem | null>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // 1. Test connection to Firestore on boot and clean old demo tasks
  useEffect(() => {
    cleanOldDemoTasksFromLocalStorage();
    testFirestoreConnection();
  }, []);

  // 2. Auth state subscription
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // 3. Realtime Firestore sync for authenticated user (completely clean, 0 demo tasks)
  useEffect(() => {
    cleanOldDemoTasksFromLocalStorage();

    if (!user) {
      // Guest / offline fallback - purely what the user creates
      try {
        const local = localStorage.getItem('poznoc_guest_tasks');
        if (local) {
          const parsed = JSON.parse(local);
          const filtered = Array.isArray(parsed)
            ? parsed.filter(
                (t: Task) =>
                  !t.id?.startsWith('task_demo_') &&
                  !t.id?.startsWith('task_init_') &&
                  !t.title?.includes('derivácie') &&
                  !t.title?.includes('fotosyntéze')
              )
            : [];
          setTasks(filtered);
        } else {
          setTasks([]);
        }
      } catch {
        setTasks([]);
      }
      setTasksLoading(false);
      return;
    }

    setTasksLoading(true);

    const unsubscribeTasks = subscribeToUserTasks(
      user.uid,
      (userTasks) => {
        setTasks(userTasks);
        setTasksLoading(false);
      },
      (err) => {
        console.error('Error in realtime subscription:', err);
        setTasksLoading(false);
      }
    );

    return () => unsubscribeTasks();
  }, [user]);

  // Handle Google Login
  const handleLogin = async () => {
    try {
      const loggedUser = await loginWithGoogle();
      showToast(`Prihlásený ako ${loggedUser.displayName || loggedUser.email}`);
    } catch (err: unknown) {
      console.error('Login error:', err);
      showToast('Prihlásenie nebolo dokončené');
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      showToast('Úspešne odhlásený');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Handle Account & Data Deletion
  const handleDeleteAccount = async () => {
    if (!user) return;
    const confirmed = window.confirm(
      'Naozaj chceš natrvalo vymazať svoj účet a všetky svoje uložené zadania? Túto akciu nie je možné vrátiť späť.'
    );
    if (!confirmed) return;

    try {
      await deleteUserAccountAndData(user.uid);
      showToast('Účet a všetky údaje boli vymazané');
    } catch (err) {
      console.error('Error deleting account:', err);
      showToast('Chyba pri mazaní účtu');
    }
  };

  const todayStr = getTodayDateString();
  const todayItems = getFlatTasksForDay(tasks, todayStr);
  const pendingTodayCount = todayItems.filter((i) => !i.completed).length;
  const completedFlatItems = getAllFlatCompletedTasks(tasks);

  // Add task handler
  const handleSaveTask = async (
    taskData: Omit<Task, 'id' | 'createdAt' | 'userId' | 'completed'>
  ) => {
    const currentUserId = user?.uid || 'guest_user';
    const newTask: Task = {
      ...taskData,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: currentUserId,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (user) {
      try {
        await saveTaskToFirestore(user.uid, newTask);
        showToast(
          newTask.isMultiDay
            ? `Projekt "${newTask.title}" rozložený a uložený`
            : `Zadanie "${newTask.title}" uložené`
        );
      } catch (err) {
        console.error('Failed saving to firestore:', err);
        showToast('Chyba pri ukladaní do cloudu');
      }
    } else {
      const updated = [newTask, ...tasks];
      setTasks(updated);
      localStorage.setItem('poznoc_guest_tasks', JSON.stringify(updated));
      showToast(`Zadanie "${newTask.title}" uložené`);
    }
  };

  // Complete item handler
  const handleCompleteItem = async (item: DayTaskItem) => {
    const targetTask = tasks.find((t) => t.id === item.taskId);
    if (!targetTask) return;

    let updatedTask: Task;

    if (!targetTask.isMultiDay) {
      updatedTask = {
        ...targetTask,
        completed: true,
        completedAt: new Date().toISOString(),
      };
    } else {
      const updatedParts = (targetTask.parts || []).map((part) =>
        part.id === item.partId
          ? { ...part, completed: true, completedAt: new Date().toISOString() }
          : part
      );
      const allPartsDone = updatedParts.every((p) => p.completed);
      updatedTask = {
        ...targetTask,
        parts: updatedParts,
        completed: allPartsDone,
        completedAt: allPartsDone ? new Date().toISOString() : undefined,
      };
    }

    if (user) {
      await saveTaskToFirestore(user.uid, updatedTask);
    } else {
      const updated = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
      setTasks(updated);
      localStorage.setItem('poznoc_guest_tasks', JSON.stringify(updated));
    }

    showToast(`Vybavené: ${item.title}`);
  };

  // Postpone task to tomorrow
  const handlePostponeItem = async (item: DayTaskItem) => {
    const tomorrowStr = getDateOffsetString(1);
    const targetTask = tasks.find((t) => t.id === item.taskId);
    if (!targetTask) return;

    let updatedTask: Task;

    if (!targetTask.isMultiDay) {
      updatedTask = {
        ...targetTask,
        scheduledDate: tomorrowStr,
      };
    } else {
      const updatedParts = (targetTask.parts || []).map((part) =>
        part.id === item.partId ? { ...part, date: tomorrowStr } : part
      );
      updatedTask = {
        ...targetTask,
        parts: updatedParts,
      };
    }

    if (user) {
      await saveTaskToFirestore(user.uid, updatedTask);
    } else {
      const updated = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
      setTasks(updated);
      localStorage.setItem('poznoc_guest_tasks', JSON.stringify(updated));
    }

    showToast(`Presunuté na zajtra (${tomorrowStr})`);
  };

  // Delete task completely
  const handleDeleteTask = async (taskId: string) => {
    if (user) {
      await deleteTaskFromFirestore(user.uid, taskId);
    } else {
      const updated = tasks.filter((t) => t.id !== taskId);
      setTasks(updated);
      localStorage.setItem('poznoc_guest_tasks', JSON.stringify(updated));
    }
    showToast('Zadanie vymazané');
  };

  const handleDeleteItem = (item: DayTaskItem) => {
    handleDeleteTask(item.taskId);
  };

  // Restore completed task
  const handleRestoreItem = async (item: DayTaskItem) => {
    const targetTask = tasks.find((t) => t.id === item.taskId);
    if (!targetTask) return;

    let updatedTask: Task;

    if (!targetTask.isMultiDay) {
      updatedTask = {
        ...targetTask,
        completed: false,
        completedAt: undefined,
      };
    } else {
      const updatedParts = (targetTask.parts || []).map((part) =>
        part.id === item.partId
          ? { ...part, completed: false, completedAt: undefined }
          : part
      );
      updatedTask = {
        ...targetTask,
        parts: updatedParts,
        completed: false,
        completedAt: undefined,
      };
    }

    if (user) {
      await saveTaskToFirestore(user.uid, updatedTask);
    } else {
      const updated = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
      setTasks(updated);
      localStorage.setItem('poznoc_guest_tasks', JSON.stringify(updated));
    }

    showToast(`Úloha vrátená medzi aktívne`);
  };

  // Toggle part in all tasks view
  const handleTogglePartComplete = async (taskId: string, partId?: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    let updatedTask: Task;

    if (!targetTask.isMultiDay) {
      const isDone = !targetTask.completed;
      updatedTask = {
        ...targetTask,
        completed: isDone,
        completedAt: isDone ? new Date().toISOString() : undefined,
      };
    } else {
      const updatedParts = (targetTask.parts || []).map((p) => {
        if (p.id === partId) {
          const isDone = !p.completed;
          return {
            ...p,
            completed: isDone,
            completedAt: isDone ? new Date().toISOString() : undefined,
          };
        }
        return p;
      });
      const allDone = updatedParts.every((p) => p.completed);
      updatedTask = {
        ...targetTask,
        parts: updatedParts,
        completed: allDone,
        completedAt: allDone ? new Date().toISOString() : undefined,
      };
    }

    if (user) {
      await saveTaskToFirestore(user.uid, updatedTask);
    } else {
      const updated = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
      setTasks(updated);
      localStorage.setItem('poznoc_guest_tasks', JSON.stringify(updated));
    }
  };

  // Clear all completed tasks
  const handleClearHistory = async () => {
    const toKeep = tasks.filter((task) => {
      if (!task.isMultiDay) return !task.completed;
      return task.parts?.some((p) => !p.completed);
    });

    const toDelete = tasks.filter((t) => !toKeep.includes(t));

    if (user) {
      for (const t of toDelete) {
        await deleteTaskFromFirestore(user.uid, t.id);
      }
    } else {
      setTasks(toKeep);
      localStorage.setItem('poznoc_guest_tasks', JSON.stringify(toKeep));
    }

    showToast('História vybavených úloh vyčistená');
  };

  const handleOpenAddTask = (date?: string) => {
    setAddTaskDate(date);
    setIsAddTaskOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pb-16 sm:pb-8">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddTask={() => handleOpenAddTask()}
        todayCount={pendingTodayCount}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onDeleteAccount={handleDeleteAccount}
      />

      {/* Cloud status banner for non-logged-in users */}
      {!user && !authLoading && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 py-2 px-4 text-center">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 text-xs text-amber-900 font-medium">
            <span>Údaje sú zatiaľ v tomto prehliadači. Pre synchronizáciu medzi mobilom a počítačom sa prihlás cez Google.</span>
            <button
              onClick={handleLogin}
              className="font-bold underline text-slate-900 hover:text-amber-800"
            >
              Prihlásiť sa
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-8">
        {authLoading || tasksLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
            <p className="text-sm font-semibold text-slate-700">Načítavam tvoje zadania...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dnes' && (
              <TodayView
                items={todayItems}
                onComplete={handleCompleteItem}
                onPostpone={handlePostponeItem}
                onDelete={handleDeleteItem}
                onStartFocus={(item) => setFocusTask(item)}
                onOpenAddTask={() => handleOpenAddTask(todayStr)}
                onGoToUpcoming={() => setActiveTab('najblizsie')}
              />
            )}

            {activeTab === 'najblizsie' && (
              <UpcomingView
                tasks={tasks}
                onComplete={handleCompleteItem}
                onPostpone={handlePostponeItem}
                onDelete={handleDeleteItem}
                onStartFocus={(item) => setFocusTask(item)}
                onOpenAddTaskForDate={(date) => handleOpenAddTask(date)}
              />
            )}

            {activeTab === 'vsetky' && (
              <AllTasksView
                tasks={tasks}
                onDeleteTask={handleDeleteTask}
                onTogglePartComplete={handleTogglePartComplete}
              />
            )}

            {activeTab === 'hotove' && (
              <DoneView
                completedItems={completedFlatItems}
                onRestore={handleRestoreItem}
                onClearHistory={handleClearHistory}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Floating Action Button (FAB) */}
      <div className="sm:hidden fixed bottom-5 right-5 z-40">
        <button
          onClick={() => handleOpenAddTask()}
          className="w-14 h-14 rounded-full bg-slate-900 text-white shadow-xl shadow-slate-900/25 flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Nahrať nové zadanie"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => {
          setIsAddTaskOpen(false);
          setAddTaskDate(undefined);
        }}
        onSave={handleSaveTask}
        initialDate={addTaskDate}
      />

      {/* Focus Timer Modal */}
      <FocusTimerModal
        item={focusTask}
        onClose={() => setFocusTask(null)}
        onComplete={handleCompleteItem}
      />

      {/* Privacy & Operator Contact Modal */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        onDeleteAccount={handleDeleteAccount}
        isLoggedIn={!!user}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-slate-900 text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-none">
          <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
            <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
