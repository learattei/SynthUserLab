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
             <div className="w-full max-w-4xl mx-auto mt-8">
                <Loader message="Generating AI summary..." />
            </div>
        )
    }

    if (!summary) {
        return null;
    }

    return (
        <div className="w-full max-w-4xl mx-auto mt-8 p-6 bg-slate-800 rounded-xl shadow-lg animate-fade-in">
            <h2 className="text-xl font-semibold mb-4 text-sky-300 flex items-center">
                <LightbulbIcon className="w-6 h-6 mr-3" /> AI-Powered Summary
            </h2>
            <div className="space-y-4 bg-slate-900/50 p-4 rounded-lg">
                <div>
                    <h3 className="font-bold text-slate-200">Key Friction Points</h3>
                    <p className="text-sm text-slate-300 mt-1">{summary.summary}</p>
                </div>
                <div className="border-t border-slate-700 pt-4">
                    <h3 className="font-bold text-slate-200">Recommendation</h3>
                    <p className="text-sm text-slate-300 mt-1">{summary.suggestion}</p>
                </div>
            </div>
        </div>
    );
};

export default AISummary;