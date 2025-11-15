import React, { useState, useMemo } from 'react';
import { SessionResult, AnalysisResult, AnalysisIssue } from '../types';
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
    'Satisfied': { icon: '😊', color: 'text-green-700', bg: 'bg-green-100' },
    'Curious': { icon: '🤔', color: 'text-sky-700', bg: 'bg-sky-100' },
    'Neutral': { icon: '😐', color: 'text-slate-600', bg: 'bg-slate-100' },
    'Confused': { icon: '😕', color: 'text-amber-700', bg: 'bg-amber-100' },
    'Frustrated': { icon: '😠', color: 'text-red-700', bg: 'bg-red-100' }
};

const severityConfig = {
    'High': 'bg-red-500',
    'Medium': 'bg-amber-500',
    'Low': 'bg-sky-500'
};

const AIPromptCard: React.FC<{ issue: AnalysisIssue }> = ({ issue }) => {
    const [copied, setCopied] = useState(false);
    const aiPrompt = `Redesign the UI to address the following feedback.\n\nUX Issue: "${issue.issue}"\nRecommendation: "${issue.recommendation}"\n\nProvide three actionable design alternatives with brief explanations.`;

    const handleCopy = () => {
        navigator.clipboard.writeText(aiPrompt).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center mb-1">
                <span className={`w-3 h-3 rounded-full mr-2 ${severityConfig[issue.severity]}`}></span>
                <h3 className="font-semibold text-slate-800">{issue.issue}</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4 pl-5"><strong>Recommendation:</strong> {issue.recommendation}</p>
            
            <div className="mt-4 pt-4 border-t border-slate-200/80">
                <h4 className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-2">Google AI Studio Prompt</h4>
                <div className="relative group">
                    <pre className="text-xs text-slate-300 bg-slate-800 p-3 rounded-md font-mono whitespace-pre-wrap w-full overflow-x-auto">
                        <code>{aiPrompt}</code>
                    </pre>
                    <button 
                        onClick={handleCopy} 
                        title="Copy AI Studio Prompt" 
                        className="absolute top-2 right-2 p-1.5 bg-slate-700 rounded-md text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-600 hover:text-white"
                    >
                        {copied ? <CheckCircleIcon className="w-5 h-5 text-green-400"/> : <ClipboardIcon className="w-5 h-5"/>}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ sessionResults, analysis, onReset, userTask }) => {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(sessionResults[0]?.persona.id || null);

  const selectedSession = useMemo(() => {
    return sessionResults.find(r => r.persona.id === selectedPersonaId);
  }, [selectedPersonaId, sessionResults]);

  if (!analysis) {
    return <div>Loading analysis...</div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-0 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Simulation Report</h1>
        <button
          onClick={onReset}
          className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-2 px-5 rounded-lg transition-colors duration-200"
        >
          Run New Simulation
        </button>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        {/* Left Column */}
        <div className="flex flex-col gap-8">
            <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-slide-up">
                <h2 className="text-xl font-bold mb-4 text-violet-600 flex items-center"><LightbulbIcon className="w-6 h-6 mr-3" /> AI Analysis Summary</h2>
                <p className="text-slate-600 leading-relaxed">{analysis.summary}</p>
            </section>
            
            <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-xl font-bold mb-4 text-violet-600">Identified UX Issues</h2>
                <div className="space-y-4">
                    {analysis.issues.map((issue, index) => <AIPromptCard key={index} issue={issue} />)}
                </div>
            </section>
        </div>
        
        {/* Right Column */}
        <div className="flex flex-col gap-8">
            <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <h2 className="text-xl font-bold mb-4 text-violet-600">Key Metrics</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-violet-600 uppercase bg-violet-50">
                            <tr>
                                <th scope="col" className="px-4 py-3 rounded-l-lg">Persona</th>
                                <th scope="col" className="px-4 py-3 text-center">Completed</th>
                                <th scope="col" className="px-4 py-3 text-right rounded-r-lg">Time Taken</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessionResults.map((result) => (
                                <tr key={result.persona.id} onClick={() => setSelectedPersonaId(result.persona.id)} className={`border-b border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors ${selectedPersonaId === result.persona.id ? 'bg-violet-50' : ''}`}>
                                    <td scope="row" className="px-4 py-4 font-medium text-slate-900 whitespace-nowrap">{result.persona.name}</td>
                                    <td className="px-4 py-4 flex justify-center">
                                        {result.completed ? <CheckCircleIcon className="w-6 h-6 text-teal-500" /> : <XCircleIcon className="w-6 h-6 text-red-500" />}
                                    </td>
                                    <td className="px-4 py-4 text-right font-medium">{result.timeTaken}s</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-slide-up" style={{ animationDelay: '0.3s' }}>
                {selectedSession ? (
                    <>
                    <h2 className="text-xl font-bold mb-4 text-violet-600">Session Replay: {selectedSession.persona.name}</h2>
                    <div className="mb-6 p-4 bg-slate-100 rounded-lg border border-slate-200">
                        <p className="flex items-center text-lg font-bold mb-2 text-slate-900"><UserIcon className="w-5 h-5 mr-2" /> {selectedSession.persona.name} ({selectedSession.persona.skillLevel})</p>
                        <p className="text-sm text-slate-600 mb-2"><strong>Task:</strong> {userTask}</p>
                        <p className="text-sm text-slate-500 italic">"{selectedSession.persona.description}"</p>
                    </div>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 -mr-2">
                        {selectedSession.steps.map((step, index) => {
                            const config = emotionConfig[step.emotion];
                            const isCritical = step.thought.startsWith("UX Friction: Critical:");
                            return (
                                <div key={index} className={`p-4 rounded-lg border-l-4 ${isCritical ? 'border-red-400 bg-red-50' : `border-slate-300 ${config.bg}`}`}>
                                    <p className="font-mono text-xs text-slate-500 mb-2">STEP {index + 1}</p>
                                    <div className="pl-4 border-l-2 border-slate-300/80 mb-3">
                                        <p className={`text-sm italic ${isCritical ? 'text-red-700 font-semibold' : 'text-slate-700'}`}>"{step.thought}"</p>
                                        <p className={`mt-1 text-sm font-medium flex items-center gap-2 ${config.color}`}>
                                            <span>{config.icon}</span>
                                            {step.emotion}
                                        </p>
                                    </div>
                                    <pre className="bg-slate-800 text-teal-300 p-3 rounded-md overflow-x-auto text-sm font-mono">
                                        <code>{step.code}</code>
                                    </pre>
                                </div>
                            )
                        })}
                    </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full min-h-[200px]">
                        <p className="text-slate-500">Select a persona to view their session replay.</p>
                    </div>
                )}
            </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;