import React from 'react';
import { BusinessAnalysisResult } from '../types';
import DownloadIcon from './icons/DownloadIcon';
import Loader from './Loader';

interface BusinessReportProps {
  result: BusinessAnalysisResult | null;
  task: string;
  onReset: () => void;
}

const impactConfig = {
    'High': { color: 'text-red-400', bg: 'bg-red-900/50', border: 'border-red-500' },
    'Medium': { color: 'text-yellow-400', bg: 'bg-yellow-900/50', border: 'border-yellow-500' },
    'Low': { color: 'text-sky-400', bg: 'bg-sky-900/50', border: 'border-sky-500' },
};

const BusinessReport: React.FC<BusinessReportProps> = ({ result, task, onReset }) => {
    
    const handleExport = () => {
        if (!result) return;

        let reportText = `Business Validation Report\n`;
        reportText += `============================\n\n`;
        reportText += `Task: ${task}\n`;
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
        a.download = 'business-validation-report.txt';
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
        <div className="w-full max-w-4xl mx-auto p-8 bg-slate-800 rounded-xl shadow-2xl animate-fade-in space-y-8">
             <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white">Business Validation Report</h1>
                    <p className="text-slate-400 mt-1">Task: <span className="font-semibold text-slate-300">{task}</span></p>
                </div>
                <button
                onClick={onReset}
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                Start New Test
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 flex flex-col items-center justify-center bg-slate-900/50 p-6 rounded-xl">
                    <h2 className="text-lg font-semibold text-slate-300 mb-2">Simulated Conversion Rate</h2>
                    <div className="relative w-40 h-40">
                         <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path
                                d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                className="text-slate-700"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                            />
                            <path
                                d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                className="text-sky-500 transition-all duration-1000"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeDasharray={`${conversionRate}, 100`}
                                strokeLinecap="round"
                                transform="rotate(90 18 18)"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl font-bold text-white">{conversionRate}%</span>
                        </div>
                    </div>
                </div>
                <div className="md:col-span-2 bg-slate-900/50 p-6 rounded-xl">
                    <h2 className="text-lg font-semibold text-slate-300 mb-4">Top 3 Friction Points Causing Drop-off</h2>
                    <ul className="space-y-4">
                        {topFrictionPoints.map((item, index) => {
                             const config = impactConfig[item.impact];
                             return (
                                <li key={index} className={`p-4 rounded-lg border-l-4 ${config.bg} ${config.border}`}>
                                    <div className="flex items-center">
                                        <span className={`px-2 py-0.5 text-xs font-semibold text-white rounded-full mr-3 ${config.bg.replace('/50', '')}`}>{item.impact}</span>
                                        <p className="text-slate-300">{item.point}</p>
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
                    className="inline-flex items-center gap-2 px-6 py-3 text-md font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all duration-200"
                >
                    <DownloadIcon className="w-5 h-5" />
                    Export for Pitch
                </button>
            </div>

        </div>
    );
};

export default BusinessReport;
