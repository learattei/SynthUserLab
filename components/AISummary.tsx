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
        <div className="w-full mt-8 p-6 bg-white border border-slate-200/80 rounded-xl shadow-sm animate-fade-in">
            <h2 className="text-xl font-bold mb-4 text-violet-600 flex items-center">
                <LightbulbIcon className="w-6 h-6 mr-3" /> Initial AI Analysis
            </h2>
            <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                    <h3 className="font-semibold text-slate-700">Key Friction Points</h3>
                    <p className="text-sm text-slate-600 mt-1">{summary.summary}</p>
                </div>
                <div className="border-t border-slate-200/80 pt-4">
                    <h3 className="font-semibold text-slate-700">Top Recommendation</h3>
                    <p className="text-sm text-slate-600 mt-1">{summary.suggestion}</p>
                </div>
            </div>
        </div>
    );
};

export default AISummary;