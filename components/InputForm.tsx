import React, { useState } from 'react';
import { Persona, TestMode } from '../types';
import UserIcon from './icons/UserIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import ArrowUpIcon from './icons/ArrowUpIcon';
import ArrowDownIcon from './icons/ArrowDownIcon';
import LightbulbIcon from './icons/LightbulbIcon';

interface InputFormProps {
    testMode: TestMode;
    setTestMode: (mode: TestMode) => void;
    userTask: string;
    setUserTask: (task: string) => void;
    journeySteps: string[];
    setJourneySteps: (steps: string[]) => void;
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
    // Journey Suggestions
    onSuggestJourneySteps: () => Promise<string[]>;
    // Lazy Mode
    reviewPlan: boolean;
    setReviewPlan: (value: boolean) => void;
}

const FormCard: React.FC<{title:string, children: React.ReactNode, step: number}> = ({title, children, step}) => (
  <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl shadow-soft p-6">
    <h2 className="font-serif text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">
        <span className="text-slate-400 dark:text-slate-500 font-sans font-normal mr-2">{step}.</span>{title}
    </h2>
    {children}
  </div>
);

interface ModeButtonProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const ModeButton: React.FC<ModeButtonProps> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full text-center px-4 py-2.5 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-blue-500 ${
            isActive
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
        }`}
    >
        {label}
    </button>
);

const JourneyBuilder: React.FC<{
    steps: string[];
    setSteps: (steps: string[]) => void;
    onSuggest: () => Promise<string[]>;
    isBusy: boolean;
}> = ({ steps, setSteps, onSuggest, isBusy }) => {
    const [newStep, setNewStep] = useState('');
    const [suggestedSteps, setSuggestedSteps] = useState<string[]>([]);
    const [isSuggesting, setIsSuggesting] = useState(false);

    const handleAddStep = () => {
        if (newStep.trim()) {
            setSteps([...steps, newStep.trim()]);
            setNewStep('');
        }
    };
    
    const handleRemoveStep = (index: number) => {
        setSteps(steps.filter((_, i) => i !== index));
    };

    const handleMoveStep = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === steps.length - 1) return;
        
        const newSteps = [...steps];
        const item = newSteps.splice(index, 1)[0];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        newSteps.splice(newIndex, 0, item);
        setSteps(newSteps);
    };

    const handleSuggest = async () => {
        setIsSuggesting(true);
        const suggestions = await onSuggest();
        setSuggestedSteps(suggestions);
        setIsSuggesting(false);
    };

    const addSuggestionToJourney = (suggestion: string) => {
        setSteps([...steps, suggestion]);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left side: Builder */}
            <div>
                <label htmlFor="journey-step-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Add a new step to the journey...</label>
                <div className="flex gap-2">
                    <input
                        id="journey-step-input"
                        type="text"
                        value={newStep}
                        onChange={(e) => setNewStep(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddStep()}
                        className="flex-grow p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Log into the account"
                        disabled={isBusy}
                    />
                    <button onClick={handleAddStep} disabled={isBusy || !newStep.trim()} className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600">Add Step</button>
                </div>
                
                <div className="mt-4 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[150px]">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Journey Steps</h3>
                    {steps.length === 0 ? (
                        <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">Add steps to build your user journey.</p>
                    ) : (
                        <ol className="list-decimal list-inside space-y-2">
                            {steps.map((step, index) => (
                                <li key={index} className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 group">
                                    <span className="flex-grow text-slate-800 dark:text-slate-200">{step}</span>
                                    <button onClick={() => handleMoveStep(index, 'up')} disabled={index === 0} className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30"><ArrowUpIcon className="w-4 h-4" /></button>
                                    <button onClick={() => handleMoveStep(index, 'down')} disabled={index === steps.length - 1} className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30"><ArrowDownIcon className="w-4 h-4" /></button>
                                    <button onClick={() => handleRemoveStep(index)} className="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            </div>
            {/* Right side: Suggestions */}
            <div>
                <button onClick={handleSuggest} disabled={isSuggesting || isBusy} className="w-full mb-2 inline-flex items-center justify-center gap-2 px-4 py-2 font-semibold text-blue-700 bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 transition-colors">
                    <LightbulbIcon className="w-5 h-5" />
                    {isSuggesting ? 'Thinking...' : 'Suggest Common Steps'}
                </button>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[220px]">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Suggested Steps</h3>
                     {isSuggesting ? (
                        <div className="flex items-center justify-center h-full text-sm text-slate-500 dark:text-slate-400">Loading suggestions...</div>
                    ) : suggestedSteps.length === 0 ? (
                        <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">Click "Suggest" to get AI-powered ideas based on your URL.</p>
                    ) : (
                        <ul className="space-y-2">
                            {suggestedSteps.map((step, index) => (
                                <li key={index} className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 group">
                                    <span className="flex-grow text-slate-700 dark:text-slate-300 text-sm">{step}</span>
                                    <button onClick={() => addSuggestionToJourney(step)} title="Add to journey" className="p-1 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400">
                                        <PlusIcon className="w-5 h-5" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};


const InputForm: React.FC<InputFormProps> = ({
    testMode, setTestMode, userTask, setUserTask, journeySteps, setJourneySteps, prototypeUrl, setPrototypeUrl,
    personas, selectedPersonaIds, togglePersonaSelection, onStartSimulation, isSimulating,
    personaGenGoals, setPersonaGenGoals, personaGenDemographics, setPersonaGenDemographics, personaGenSkillLevel, setPersonaGenSkillLevel, onGeneratePersonas, isGeneratingPersonas,
    businessIdea, setBusinessIdea, personaCount, setPersonaCount, onGeneratePersonasFromIdea, onSuggestJourneySteps,
    reviewPlan, setReviewPlan
}) => {
    
    const skillLevelConfig = {
        'Novice': 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
        'Intermediate': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
        'Expert': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    };
    
    const isTaskDefined = (testMode === 'SINGLE_TASK' && userTask.trim().length > 0) 
        || (testMode === 'USER_JOURNEY' && journeySteps.length > 0)
        || (testMode === 'LAZY');
    
    const canStart = isTaskDefined && prototypeUrl.trim().length > 0;
    const isBusy = isSimulating || isGeneratingPersonas;

    return (
        <div className="w-full animate-fade-in space-y-8">
            <FormCard step={1} title="Configure Simulation">
                <div className="space-y-6">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Test Type</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-900/50 rounded-xl">
                               <ModeButton label="Specific Task" isActive={testMode === 'SINGLE_TASK'} onClick={() => setTestMode('SINGLE_TASK')} />
                               <ModeButton label="User Journey" isActive={testMode === 'USER_JOURNEY'} onClick={() => setTestMode('USER_JOURNEY')} />
                               <ModeButton label="Lazy Mode" isActive={testMode === 'LAZY'} onClick={() => setTestMode('LAZY')} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="prototype-url" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Prototype URL</label>
                            <input
                                type="url"
                                id="prototype-url"
                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                                placeholder="https://your-prototype-url.com"
                                value={prototypeUrl}
                                onChange={(e) => setPrototypeUrl(e.target.value)}
                                disabled={isBusy}
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-200/80 dark:border-slate-700/80">
                         {testMode === 'SINGLE_TASK' && (
                            <div>
                                <label htmlFor="user-task" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Task Goal</label>
                                <textarea
                                    id="user-task"
                                    rows={2}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                                    placeholder="e.g., 'Find and purchase a specific product'"
                                    value={userTask}
                                    onChange={(e) => setUserTask(e.target.value)}
                                    disabled={isBusy}
                                />
                            </div>
                        )}
                        {testMode === 'USER_JOURNEY' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Journey Builder</label>
                                <JourneyBuilder steps={journeySteps} setSteps={setJourneySteps} onSuggest={onSuggestJourneySteps} isBusy={isBusy} />
                            </div>
                        )}
                        {testMode === 'LAZY' && (
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={reviewPlan}
                                        onChange={(e) => setReviewPlan(e.target.checked)}
                                        className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        disabled={isBusy}
                                    />
                                    <span className="text-slate-700 dark:text-slate-300">
                                        I want to double check the testing plan before running the simulation.
                                    </span>
                                </label>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 pl-8">If unchecked, the AI-generated plan will be executed immediately.</p>
                            </div>
                        )}
                    </div>
                </div>
            </FormCard>
            
            <div className="animate-slide-up">
                <FormCard step={2} title="Select & Generate Personas">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {personas.map(persona => (
                            <div
                                key={persona.id}
                                onClick={() => !isBusy && togglePersonaSelection(persona.id)}
                                className={`p-4 rounded-xl border-2 transition-all duration-200 ${isBusy ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${selectedPersonaIds.has(persona.id) ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 dark:border-blue-500' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1.5 flex-shrink-0 w-5 h-5 rounded-lg flex items-center justify-center border-2 ${selectedPersonaIds.has(persona.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-400 dark:border-slate-500'}`}>
                                       {selectedPersonaIds.has(persona.id) && <CheckCircleIcon className="w-4 h-4 text-white"/>}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">{persona.name}</h3>
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${skillLevelConfig[persona.skillLevel]}`}>{persona.skillLevel}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{persona.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-serif text-xl font-bold mb-4 text-blue-600 dark:text-blue-400">Generate Custom Personas</h3>
                            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-6">
                                <div>
                                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Option A: Generate from Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <textarea id="gen-demographics" rows={2}
                                            className="md:col-span-2 w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="User Demographics (e.g., 'Millennials in urban areas')"
                                            value={personaGenDemographics}
                                            onChange={(e) => setPersonaGenDemographics(e.target.value)}
                                            disabled={isBusy} />
                                        <textarea id="gen-goals" rows={2}
                                            className="md:col-span-2 w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="User Goals (e.g., 'Quickly find and book a service')"
                                            value={personaGenGoals}
                                            onChange={(e) => setPersonaGenGoals(e.target.value)}
                                            disabled={isBusy} />
                                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                                            <select id="gen-skill"
                                                className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                value={personaGenSkillLevel}
                                                onChange={(e) => setPersonaGenSkillLevel(e.target.value as any)}
                                                disabled={isBusy}>
                                                <option>Novice</option>
                                                <option>Intermediate</option>
                                                <option>Expert</option>
                                            </select>
                                            <button onClick={onGeneratePersonas} disabled={isBusy || !personaGenGoals || !personaGenDemographics}
                                                className="w-full px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors">
                                                {isGeneratingPersonas ? 'Generating...' : 'Generate Personas'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                                     <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Option B: Generate from a Business Idea</h4>
                                     <textarea id="business-idea" rows={3}
                                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Business/App Idea (e.g., 'A mobile app that uses AI to create personalized travel itineraries.')"
                                        value={businessIdea}
                                        onChange={(e) => setBusinessIdea(e.target.value)}
                                        disabled={isBusy} />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end mt-4">
                                        <input type="number" id="persona-count"
                                            className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={personaCount}
                                            onChange={(e) => setPersonaCount(parseInt(e.target.value, 10))}
                                            min="1" max="10"
                                            disabled={isBusy} />
                                         <button onClick={onGeneratePersonasFromIdea} disabled={isBusy || !businessIdea || personaCount <= 0}
                                            className="w-full px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors">
                                            {isGeneratingPersonas ? 'Generating...' : 'Generate from Idea'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </FormCard>
            </div>
            
            {canStart && (
                <div className="text-center pt-4 animate-fade-in">
                    <button
                        onClick={onStartSimulation}
                        disabled={selectedPersonaIds.size === 0 || isBusy}
                        className="px-10 py-4 text-xl font-bold text-white bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-75 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:scale-100 duration-300 ease-in-out shadow-lg disabled:shadow-none"
                    >
                        {isSimulating ? 'Running Simulation...' : `Start Simulation with ${selectedPersonaIds.size} Persona(s)`}
                    </button>
                </div>
            )}
        </div>
    );
};

export default InputForm;