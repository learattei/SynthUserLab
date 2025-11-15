import React from 'react';
import { HistoryEntry, PersonaTypeTag, TestTypeTag } from '../types';
import PlusCircleIcon from './icons/PlusCircleIcon';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';

interface HistorySidebarProps {
  history: HistoryEntry[];
  activeId: string | 'new';
  onSelect: (id: string) => void;
  onNew: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const tagColors: Record<PersonaTypeTag | TestTypeTag, string> = {
    'Specific Task': 'bg-violet-100 text-violet-800 dark:bg-violet-900/70 dark:text-violet-300',
    'User Journey': 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/70 dark:text-fuchsia-300',
    'Novice': 'bg-sky-100 text-sky-800 dark:bg-sky-900/70 dark:text-sky-300',
    'Expert': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-300',
    'Custom': 'bg-amber-100 text-amber-800 dark:bg-amber-900/70 dark:text-amber-300',
    'Mixed': 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
};

const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, activeId, onSelect, onNew, theme, onToggleTheme }) => {
  return (
    <aside className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col sticky top-0 h-screen">
      <div className="p-4 border-b border-slate-200/80 dark:border-slate-800">
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusCircleIcon className="w-5 h-5" />
          New Simulation
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="p-2 space-y-1">
          {history.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                <p className="text-sm">Your simulation history will appear here.</p>
            </div>
          ) : (
            history.map((entry) => (
              <a
                key={entry.id}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onSelect(entry.id);
                }}
                className={`block p-4 rounded-lg transition-colors text-sm ${
                  activeId === entry.id
                    ? 'bg-blue-100 dark:bg-blue-950'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <h3 className={`font-semibold text-base mb-1.5 truncate ${activeId === entry.id ? 'text-blue-900 dark:text-blue-100' : 'text-slate-800 dark:text-slate-200'}`}>
                    {entry.title}
                </h3>
                <p className={`text-sm mb-3 ${activeId === entry.id ? 'text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400'}`}>
                    {entry.description}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${tagColors[entry.tags.testType]}`}>
                        {entry.tags.testType}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${tagColors[entry.tags.personaType]}`}>
                        {entry.tags.personaType}
                    </span>
                </div>
              </a>
            ))
          )}
        </nav>
      </div>
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-serif text-xl font-bold text-slate-800 dark:text-slate-100">Synth Labs</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">AI-Powered UX Testing</p>
          </div>
          <button
              onClick={onToggleTheme}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              aria-label="Toggle theme"
          >
              {theme === 'light' ? <MoonIcon className="w-5 h-5"/> : <SunIcon className="w-5 h-5"/>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default HistorySidebar;