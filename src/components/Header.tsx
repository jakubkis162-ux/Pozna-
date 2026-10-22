import React, { useState } from 'react';
import { ViewTab } from '../types';
import { User } from 'firebase/auth';
import {
  Plus,
  CheckSquare,
  CalendarDays,
  ListTodo,
  CheckCircle2,
  LogIn,
  LogOut,
  User as UserIcon,
  Shield,
  Trash2,
  Info,
} from 'lucide-react';

interface HeaderProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  onOpenAddTask: () => void;
  todayCount: number;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenPrivacy: () => void;
  onDeleteAccount: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenAddTask,
  todayCount,
  user,
  onLogin,
  onLogout,
  onOpenPrivacy,
  onDeleteAccount,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand wordmark: Poznač */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <CheckSquare className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap">
              Poznač
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => onTabChange('dnes')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'dnes'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Dnes</span>
            {todayCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center justify-center font-mono-tabular">
                {todayCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('najblizsie')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'najblizsie'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Najbližšie dni</span>
          </button>

          <button
            onClick={() => onTabChange('vsetky')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'vsetky'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Všetky úlohy</span>
          </button>

          <button
            onClick={() => onTabChange('hotove')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'hotove'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Vybavené</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action & Auth controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Add Task button */}
          <button
            onClick={onOpenAddTask}
            className="h-10 px-3.5 sm:px-4 text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 transition-all rounded-xl shadow-xs flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nahrať zadanie</span>
          </button>

          {/* User Account Button & Dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-10 h-10 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-slate-300 transition-all"
                title={user.displayName || user.email || 'Používateľ'}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Profil'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <div className="font-bold text-slate-900 truncate">
                        {user.displayName || 'Študent'}
                      </div>
                      <div className="text-slate-500 truncate text-[11px]">
                        {user.email}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenPrivacy();
                      }}
                      className="w-full px-3 py-2 text-left font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-slate-400" />
                      <span>Ochrana súkromia a kontakt</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full px-3 py-2 text-left font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-slate-400" />
                      <span>Odhlásiť sa</span>
                    </button>

                    <div className="pt-1 mt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onDeleteAccount();
                        }}
                        className="w-full px-3 py-2 text-left font-medium text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                        <span>Vymazať účet a moje údaje</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="h-10 px-3 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Prihlásiť cez Google</span>
              <span className="sm:hidden">Prihlásiť</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 bg-white px-2 py-1.5">
        <button
          onClick={() => onTabChange('dnes')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 ${
            activeTab === 'dnes' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600'
          }`}
        >
          <span>Dnes</span>
          {todayCount > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'dnes' ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-800'
              }`}
            >
              {todayCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange('najblizsie')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
            activeTab === 'najblizsie' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600'
          }`}
        >
          Najbližšie dni
        </button>

        <button
          onClick={() => onTabChange('vsetky')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
            activeTab === 'vsetky' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600'
          }`}
        >
          Všetky
        </button>

        <button
          onClick={() => onTabChange('hotove')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
            activeTab === 'hotove' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600'
          }`}
        >
          Vybavené
        </button>
      </div>
    </header>
  );
};
