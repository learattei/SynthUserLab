import React from 'react';
import { BusinessAnalysisResult } from '../types';
import DownloadIcon from './icons/DownloadIcon';
import Loader from './Loader';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

interface BusinessReportProps {
  result: BusinessAnalysisResult | null;
  task: string;
  onGoHome: () => void;
}

const impactConfig = {
    'High': { color: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-950/50', border: 'border-red-200 dark:border-red-800' },
    'Medium': { color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-950/50', border: 'border-amber-200 dark:border-amber-800' },
    'Low': { color: 'text-sky-700 dark:text-sky-300', bg: 'bg-sky-100 dark:bg-sky-950/50', border: 'border-sky-200 dark:border-sky-800' },
};

const BusinessReport: React.FC<BusinessReportProps> = ({ result, task, onGoHome }) => {
    
    const handleExport = () => {
        if (!result) return;

        let reportText = `Business Validation Report: Synth Labs\n`;
        reportText += `==============================================\n\n`;
        reportText += `Target Funnel: ${task}\n`;
        reportText += `Simulated Conversion Rate: ${result.conversionRate}%\n\n`;
        reportText += `Top Friction Points Causing Drop-off:\n`;
        reportText += `--------------------------------------\n`;
        result.topFrictionPoints.forEach((p, i) => {
            reportText += `${i + 1}. [${p.impact} Impact] ${p.point}\n`;
        });
        
        const blob = new Blob([reportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'synth-labs-report.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (!result) {
        return <div className="w-full max-w-4xl mx-auto"><Loader message="Generating Business Report..." /></div>;
    }

    const { conversionRate, topFrictionPoints } = result;

    return (
        <div className="w-full max-w-5xl mx-auto p-8 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl shadow-soft animate-fade-in space-y-8">
             <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onGoHome}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded-full transition-colors duration-200"
                        aria-label="Back to Home"
                    >
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">Business Validation Report</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Task: <span className="font-semibold text-slate-700 dark:text-slate-300">{task}</span></p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <div className="md:col-span-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">Simulated Conversion Rate</h2>
                    <div className="relative w-48 h-48">
                         <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                className="text-slate-200 dark:text-slate-700"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                            />
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                className="text-blue-500 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)] transition-all duration-1000"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeDasharray={`${conversionRate}, 100`}
                                strokeLinecap="round"
                                transform="rotate(90 18 18)"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-5xl font-bold text-slate-800 dark:text-slate-100">{conversionRate}<span className="text-3xl text-slate-500 dark:text-slate-400">%</span></span>
                        </div>
                    </div>
                </div>
                <div className="md:col-span-2 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">Top Friction Points Causing Drop-off</h2>
                    <ul className="space-y-4">
                        {topFrictionPoints.map((item, index) => {
                             const config = impactConfig[item.impact];
                             return (
                                <li key={index} className={`p-4 rounded-xl border-l-4 ${config.bg} ${config.border}`}>
                                    <div className="flex items-start">
                                        <span className={`text-xs font-bold mr-3 pt-1 ${config.color}`}>{item.impact.toUpperCase()}</span>
                                        <p className="text-slate-700 dark:text-slate-300">{item.point}</p>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>
            
            <div className="text-center pt-4">
                <button
                    onClick={handleExport}
                    className="inline-flex items-center gap-2 px-6 py-3 text-md font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                    <DownloadIcon className="w-5 h-5" />
                    Export for Pitch Deck
                </button>
            </div>

        </div>
    );
};

export default BusinessReport;
