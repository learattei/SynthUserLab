import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { AppState, Persona, SessionResult, AnalysisResult, FrictionSummary, TestMode, HistoryEntry, PersonaTypeTag, TestTypeTag } from './types';
import { runSimulation, analyzeResults, summarizeFrictionPoints, generatePersonas, generatePersonasFromIdea, suggestJourneySteps, generateHistorySummary } from './services/geminiService';
import InputForm from './components/InputForm';
import Dashboard from './components/Dashboard';
import AgentLog from './components/AgentLog';
import AISummary from './components/AISummary';
import HistorySidebar from './components/HistorySidebar';

const hardcodedPersonas: Persona[] = [
    {
      id: 'novice-user',
      name: 'Novice User',
      description: 'A user who is new to this type of application and generally unfamiliar with modern technology. They proceed with caution and may get easily confused by complex interfaces.',
      skillLevel: 'Novice',
      goals: ['Explore the app and understand what it does', 'Try to complete a basic task without getting stuck'],
    },
    {
      id: 'expert-user',
      name: 'Expert User',
      description: 'An experienced user who values efficiency. They want to accomplish tasks as quickly as possible, with minimal friction.',
      skillLevel: 'Expert',
      goals: ['Complete the primary task as efficiently as possible'],
    }
];

const App: React.FC = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [appState, setAppState] = useState<AppState | 'IDLE'>('IDLE');
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [activeViewId, setActiveViewId] = useState<string | 'new'>('new');

    // Form/Config State
    const [testMode, setTestMode] = useState<TestMode>('SINGLE_TASK');
    const [userTask, setUserTask] = useState<string>('');
    const [journeySteps, setJourneySteps] = useState<string[]>([]);
    const [prototypeUrl, setPrototypeUrl] = useState<string>('');
    const [selectedPersonaIds, setSelectedPersonaIds] = useState<Set<string>>(new Set());
    const [generatedPersonas, setGeneratedPersonas] = useState<Persona[]>([]);
    const [personaGenGoals, setPersonaGenGoals] = useState<string>('');
    const [personaGenDemographics, setPersonaGenDemographics] = useState<string>('');
    const [personaGenSkillLevel, setPersonaGenSkillLevel] = useState<'Novice' | 'Intermediate' | 'Expert'>('Intermediate');
    const [businessIdea, setBusinessIdea] = useState<string>('');
    const [personaCount, setPersonaCount] = useState<number>(5);

    // Live Simulation State
    const [currentSimulationResults, setCurrentSimulationResults] = useState<SessionResult[]>([]);
    const [frictionSummary, setFrictionSummary] = useState<FrictionSummary | null>(null);
    const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(false);
    
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const savedTheme = localStorage.getItem('synth-labs-theme') as 'light' | 'dark';
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme) {
            setTheme(savedTheme);
        } else if (prefersDark) {
            setTheme('dark');
        }
    }, []);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('synth-labs-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('synth-labs-theme', 'light');
        }
    }, [theme]);
    
    const handleToggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const activeHistoryEntry = useMemo(() => {
        if (activeViewId === 'new') return null;
        return history.find(h => h.id === activeViewId);
    }, [activeViewId, history]);
    
    const currentTask = useMemo(() => {
        if (testMode === 'SINGLE_TASK') return userTask;
        if (journeySteps.length > 0) {
            const journeyString = journeySteps.map((step, i) => `${i + 1}. ${step}`).join('\n');
            return `Complete the following user journey, performing each step in sequence:\n${journeyString}`;
        }
        return '';
    }, [testMode, userTask, journeySteps]);

    const togglePersonaSelection = useCallback((id: string) => {
        setSelectedPersonaIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    const handleGeneratePersonas = async () => {
        if (!personaGenGoals.trim() || !personaGenDemographics.trim()) return;

        setAppState('GENERATING_PERSONAS');
        setError(null);
        try {
            const newPersonas = await generatePersonas(
                personaGenGoals,
                personaGenDemographics,
                personaGenSkillLevel
            );
            setGeneratedPersonas(prev => [...prev, ...newPersonas]);
        } catch (e: any) {
            setError(e.message || 'Failed to generate personas.');
        } finally {
            setAppState('IDLE');
        }
    };

    const handleGeneratePersonasFromIdea = async () => {
        if (!businessIdea.trim() || personaCount <= 0) return;
        setAppState('GENERATING_PERSONAS');
        setError(null);
        try {
            const newPersonas = await generatePersonasFromIdea(businessIdea, personaCount);
            setGeneratedPersonas(prev => [...prev, ...newPersonas]);
        } catch (e: any) {
            setError(e.message || 'Failed to generate personas from idea.');
        } finally {
            setAppState('IDLE');
        }
    };

    const handleSuggestJourneySteps = async () : Promise<string[]> => {
        if (!prototypeUrl.trim()) {
            setError("Please enter a prototype URL to get suggestions.");
            return [];
        }
        setError(null);
        try {
            const steps = await suggestJourneySteps(prototypeUrl);
            return steps;
        } catch (e: any) {
             setError(e.message || 'Failed to suggest steps.');
             return [];
        }
    }

    const handleStartSimulation = useCallback(async () => {
        if (selectedPersonaIds.size === 0 || !currentTask.trim() || !prototypeUrl.trim()) return;

        setAppState('SIMULATING');
        setError(null);
        setCurrentSimulationResults([]);
        setFrictionSummary(null);
        
        const allPersonas = [...hardcodedPersonas, ...generatedPersonas];
        const selectedPersonas = allPersonas.filter(p => selectedPersonaIds.has(p.id));
        const liveResults: SessionResult[] = [];

        try {
            for (const persona of selectedPersonas) {
                const result = await runSimulation(
                    currentTask,
                    prototypeUrl,
                    persona
                );
                const sessionResult = { ...result, persona };
                liveResults.push(sessionResult);
                setCurrentSimulationResults([...liveResults]);
            }
            
            setAppState('ANALYZING');

            setIsSummaryLoading(true);
            const summaryPromise = summarizeFrictionPoints(liveResults).then(setFrictionSummary).finally(() => setIsSummaryLoading(false));
            const analysisPromise = analyzeResults(liveResults);
            const historySummaryPromise = generateHistorySummary(currentTask, liveResults);
            
            const [, finalAnalysis, historySummary] = await Promise.all([summaryPromise, analysisPromise, historySummaryPromise]);

            const getPersonaTypeTag = (): PersonaTypeTag => {
                const hasNovice = selectedPersonaIds.has('novice-user');
                const hasExpert = selectedPersonaIds.has('expert-user');
                const hasCustom = [...selectedPersonaIds].some(id => id.startsWith('generated-'));

                if (hasCustom) return 'Custom';
                if (hasNovice && hasExpert) return 'Mixed';
                if (hasNovice) return 'Novice';
                if (hasExpert) return 'Expert';
                return 'Custom';
            };

            const testTypeTag: TestTypeTag = testMode === 'SINGLE_TASK' ? 'Specific Task' : 'User Journey';
            const personaTypeTag = getPersonaTypeTag();

            const newHistoryEntry: HistoryEntry = {
                id: `sim-${Date.now()}`,
                title: historySummary.title,
                description: historySummary.description,
                fullTask: currentTask,
                timestamp: new Date().toLocaleString(),
                tags: {
                    testType: testTypeTag,
                    personaType: personaTypeTag,
                },
                sessionResults: liveResults,
                analysis: finalAnalysis,
            };

            setHistory(prev => [newHistoryEntry, ...prev]);
            setActiveViewId(newHistoryEntry.id);

        } catch (e: any) {
            setError(e.message || 'An unknown error occurred during simulation.');
        } finally {
            setAppState('IDLE');
        }
    }, [selectedPersonaIds, currentTask, prototypeUrl, generatedPersonas, testMode, journeySteps]);

    const handleNewSimulation = () => {
        setActiveViewId('new');
        setTestMode('SINGLE_TASK');
        setUserTask('');
        setJourneySteps([]);
        setPrototypeUrl('');
        setSelectedPersonaIds(new Set());
        setGeneratedPersonas([]);
        setPersonaGenGoals('');
        setPersonaGenDemographics('');
        setPersonaGenSkillLevel('Intermediate');
        setBusinessIdea('');
        setPersonaCount(5);
        setCurrentSimulationResults([]);
        setFrictionSummary(null);
        setError(null);
        setAppState('IDLE');
    };
    
    const renderMainContent = () => {
        if (activeViewId === 'new') {
            const isSimulating = appState === 'SIMULATING' || appState === 'ANALYZING';
            const isGeneratingPersonas = appState === 'GENERATING_PERSONAS';
            return (
                <div className="w-full max-w-5xl mx-auto flex flex-col gap-8">
                    <header className="w-full text-center py-8">
                        <h1 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100">Synth Labs</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-3 max-w-2xl mx-auto text-lg">Find every UX bug. Before your users do.</p>
                    </header>
                    <InputForm
                        testMode={testMode}
                        setTestMode={setTestMode}
                        userTask={userTask}
                        setUserTask={setUserTask}
                        journeySteps={journeySteps}
                        setJourneySteps={setJourneySteps}
                        prototypeUrl={prototypeUrl}
                        setPrototypeUrl={setPrototypeUrl}
                        personas={[...hardcodedPersonas, ...generatedPersonas]}
                        selectedPersonaIds={selectedPersonaIds}
                        togglePersonaSelection={togglePersonaSelection}
                        onStartSimulation={handleStartSimulation}
                        isSimulating={isSimulating}
                        personaGenGoals={personaGenGoals}
                        setPersonaGenGoals={setPersonaGenGoals}
                        personaGenDemographics={personaGenDemographics}
                        setPersonaGenDemographics={setPersonaGenDemographics}
                        personaGenSkillLevel={personaGenSkillLevel}
                        setPersonaGenSkillLevel={setPersonaGenSkillLevel}
                        onGeneratePersonas={handleGeneratePersonas}
                        isGeneratingPersonas={isGeneratingPersonas}
                        businessIdea={businessIdea}
                        setBusinessIdea={setBusinessIdea}
                        personaCount={personaCount}
                        setPersonaCount={setPersonaCount}
                        onGeneratePersonasFromIdea={handleGeneratePersonasFromIdea}
                        onSuggestJourneySteps={handleSuggestJourneySteps}
                    />
                    {isSimulating && (
                        <>
                            <AgentLog results={currentSimulationResults} />
                            <AISummary summary={frictionSummary} isLoading={isSummaryLoading} />
                        </>
                    )}
                </div>
            );
        }

        if (activeHistoryEntry) {
            return <Dashboard sessionResults={activeHistoryEntry.sessionResults} analysis={activeHistoryEntry.analysis} onNewSimulation={handleNewSimulation} fullTask={activeHistoryEntry.fullTask} />;
        }

        return <p>History item not found.</p>;
    };

    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
            <HistorySidebar
                history={history}
                activeId={activeViewId}
                onSelect={setActiveViewId}
                onNew={handleNewSimulation}
                theme={theme}
                onToggleTheme={handleToggleTheme}
            />
            <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
                {error && (
                    <div className="my-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl max-w-4xl mx-auto text-center dark:bg-red-950 dark:border-red-800 dark:text-red-200">
                        <strong>Error:</strong> {error}
                    </div>
                )}
                {renderMainContent()}
            </main>
        </div>
    );
};

export default App;