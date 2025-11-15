import React from 'react';
import { Persona } from '../types';
import UserIcon from './icons/UserIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';

interface InputFormProps {
    userTask: string;
    setUserTask: (task: string) => void;
    prototypeUrl: string;
    setPrototypeUrl: (url: string) => void;
    personas: Persona[];
    selectedPersonaIds: Set<string>;
    togglePersonaSelection: (id: string) => void;
    onStartSimulation: () => void;
    isSimulating: boolean;
    // Persona Generation (Demographics) Props
    personaGenGoals: string;
    setPersonaGenGoals: (value: string) => void;
    personaGenDemographics: string;
    setPersonaGenDemographics: (value: string) => void;
    personaGenSkillLevel: 'Novice' | 'Intermediate' | 'Expert';
    setPersonaGenSkillLevel: (value: 'Novice' | 'Intermediate' | 'Expert') => void;
    onGeneratePersonas: () => void;
    isGeneratingPersonas: boolean;
    // Persona Generation (Business Idea) Props
    businessIdea: string;
    setBusinessIdea: (value: string) => void;
    personaCount: number;
    setPersonaCount: (value: number) => void;
    onGeneratePersonasFromIdea: () => void;
}

const InputForm: React.FC<InputFormProps> = ({
    userTask,
    setUserTask,
    prototypeUrl,
    setPrototypeUrl,
    personas,
    selectedPersonaIds,
    togglePersonaSelection,
    onStartSimulation,
    isSimulating,
    personaGenGoals,
    setPersonaGenGoals,
    personaGenDemographics,
    setPersonaGenDemographics,
    personaGenSkillLevel,
    setPersonaGenSkillLevel,
    onGeneratePersonas,
    isGeneratingPersonas,
    businessIdea,
    setBusinessIdea,
    personaCount,
    setPersonaCount,
    onGeneratePersonasFromIdea,
}) => {
    
    const skillLevelConfig = {
        'Novice': 'bg-sky-500',
        'Intermediate': 'bg-indigo-500',
        'Expert': 'bg-purple-500',
    };

    const canStart = userTask.trim().length > 0 && prototypeUrl.trim().length > 0;
    const isBusy = isSimulating || isGeneratingPersonas;

    return (
        <div className="w-full max-w-4xl mx-auto p-8 bg-slate-800 rounded-xl shadow-2xl animate-fade-in space-y-8">
            <div>
                <h2 className="text-xl font-semibold mb-2 text-sky-300">
                    1. Provide a URL & define the task
                </h2>
                <p className="text-sm text-slate-400 mb-4">Enter the URL of your live prototype and provide a clear task for the AI persona to complete.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div>
                        <label htmlFor="prototype-url" className="block text-sm font-medium text-slate-300 mb-2">Prototype URL</label>
                        <input
                            type="url"
                            id="prototype-url"
                            className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-200 placeholder-slate-500"
                            placeholder="https://example.com"
                            value={prototypeUrl}
                            onChange={(e) => setPrototypeUrl(e.target.value)}
                            disabled={isBusy}
                        />
                    </div>
                    <div>
                        <label htmlFor="user-task" className="block text-sm font-medium text-slate-300 mb-2">User Task</label>
                        <textarea
                            id="user-task"
                            rows={3}
                            className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-200 placeholder-slate-500"
                            placeholder="e.g., 'Find the search bar and search for a product'"
                            value={userTask}
                            onChange={(e) => setUserTask(e.target.value)}
                            disabled={isBusy}
                        />
                    </div>
                </div>
            </div>
            
            {canStart && (
                <div className="animate-slide-up space-y-8">
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-sky-300">
                            2. Select Personas for Testing
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {personas.map(persona => (
                                <div
                                    key={persona.id}
                                    onClick={() => !isBusy && togglePersonaSelection(persona.id)}
                                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${isBusy ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} ${selectedPersonaIds.has(persona.id) ? 'bg-sky-900/50 border-sky-500' : 'bg-slate-700 border-slate-600 hover:border-slate-500'}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedPersonaIds.has(persona.id)}
                                            readOnly
                                            className={`mt-1 h-5 w-5 rounded border-gray-300 text-sky-600 focus:ring-sky-500 ${isBusy ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                        />
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <UserIcon className="w-5 h-5 text-sky-400" />
                                                <h3 className="font-bold text-lg text-white">{persona.name}</h3>
                                                <span className={`px-2 py-0.5 text-xs font-semibold text-white rounded-full ${skillLevelConfig[persona.skillLevel]}`}>{persona.skillLevel}</span>
                                            </div>
                                            <p className="text-sm text-slate-400 mt-1">{persona.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 bg-slate-700/50 rounded-xl border border-slate-600 space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-sky-300">Generate Custom Personas from Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="gen-demographics" className="block text-sm font-medium text-slate-300 mb-2">Demographics</label>
                                    <textarea id="gen-demographics" rows={2}
                                        className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-200 placeholder-slate-500"
                                        placeholder="e.g., 'Millennials in urban areas'"
                                        value={personaGenDemographics}
                                        onChange={(e) => setPersonaGenDemographics(e.target.value)}
                                        disabled={isBusy} />
                                </div>
                                <div>
                                    <label htmlFor="gen-goals" className="block text-sm font-medium text-slate-300 mb-2">User Goals</label>
                                    <textarea id="gen-goals" rows={2}
                                        className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-200 placeholder-slate-500"
                                        placeholder="e.g., 'Quickly find and book a service'"
                                        value={personaGenGoals}
                                        onChange={(e) => setPersonaGenGoals(e.target.value)}
                                        disabled={isBusy} />
                                </div>
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                                    <div>
                                        <label htmlFor="gen-skill" className="block text-sm font-medium text-slate-300 mb-2">Technical Skill Level</label>
                                        <select id="gen-skill"
                                            className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-200"
                                            value={personaGenSkillLevel}
                                            onChange={(e) => setPersonaGenSkillLevel(e.target.value as any)}
                                            disabled={isBusy}>
                                            <option>Novice</option>
                                            <option>Intermediate</option>
                                            <option>Expert</option>
                                        </select>
                                    </div>
                                    <button
                                        onClick={onGeneratePersonas}
                                        disabled={isBusy || !personaGenGoals || !personaGenDemographics}
                                        className="w-full px-6 py-3 text-md font-bold text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        {isGeneratingPersonas ? 'Generating...' : 'Generate from Details'}
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="border-t border-slate-600 pt-6">
                             <h3 className="text-lg font-semibold mb-4 text-sky-300">...or Generate from a Business Idea</h3>
                             <div className="space-y-4">
                                <label htmlFor="business-idea" className="block text-sm font-medium text-slate-300">Business/App Idea</label>
                                <textarea id="business-idea" rows={3}
                                    className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-200 placeholder-slate-500"
                                    placeholder="e.g., 'A mobile app that uses AI to create personalized travel itineraries.'"
                                    value={businessIdea}
                                    onChange={(e) => setBusinessIdea(e.target.value)}
                                    disabled={isBusy} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end mt-4">
                                <div>
                                    <label htmlFor="persona-count" className="block text-sm font-medium text-slate-300 mb-2">Number of Personas</label>
                                    <input type="number" id="persona-count"
                                        className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-200"
                                        value={personaCount}
                                        onChange={(e) => setPersonaCount(parseInt(e.target.value, 10))}
                                        min="1" max="10"
                                        disabled={isBusy} />
                                </div>
                                 <button
                                    onClick={onGeneratePersonasFromIdea}
                                    disabled={isBusy || !businessIdea || personaCount <= 0}
                                    className="w-full px-6 py-3 text-md font-bold text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    {isGeneratingPersonas ? 'Generating...' : 'Generate from Idea'}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-center pt-4">
                        <button
                            onClick={onStartSimulation}
                            disabled={selectedPersonaIds.size === 0 || isBusy}
                            className="px-10 py-4 text-xl font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-transform transform hover:scale-105 duration-200"
                        >
                            {isSimulating ? 'Simulating...' : `Start Test with ${selectedPersonaIds.size} Persona(s)`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InputForm;