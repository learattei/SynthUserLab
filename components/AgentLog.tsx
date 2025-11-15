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
        <div className="w-full max-w-4xl mx-auto mt-8 p-6 bg-slate-800 rounded-xl shadow-lg animate-fade-in">
            <h2 className="text-xl font-semibold mb-4 text-sky-300 flex items-center">
                <ChatBubbleIcon className="w-6 h-6 mr-3" /> Agent Log
            </h2>
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-3 bg-slate-900/50 p-4 rounded-lg">
                {results.map(result => (
                    <div key={result.persona.id} className="animate-slide-up">
                        <div className="flex items-center gap-2 mb-2 p-2 bg-slate-700 rounded-md">
                            <UserIcon className="w-5 h-5 text-sky-400" />
                            <h3 className="font-bold text-lg text-white">{result.persona.name}</h3>
                        </div>
                        <ul className="space-y-3 pl-4 border-l-2 border-slate-700">
                            {result.steps.map((step, index) => (
                                <li key={index}>
                                    <p className="text-sm text-slate-300 italic">
                                        <span className="text-slate-500 font-mono mr-2">{`> `}</span>"{step.thought}"
                                    </p>
                                    <pre className="bg-slate-800/50 mt-2 p-2 rounded text-xs text-sky-300 overflow-x-auto font-mono">
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