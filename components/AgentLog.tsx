import React from 'react';
import { SessionResult } from '../types';
import UserIcon from './icons/UserIcon';
import ChatBubbleIcon from './icons/ChatBubbleIcon';

interface AgentLogProps {
    results: SessionResult[];
}

const AgentLog: React.FC<AgentLogProps> = ({ results }) => {
    if (results.length === 0) {
        return null;
    }

    return (
        <div className="w-full mt-8 p-6 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl shadow-soft animate-fade-in">
            <h2 className="font-serif text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400 flex items-center">
                <ChatBubbleIcon className="w-6 h-6 mr-3" /> Live Agent Log
            </h2>
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                {results.map(result => (
                    <div key={result.persona.id} className="animate-slide-up">
                        <div className="flex items-center gap-3 mb-3 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <UserIcon className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{result.persona.name}</h3>
                        </div>
                        <ul className="space-y-4 pl-4 border-l-2 border-slate-300 dark:border-slate-600">
                            {result.steps.map((step, index) => (
                                <li key={index}>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                                        "{step.thought}"
                                    </p>
                                    <pre className="bg-slate-900 dark:bg-slate-950 mt-2 p-2 rounded-lg text-xs text-emerald-300 dark:text-emerald-400 overflow-x-auto font-mono">
                                        <code>{step.code}</code>
                                    </pre>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AgentLog;