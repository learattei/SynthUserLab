import React from 'react';
import { HistoryEntry } from '../types';
import PlusCircleIcon from './icons/PlusCircleIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';

interface HomePageProps {
  onStartNew: () => void;
  recentHistory: HistoryEntry[];
  onSelectHistory: (id: string) => void;
}

const tagColors = {
    'Specific Task': 'bg-violet-100 text-violet-800 dark:bg-violet-900/70 dark:text-violet-300',
    'User Journey': 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/70 dark:text-fuchsia-300',
    'Novice': 'bg-sky-100 text-sky-800 dark:bg-sky-900/70 dark:text-sky-300',
    'Expert': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-300',
    'Custom': 'bg-amber-100 text-amber-800 dark:bg-amber-900/70 dark:text-amber-300',
    'Mixed': 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
};

const HomePage: React.FC<HomePageProps> = ({ onStartNew, recentHistory, onSelectHistory }) => {
  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in p-4 md:p-0">
      <header className="w-full text-center py-12">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100">Welcome to Synth Labs</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-3 max-w-2xl mx-auto text-lg">Find every UX bug. Before your users do.</p>
        <button
          onClick={onStartNew}
          className="mt-8 inline-flex items-center gap-3 px-8 py-4 text-xl font-bold text-white bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 duration-300 ease-in-out shadow-lg"
        >
          <PlusCircleIcon className="w-6 h-6" />
          Start New Simulation
        </button>
      </header>
      
      <main>
        <h2 className="font-serif text-2xl font-bold mb-6 text-slate-800 dark:text-slate-200">Recent Simulations</h2>
        {recentHistory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentHistory.map((entry, index) => {
              const latestVersion = entry.versions[entry.versions.length - 1];
              const wasSuccessful = latestVersion.sessionResults.every(r => r.completed);
              return (
                <div
                  key={entry.id}
                  onClick={() => onSelectHistory(entry.id)}
                  className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl shadow-soft p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  style={{ animation: `slideUp 0.5s ease-out ${index * 0.1}s forwards`, opacity: 0 }}
                >
                  <div className="flex items-start gap-2 mb-1">
                      {wasSuccessful ? 
                          <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" /> : 
                          <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      }
                      <h3 className="font-semibold text-lg text-blue-800 dark:text-blue-300 truncate">{entry.title}</h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 pl-7">{latestVersion.timestamp}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {entry.fullTask.length > 80 ? `${entry.fullTask.substring(0, 80)}...` : entry.fullTask}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 truncate">
                    {entry.prototypeUrl}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-slate-200 dark:border-slate-700">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${tagColors[entry.tags.testType]}`}>
                          {entry.tags.testType}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${tagColors[entry.tags.personaType]}`}>
                          {entry.tags.personaType}
                      </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">You haven't run any simulations yet.</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Click "Start New Simulation" to begin.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;