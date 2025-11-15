import React from 'react';

interface ProgressModalProps {
  progress: number;
  message: string;
}

const ProgressModal: React.FC<ProgressModalProps> = ({ progress, message }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/70 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-8 text-center border border-slate-200 dark:border-slate-700">
        <h2 className="font-serif text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Simulation in Progress...</h2>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all duration-500 ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="mt-6 text-slate-600 dark:text-slate-400 h-10 flex items-center justify-center">
            {message}
        </p>
      </div>
    </div>
  );
};

export default ProgressModal;
