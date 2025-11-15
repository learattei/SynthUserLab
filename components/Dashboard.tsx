import React, { useState, useMemo } from 'react';
import { SessionResult, AnalysisResult } from '../types';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';
import LightbulbIcon from './icons/LightbulbIcon';
import UserIcon from './icons/UserIcon';
import ClipboardIcon from './icons/ClipboardIcon';

interface DashboardProps {
  sessionResults: SessionResult[];
  analysis: AnalysisResult | null;
  onReset: () => void;
  userTask: string;
}

const emotionConfig = {
    'Satisfied': { icon: '😊', color: 'text-green-400', bg: 'bg-green-900/50' },
    'Curious': { icon: '🤔', color: 'text-sky-400', bg: 'bg-sky-900/50' },
    'Neutral': { icon: '😐', color: 'text-slate-400', bg: 'bg-slate-700/50' },
    'Confused': { icon: '😕', color: 'text-yellow-400', bg: 'bg-yellow-900/50' },
    'Frustrated': { icon: '😠', color: 'text-red-400', bg: 'bg-red-900/50' }
};

const severityConfig = {
    'High': 'bg-red-500',
    'Medium': 'bg-yellow-500',
    'Low': 'bg-sky-500'
};

const Dashboard: React.FC<DashboardProps> = ({ sessionResults, analysis, onReset, userTask }) => {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(sessionResults[0]?.persona.id || null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const completionRate = useMemo(() => {
    if (sessionResults.length === 0) return 0;
    const completedCount = sessionResults.filter(r => r.completed).length;
    return Math.round((completedCount / sessionResults.length) * 100);
  }, [sessionResults]);

  const selectedSession = useMemo(() => {
    return sessionResults.find(r => r.persona.id === selectedPersonaId);
  }, [selectedPersonaId, sessionResults]);
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        setCopiedText(text);
        setTimeout(() => setCopiedText(null), 2000); // Reset after 2 seconds
    });
  };

  const generateAIPrompt = (issue: string, recommendation: string) => {
    return `Redesign the UI to address the following feedback.\n\nUX Issue: "${issue}"\nRecommendation: "${recommendation}"\n\nProvide three actionable design alternatives with brief explanations.`;
  }

  if (!analysis) {
    return <div>Loading analysis...</div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-white">UX Test Results</h1>
        <button
          onClick={onReset}
          className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Start New Test
        </button>
      </div>

      <section className="mb-8 p-6 bg-slate-800 rounded-xl animate-slide-up shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-sky-400 flex items-center"><LightbulbIcon className="w-7 h-7 mr-3" /> AI Analysis Summary</h2>
        <p className="text-slate-300 leading-relaxed">{analysis.summary}</p>
        <div className="mt-6">
            <h3 className="text-lg font-bold mb-2">Overall Task Completion Rate</h3>
            <div className="w-full bg-slate-700 rounded-full h-6">
                <div 
                    className="bg-sky-500 h-6 rounded-full flex items-center justify-center text-sm font-bold text-white transition-all duration-500" 
                    style={{ width: `${completionRate}%` }}
                >
                    {completionRate}%
                </div>
            </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col gap-8">
            <section className="bg-slate-800 rounded-xl p-6 shadow-lg animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-xl font-semibold mb-4 text-sky-400">Identified UX Issues</h2>
                <ul className="space-y-4">
                    {analysis.issues.map((issue, index) => {
                        const aiPrompt = generateAIPrompt(issue.issue, issue.recommendation);
                        return (
                            <li key={index} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                                <div className="flex items-center mb-1">
                                    <span className={`px-2 py-0.5 text-xs font-semibold text-white rounded-full mr-2 ${severityConfig[issue.severity]}`}>{issue.severity}</span>
                                    <h3 className="font-bold text-slate-100">{issue.issue}</h3>
                                </div>
                                <p className="text-sm text-slate-400 mb-3"><strong>Recommendation:</strong> {issue.recommendation}</p>
                                
                                <div className="mt-3 pt-3 border-t border-slate-700">
                                    <h4 className="text-xs font-semibold text-sky-300 uppercase mb-2">Google AI Studio Prompt</h4>
                                    <div className="relative group">
                                        <pre className="text-xs text-slate-300 bg-slate-800 p-3 rounded-md font-mono whitespace-pre-wrap w-full">
                                            <code>{aiPrompt}</code>
                                        </pre>
                                        <button 
                                            onClick={() => handleCopy(aiPrompt)} 
                                            title="Copy AI Studio Prompt" 
                                            className="absolute top-2 right-2 p-1.5 bg-slate-700 rounded-md text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-600 hover:text-white"
                                        >
                                            {copiedText === aiPrompt ? <CheckCircleIcon className="w-5 h-5 text-green-400"/> : <ClipboardIcon className="w-5 h-5"/>}
                                        </button>
                                    </div>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </section>

            <section className="bg-slate-800 rounded-xl p-6 shadow-lg animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <h2 className="text-xl font-semibold mb-4 text-sky-400">Key Metrics</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-sky-300 uppercase bg-slate-700/50">
                            <tr>
                                <th scope="col" className="px-4 py-3">Persona</th>
                                <th scope="col" className="px-4 py-3">Completed</th>
                                <th scope="col" className="px-4 py-3">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessionResults.map((result) => (
                                <tr key={result.persona.id} onClick={() => setSelectedPersonaId(result.persona.id)} className={`border-b border-slate-700 hover:bg-slate-700/50 cursor-pointer transition-colors ${selectedPersonaId === result.persona.id ? 'bg-slate-700' : ''}`}>
                                    <th scope="row" className="px-4 py-4 font-medium text-white whitespace-nowrap">{result.persona.name}</th>
                                    <td className="px-4 py-4">
                                        {result.completed ? <CheckCircleIcon className="w-6 h-6 text-green-400" /> : <XCircleIcon className="w-6 h-6 text-red-400" />}
                                    </td>
                                    <td className="px-4 py-4">{result.timeTaken}s</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>

        <div className="lg:col-span-2 bg-slate-800 rounded-xl p-6 shadow-lg animate-slide-up" style={{ animationDelay: '0.3s' }}>
            {selectedSession ? (
                <>
                <h2 className="text-2xl font-semibold mb-4 text-sky-400">Session Replay: {selectedSession.persona.name}</h2>
                <div className="mb-6 p-4 bg-slate-900/50 rounded-lg">
                    <p className="flex items-center text-lg font-bold mb-2"><UserIcon className="w-5 h-5 mr-2" /> {selectedSession.persona.name} ({selectedSession.persona.skillLevel})</p>
                    <p className="text-sm text-slate-400 mb-2"><strong>Task:</strong> {userTask}</p>
                    <p className="text-sm text-slate-300 italic">"{selectedSession.persona.description}"</p>
                    <p className="text-sm text-slate-400 mt-2"><strong>Goal:</strong> {selectedSession.persona.goals.join(', ')}</p>
                </div>
                <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                    {selectedSession.steps.map((step, index) => {
                        const config = emotionConfig[step.emotion];
                        return (
                            <div key={index} className={`p-4 rounded-lg border-l-4 ${config.bg} border-slate-600`}>
                                <p className="font-mono text-sm text-slate-400 mb-2">Step {index + 1}</p>
                                <div className="pl-4 border-l-2 border-slate-600 mb-3">
                                    <p className="text-sm text-slate-300 italic">"{step.thought}"</p>
                                    <p className={`mt-1 text-sm font-medium flex items-center gap-2 ${config.color}`}>
                                        <span>{config.icon}</span>
                                        Emotion: {step.emotion}
                                    </p>
                                </div>
                                <pre className="bg-slate-900 text-sky-300 p-3 rounded-md overflow-x-auto text-sm font-mono">
                                    <code>{step.code}</code>
                                </pre>
                            </div>
                        )
                    })}
                </div>
                </>
            ) : (
                <div className="flex items-center justify-center h-full">
                    <p className="text-slate-400">Select a persona from the metrics table to view their session replay.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;