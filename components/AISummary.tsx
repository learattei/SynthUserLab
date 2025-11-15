import React from 'react';
import { FrictionSummary } from '../types';
import LightbulbIcon from './icons/LightbulbIcon';
import Loader from './Loader';

interface AISummaryProps {
    summary: FrictionSummary | null;
    isLoading: boolean;
}

const AISummary: React.FC<AISummaryProps> = ({ summary, isLoading }) => {
    if (isLoading) {
        return (
             <div className="w-full mt-8">
                <Loader message="Generating AI summary..." />
            </div>
        )
    }

    if (!summary) {
        return null;
    }

    return (
        <div className="w-full mt-8 p-6 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl shadow-soft animate-fade-in">
            <h2 className="font-serif text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400 flex items-center">
                <LightbulbIcon className="w-6 h-6 mr-3" /> Initial AI Analysis
            </h2>
            <div className="space-y-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">Key Friction Points</h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{summary.summary}</p>
                </div>
                <div className="border-t border-slate-200/80 dark:border-slate-700/80 pt-4">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">Top Recommendation</h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{summary.suggestion}</p>
                </div>
            </div>
        </div>
    );
};

export default AISummary;