import React from 'react';
import { Persona, TestMode } from '../types';
import UserIcon from './icons/UserIcon';
// FIX: Import CheckCircleIcon component to resolve reference error.
import CheckCircleIcon from './icons/CheckCircleIcon';

interface InputFormProps {
    testMode: TestMode;
    setTestMode: (mode: TestMode) => void;
    userTask: string;
    setUserTask: (task: string) => void;
    businessTask: string;
    setBusinessTask: (task: string) => void;
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

const businessTasks = ['Simulate Purchase', 'Test Subscription Funnel'];

const InputForm: React.FC<InputFormProps> = ({
    testMode,
    setTestMode,
    userTask,
    setUserTask,
    businessTask,
    setBusinessTask,
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
        'Novice': 'bg-sky-100 text-sky-800',
        'Intermediate': 'bg-violet-100 text-violet-800',
        'Expert': 'bg-teal-100 text-teal-800',
    };

    const isTaskDefined = testMode === 'UX_TESTING' ? userTask.trim().length > 0 : businessTask.trim().length > 0;
    const canStart = isTaskDefined && prototypeUrl.trim().length > 0;
    const isBusy = isSimulating || isGeneratingPersonas;

    const ModeButton: React.FC<{ mode: TestMode, label: string }> = ({ mode, label }) => (
        <button
            onClick={() => setTestMode(mode)}
            className={`w-full text-center px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 focus:ring-violet-500 ${
                testMode === mode
                ? 'bg-violet-600 text-white shadow-md'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
        >
            {label}
        </button>
    );
    
    const FormCard: React.FC<{title:string, children: React.ReactNode, step: number}> = ({title, children, step}) => (
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4 text-violet-600">
            <span className="text-slate-400 font-mono mr-2">{step}.</span>{title}
        </h2>
        {children}
      </div>
    );

    return (
        <div className="w-full animate-fade-in space-y-8">
            <div className="space-y-6">
                <FormCard step={1} title="Configure Simulation">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Test Mode</label>
                            <div className="grid grid-cols-2 gap-4 p-1 bg-slate-100 rounded-lg">
                               <ModeButton mode="UX_TESTING" label="UX Testing" />
                               <ModeButton mode="BUSINESS_VALIDATION" label="Business Validation" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                           <div>
                                <label htmlFor="prototype-url" className="block text-sm font-medium text-slate-700 mb-2">Prototype URL</label>
                                <input
                                    type="url"
                                    id="prototype-url"
                                    className="w-full p-3 bg-slate-100 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-slate-900 placeholder-slate-400"
                                    placeholder="https://your-prototype-url.com"
                                    value={prototypeUrl}
                                    onChange={(e) => setPrototypeUrl(e.target.value)}
                                    disabled={isBusy}
                                />
                            </div>
                            <div>
                                <label htmlFor="user-task" className="block text-sm font-medium text-slate-700 mb-2">
                                    {testMode === 'UX_TESTING' ? 'User Task' : 'Business Goal'}
                                </label>
                                {testMode === 'UX_TESTING' ? (
                                    <textarea
                                        id="user-task"
                                        rows={1}
                                        className="w-full p-3 bg-slate-100 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-slate-900 placeholder-slate-400"
                                        placeholder="e.g., 'Find and purchase a specific product'"
                                        value={userTask}
                                        onChange={(e) => setUserTask(e.target.value)}
                                        disabled={isBusy}
                                    />
                                ) : (
                                    <select 
                                        id="business-task"
                                        className="w-full p-3 bg-slate-100 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-slate-900"
                                        value={businessTask}
                                        onChange={e => setBusinessTask(e.target.value)}
                                        disabled={isBusy}
                                    >
                                        <option value="">Select a funnel...</option>
                                        {businessTasks.map(task => <option key={task} value={task}>{task}</option>)}
                                    </select>
                                )}
                            </div>
                        </div>
                    </div>
                </FormCard>
            </div>
            
            {canStart && (
                <div className="animate-slide-up space-y-8">
                    <FormCard step={2} title="Select & Generate Personas">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            {personas.map(persona => (
                                <div
                                    key={persona.id}
                                    onClick={() => !isBusy && togglePersonaSelection(persona.id)}
                                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${isBusy ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${selectedPersonaIds.has(persona.id) ? 'bg-violet-50 border-violet-500' : 'bg-white border-slate-300 hover:border-slate-400'}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-1.5 flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center border-2 ${selectedPersonaIds.has(persona.id) ? 'bg-violet-500 border-violet-500' : 'border-slate-400'}`}>
                                           {selectedPersonaIds.has(persona.id) && <CheckCircleIcon className="w-4 h-4 text-white"/>}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-bold text-lg text-slate-800">{persona.name}</h3>
                                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${skillLevelConfig[persona.skillLevel]}`}>{persona.skillLevel}</span>
                                            </div>
                                            <p className="text-sm text-slate-500 mt-1">{persona.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-violet-600">Generate Custom Personas</h3>
                                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200/80 space-y-6">
                                    <div>
                                        <h4 className="font-semibold text-slate-700 mb-4">Option A: Generate from Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <textarea id="gen-demographics" rows={2}
                                                className="md:col-span-2 w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                                placeholder="User Demographics (e.g., 'Millennials in urban areas')"
                                                value={personaGenDemographics}
                                                onChange={(e) => setPersonaGenDemographics(e.target.value)}
                                                disabled={isBusy} />
                                            <textarea id="gen-goals" rows={2}
                                                className="md:col-span-2 w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                                placeholder="User Goals (e.g., 'Quickly find and book a service')"
                                                value={personaGenGoals}
                                                onChange={(e) => setPersonaGenGoals(e.target.value)}
                                                disabled={isBusy} />
                                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                                                <select id="gen-skill"
                                                    className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                                    value={personaGenSkillLevel}
                                                    onChange={(e) => setPersonaGenSkillLevel(e.target.value as any)}
                                                    disabled={isBusy}>
                                                    <option>Novice</option>
                                                    <option>Intermediate</option>
                                                    <option>Expert</option>
                                                </select>
                                                <button onClick={onGeneratePersonas} disabled={isBusy || !personaGenGoals || !personaGenDemographics}
                                                    className="w-full px-6 py-3 font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors">
                                                    {isGeneratingPersonas ? 'Generating...' : 'Generate Personas'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border-t border-slate-200 pt-6">
                                         <h4 className="font-semibold text-slate-700 mb-4">Option B: Generate from a Business Idea</h4>
                                         <textarea id="business-idea" rows={3}
                                            className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                            placeholder="Business/App Idea (e.g., 'A mobile app that uses AI to create personalized travel itineraries.')"
                                            value={businessIdea}
                                            onChange={(e) => setBusinessIdea(e.target.value)}
                                            disabled={isBusy} />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end mt-4">
                                            <input type="number" id="persona-count"
                                                className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                                value={personaCount}
                                                onChange={(e) => setPersonaCount(parseInt(e.target.value, 10))}
                                                min="1" max="10"
                                                disabled={isBusy} />
                                             <button onClick={onGeneratePersonasFromIdea} disabled={isBusy || !businessIdea || personaCount <= 0}
                                                className="w-full px-6 py-3 font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors">
                                                {isGeneratingPersonas ? 'Generating...' : 'Generate from Idea'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FormCard>
                    
                    <div className="text-center pt-4">
                        <button
                            onClick={onStartSimulation}
                            disabled={selectedPersonaIds.size === 0 || isBusy}
                            className="px-10 py-4 text-xl font-bold text-white bg-gradient-to-r from-teal-500 to-violet-600 rounded-lg hover:from-teal-600 hover:to-violet-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all transform hover:scale-105 duration-300 ease-in-out shadow-lg disabled:shadow-none"
                        >
                            {isSimulating ? 'Running Simulation...' : `Start Simulation with ${selectedPersonaIds.size} Persona(s)`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InputForm;