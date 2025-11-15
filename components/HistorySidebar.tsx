import React from 'react';
import { HistoryEntry, PersonaTypeTag, TestTypeTag } from '../types';
import PlusCircleIcon from './icons/PlusCircleIcon';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';

interface HistorySidebarProps {
  history: HistoryEntry[];
  activeId: string | 'new' | 'home';
  onSelect: (id: string) => void;
  onNew: () => void;
  onGoHome: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const tagColors: Record<PersonaTypeTag | TestTypeTag, string> = {
    'Specific Task': 'bg-violet-100 text-violet-800 dark:bg-violet-900/70 dark:text-violet-300',
    'User Journey': 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/70 dark:text-fuchsia-300',
    'Lazy Mode': 'bg-teal-100 text-teal-800 dark:bg-teal-900/70 dark:text-teal-300',
    'Competitor Analysis': 'bg-lime-100 text-lime-800 dark:bg-lime-900/70 dark:text-lime-300',
    'Novice': 'bg-sky-100 text-sky-800 dark:bg-sky-900/70 dark:text-sky-300',
    'Expert': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-300',
    'Custom': 'bg-amber-100 text-amber-800 dark:bg-amber-900/70 dark:text-amber-300',
    'Mixed': 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
};

const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, activeId, onSelect, onNew, onGoHome, theme, onToggleTheme }) => {
  return (
    <aside className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col sticky top-0 h-screen">
      <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 space-y-2">
         <button
          onClick={onGoHome}
          className={`w-full text-center px-4 py-2.5 font-semibold rounded-xl transition-colors ${
            activeId === 'home' 
            ? 'bg-blue-600 text-white' 
            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Homepage
        </button>
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
            history.map((entry) => {
              const latestVersion = entry.versions[entry.versions.length - 1];
              const wasSuccessful = latestVersion.yourSiteResults.every(r => r.completed);
              const descriptionText = entry.tags.testType === 'Lazy Mode'
                ? 'Generated Test Plan'
                : entry.tags.testType === 'User Journey'
                ? 'Tested defined user journey'
                : (entry.fullTask.length > 100 ? `${entry.fullTask.substring(0, 100)}...` : entry.fullTask);

              return (
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
                <div className="flex items-start gap-2 mb-1">
                    {wasSuccessful ? 
                        <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" /> : 
                        <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    }
                    <h3 className={`font-semibold text-base leading-tight ${activeId === entry.id ? 'text-blue-900 dark:text-blue-100' : 'text-slate-800 dark:text-slate-200'}`}>
                        {entry.title}
                    </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 pl-7">
                    {latestVersion.timestamp}
                </p>
                <p className={`text-sm mb-2 ${activeId === entry.id ? 'text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400'}`}>
                    {descriptionText}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 truncate">
                  {entry.prototypeUrl}
                </p>
                <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/50">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${tagColors[entry.tags.testType]}`}>
                        {entry.tags.testType}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${tagColors[entry.tags.personaType]}`}>
                        {entry.tags.personaType}
                    </span>
                </div>
              </a>
              )
            })
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