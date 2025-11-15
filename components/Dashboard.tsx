import React, { useState, useMemo, useEffect } from 'react';
import { HistoryEntry, AnalysisIssue, SimulationVersion } from '../types';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';
import LightbulbIcon from './icons/LightbulbIcon';
import UserIcon from './icons/UserIcon';
import ClipboardIcon from './icons/ClipboardIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import CircularArrowIcon from './icons/CircularArrowIcon';
import ZapIcon from './icons/ZapIcon';
import DownloadIcon from './icons/DownloadIcon';

interface DashboardProps {
  historyEntry: HistoryEntry;
  onGoHome: () => void;
  onRerun: (id: string) => void;
  isRerunning: boolean;
}

const emotionConfig = {
    'Satisfied': { icon: '😊', color: 'text-green-700 dark:text-green-300', bg: 'bg-green-50 dark:bg-green-950/50' },
    'Curious': { icon: '🤔', color: 'text-sky-700 dark:text-sky-300', bg: 'bg-sky-50 dark:bg-sky-950/50' },
    'Neutral': { icon: '😐', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800/50' },
    'Confused': { icon: '😕', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/50' },
    'Frustrated': { icon: '😠', color: 'text-red-700 dark:text-red-300', bg: 'bg-red-50 dark:bg-red-950/50' }
};

const severityConfig = {
    'High':   { bar: 'bg-red-500',         tagBg: 'bg-red-100 dark:bg-red-900/50',      tagText: 'text-red-800 dark:text-red-200'   },
    'Medium': { bar: 'bg-amber-400',       tagBg: 'bg-amber-100 dark:bg-amber-900/50',  tagText: 'text-amber-800 dark:text-amber-200' },
    'Low':    { bar: 'bg-blue-400',        tagBg: 'bg-blue-100 dark:bg-blue-900/50',   tagText: 'text-blue-800 dark:text-blue-200'    },
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

    const config = severityConfig[issue.severity];

    return (
        <div className="relative bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${config.bar}`}></div>
            <div className="p-4 pl-6">
                <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex-1">{issue.issue}</h3>
                    <span className={`flex-shrink-0 mt-0.5 px-2.5 py-0.5 text-xs font-semibold rounded-full ${config.tagBg} ${config.tagText}`}>
                        {issue.severity}
                    </span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4"><strong>Recommendation:</strong> {issue.recommendation}</p>
                
                <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-700/80">
                    <h4 className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-2">Google AI Studio Prompt</h4>
                    <div className="relative group">
                        <pre className="text-xs text-slate-300 bg-slate-900 dark:bg-slate-950 p-3 rounded-lg font-mono whitespace-pre-wrap w-full overflow-x-auto">
                            <code>{aiPrompt}</code>
                        </pre>
                        <button 
                            onClick={handleCopy} 
                            title="Copy AI Studio Prompt" 
                            className="absolute top-2 right-2 p-1.5 bg-slate-800 dark:bg-slate-800 rounded-md text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-700 dark:hover:bg-slate-700 hover:text-white"
                        >
                            {copied ? <CheckCircleIcon className="w-5 h-5 text-green-400"/> : <ClipboardIcon className="w-5 h-5"/>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ historyEntry, onGoHome, onRerun, isRerunning }) => {
  const [activeVersionIndex, setActiveVersionIndex] = useState(historyEntry.versions.length - 1);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(historyEntry.versions[activeVersionIndex]?.sessionResults[0]?.persona.id || null);
  const [isTldrMode, setIsTldrMode] = useState(false);
  
  const activeVersion = historyEntry.versions[activeVersionIndex];
  
  // Effect to reset selected persona when version changes
  useEffect(() => {
    setActiveVersionIndex(historyEntry.versions.length - 1);
  }, [historyEntry]);

  useEffect(() => {
    setSelectedPersonaId(historyEntry.versions[activeVersionIndex]?.sessionResults[0]?.persona.id || null);
  }, [activeVersionIndex, historyEntry.versions]);

  const selectedSession = useMemo(() => {
    if (!activeVersion) return null;
    return activeVersion.sessionResults.find(r => r.persona.id === selectedPersonaId);
  }, [selectedPersonaId, activeVersion]);

  const severityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };

  const sortedIssues = useMemo(() => {
      if (!activeVersion?.analysis?.issues) return [];
      return [...activeVersion.analysis.issues].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  }, [activeVersion]);

  const handleDownloadPlan = () => {
    const blob = new Blob([historyEntry.fullTask], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-plan-${historyEntry.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!activeVersion || !activeVersion.analysis) {
    return <div className="text-center p-8">Loading analysis... The AI is hard at work!</div>;
  }
  
  const { analysis, sessionResults } = activeVersion;
  const isLazyMode = historyEntry.tags.testType === 'Lazy Mode';

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-0 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
            <button
                onClick={onGoHome}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded-full transition-colors duration-200"
                aria-label="Back to Home"
            >
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">{historyEntry.title}</h1>
        </div>
         <div className="flex items-center gap-2">
             <button
                onClick={() => setIsTldrMode(!isTldrMode)}
                className="inline-flex items-center gap-2 px-4 py-2 font-semibold text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-900 transition-colors"
                >
                <ZapIcon className="w-5 h-5" />
                {isTldrMode ? 'Detailed View' : 'TLDR Mode'}
            </button>
            <button
                onClick={() => onRerun(historyEntry.id)}
                disabled={isRerunning}
                className="inline-flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 transition-colors"
            >
                <CircularArrowIcon className={`w-5 h-5 ${isRerunning ? 'animate-spin' : ''}`} />
                {isRerunning ? 'Rerunning...' : 'Rerun Simulation'}
            </button>
        </div>
      </div>

      {historyEntry.versions.length > 1 && (
        <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                {historyEntry.versions.map((version, index) => (
                    <button
                        key={version.version}
                        onClick={() => setActiveVersionIndex(index)}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeVersionIndex === index
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-600'
                        }`}
                    >
                        Version {version.version}
                    </button>
                ))}
            </nav>
        </div>
      )}
      
        {isTldrMode ? (
            <div className="flex flex-col gap-8 animate-fade-in">
                <section className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-6 shadow-soft">
                    <h2 className="font-serif text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">Key Metrics</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-700 dark:text-slate-300">
                            <thead className="text-xs text-blue-800 dark:text-blue-300 uppercase bg-blue-100/60 dark:bg-blue-950/50">
                                <tr>
                                    <th scope="col" className="px-4 py-3 rounded-l-xl">Persona</th>
                                    <th scope="col" className="px-4 py-3 text-center">Completed</th>
                                    <th scope="col" className="px-4 py-3 text-right rounded-r-xl">Time Taken</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessionResults.map((result) => (
                                    <tr key={result.persona.id} className="border-b border-slate-200 dark:border-slate-700">
                                        <td scope="row" className="px-4 py-4 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">{result.persona.name}</td>
                                        <td className="px-4 py-4 flex justify-center">
                                            {result.completed ? <CheckCircleIcon className="w-6 h-6 text-blue-500" /> : <XCircleIcon className="w-6 h-6 text-red-500" />}
                                        </td>
                                        <td className="px-4 py-4 text-right font-medium">{result.timeTaken}s</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-6 shadow-soft">
                    <h2 className="font-serif text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">User Task</h2>
                    <pre className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">{historyEntry.fullTask}</pre>
                </section>

                <section className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-6 shadow-soft">
                    <h2 className="font-serif text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">UX Issues Summary</h2>
                    <div className="space-y-4">
                    {sortedIssues.length > 0 ? (
                        sortedIssues.map((issue, index) => {
                        const config = severityConfig[issue.severity];
                        const truncatedIssue = issue.issue.length > 100 ? `${issue.issue.substring(0, 100)}...` : issue.issue;
                        const truncatedRecommendation = issue.recommendation.length > 100 ? `${issue.recommendation.substring(0, 100)}...` : issue.recommendation;
                        return (
                            <div key={index} className="relative bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${config.bar}`}></div>
                                <div className="p-4 pl-6">
                                    <div className="flex justify-between items-start gap-4 mb-2">
                                        <p className="font-semibold text-slate-800 dark:text-slate-100 flex-1">
                                            <span className="font-bold">Issue:</span> {truncatedIssue}
                                        </p>
                                        <span className={`flex-shrink-0 mt-0.5 px-2.5 py-0.5 text-xs font-semibold rounded-full ${config.tagBg} ${config.tagText}`}>
                                            {issue.severity}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                    <span className="font-bold">Fix:</span> {truncatedRecommendation}
                                    </p>
                                </div>
                            </div>
                        )
                        })
                    ) : (
                        <div className="text-center py-8 px-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                        <p className="text-slate-500 dark:text-slate-400">No UX issues were identified in this simulation.</p>
                        </div>
                    )}
                    </div>
                </section>
            </div>
        ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                {/* Left Column */}
                <div className="flex flex-col gap-8">
                     {isLazyMode && (
                        <section className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-6 shadow-soft animate-slide-up">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-serif text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center"><LightbulbIcon className="w-6 h-6 mr-3" /> AI-Generated Test Plan</h2>
                                <button
                                    onClick={handleDownloadPlan}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-900 transition-colors"
                                >
                                    <DownloadIcon className="w-4 h-4" />
                                    Download Plan
                                </button>
                            </div>
                             <pre className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">{historyEntry.fullTask}</pre>
                        </section>
                    )}
                    <section className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-6 shadow-soft animate-slide-up">
                        <h2 className="font-serif text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400 flex items-center"><LightbulbIcon className="w-6 h-6 mr-3" /> AI Analysis Summary</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{analysis.summary}</p>
                    </section>
                    
                    <section className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-6 shadow-soft animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <h2 className="font-serif text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">Identified UX Issues</h2>
                        <div className="space-y-4">
                            {sortedIssues.length > 0 ? (
                                sortedIssues.map((issue, index) => <AIPromptCard key={index} issue={issue} />)
                            ) : (
                                <div className="text-center py-8 px-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                                    <p className="text-slate-500 dark:text-slate-400">No UX issues were identified in this simulation.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
                
                {/* Right Column */}
                <div className="flex flex-col gap-8">
                    <section className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-6 shadow-soft animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <h2 className="font-serif text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">Key Metrics</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-700 dark:text-slate-300">
                                <thead className="text-xs text-blue-800 dark:text-blue-300 uppercase bg-blue-100/60 dark:bg-blue-950/50">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 rounded-l-xl">Persona</th>
                                        <th scope="col" className="px-4 py-3 text-center">Completed</th>
                                        <th scope="col" className="px-4 py-3 text-right rounded-r-xl">Time Taken</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessionResults.map((result) => (
                                        <tr key={result.persona.id} onClick={() => setSelectedPersonaId(result.persona.id)} className={`border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors ${selectedPersonaId === result.persona.id ? 'bg-blue-50 dark:bg-blue-950/50' : ''}`}>
                                            <td scope="row" className="px-4 py-4 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">{result.persona.name}</td>
                                            <td className="px-4 py-4 flex justify-center">
                                                {result.completed ? <CheckCircleIcon className="w-6 h-6 text-blue-500" /> : <XCircleIcon className="w-6 h-6 text-red-500" />}
                                            </td>
                                            <td className="px-4 py-4 text-right font-medium">{result.timeTaken}s</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-6 shadow-soft animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        {selectedSession ? (
                            <>
                            <h2 className="font-serif text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">Session Replay: {selectedSession.persona.name}</h2>
                            <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700/80">
                                <p className="flex items-center text-lg font-bold mb-2 text-slate-900 dark:text-slate-100"><UserIcon className="w-5 h-5 mr-2" /> {selectedSession.persona.name} ({selectedSession.persona.skillLevel})</p>
                                {historyEntry.tags.testType !== 'Lazy Mode' && (
                                    <div className="text-sm text-slate-700 dark:text-slate-300 mb-2"><strong>Task:</strong> <pre className="whitespace-pre-wrap font-sans">{historyEntry.fullTask}</pre></div>
                                )}
                                <p className="text-sm text-slate-500 dark:text-slate-400 italic">"{selectedSession.persona.description}"</p>
                            </div>
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 -mr-2">
                                {selectedSession.steps.map((step, index) => {
                                    const config = emotionConfig[step.emotion];
                                    const isCritical = step.thought.startsWith("UX Friction: Critical:");
                                    return (
                                        <div key={index} className={`p-4 rounded-xl border-l-4 ${isCritical ? 'border-red-400 bg-red-50 dark:bg-red-950/50' : `border-slate-300 dark:border-slate-600 ${config.bg}`}`}>
                                            <p className="font-mono text-xs text-slate-500 dark:text-slate-400 mb-2">STEP {index + 1}</p>
                                            <div className="pl-4 border-l-2 border-slate-300/80 dark:border-slate-600/80 mb-3">
                                                <p className={`text-sm italic ${isCritical ? 'text-red-700 dark:text-red-300 font-semibold' : 'text-slate-800 dark:text-slate-200'}`}>"{step.thought}"</p>
                                                <p className={`mt-1 text-sm font-medium flex items-center gap-2 ${config.color}`}>
                                                    <span>{config.icon}</span>
                                                    {step.emotion}
                                                </p>
                                            </div>
                                            <pre className="bg-slate-900 text-emerald-300 dark:bg-slate-950 dark:text-emerald-400 p-3 rounded-lg overflow-x-auto text-sm font-mono">
                                                <code>{step.code}</code>
                                            </pre>
                                        </div>
                                    )
                                })}
                            </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full min-h-[200px]">
                                <p className="text-slate-500 dark:text-slate-400">Select a persona to view their session replay.</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        )}
    </div>
  );
};

export default Dashboard;