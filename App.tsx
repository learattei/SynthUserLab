import React, { useState, useCallback, useMemo } from 'react';
import { AppState, Persona, SessionResult, AnalysisResult, FrictionSummary, TestMode, BusinessAnalysisResult } from './types';
import { runSimulation, analyzeResults, summarizeFrictionPoints, generatePersonas, generatePersonasFromIdea, analyzeBusinessValidation } from './services/geminiService';
import InputForm from './components/InputForm';
import Dashboard from './components/Dashboard';
import BusinessReport from './components/BusinessReport';
import AgentLog from './components/AgentLog';
import AISummary from './components/AISummary';

const hardcodedPersonas: Persona[] = [
    {
      id: 'novice-user',
      name: 'Persona 1: Novice User',
      description: 'A user who is new to this type of application and generally unfamiliar with modern technology. They proceed with caution and may get easily confused by complex interfaces.',
      skillLevel: 'Novice',
      goals: ['Explore the app and understand what it does', 'Try to complete a basic task without getting stuck'],
    },
    {
      id: 'expert-user',
      name: 'Persona 2: Expert User',
      description: 'An experienced user who values efficiency. They want to accomplish tasks as quickly as possible, with minimal friction.',
      skillLevel: 'Expert',
      goals: ['Complete the primary task as efficiently as possible'],
    }
];

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('CONFIG');
    const [testMode, setTestMode] = useState<TestMode>('UX_TESTING');
    const [userTask, setUserTask] = useState<string>('');
    const [businessTask, setBusinessTask] = useState<string>('');
    const [prototypeUrl, setPrototypeUrl] = useState<string>('');
    const [selectedPersonaIds, setSelectedPersonaIds] = useState<Set<string>>(new Set());
    const [sessionResults, setSessionResults] = useState<SessionResult[]>([]);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [businessAnalysis, setBusinessAnalysis] = useState<BusinessAnalysisResult | null>(null);
    const [frictionSummary, setFrictionSummary] = useState<FrictionSummary | null>(null);
    const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // State for persona generation from details
    const [personaGenGoals, setPersonaGenGoals] = useState<string>('');
    const [personaGenDemographics, setPersonaGenDemographics] = useState<string>('');
    const [personaGenSkillLevel, setPersonaGenSkillLevel] = useState<'Novice' | 'Intermediate' | 'Expert'>('Intermediate');
    const [generatedPersonas, setGeneratedPersonas] = useState<Persona[]>([]);

    // State for persona generation from idea
    const [businessIdea, setBusinessIdea] = useState<string>('');
    const [personaCount, setPersonaCount] = useState<number>(5);

    const currentTask = useMemo(() => testMode === 'UX_TESTING' ? userTask : businessTask, [testMode, userTask, businessTask]);

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
            setAppState('CONFIG');
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
            setAppState('CONFIG');
        }
    };

    const handleStartSimulation = useCallback(async () => {
        if (selectedPersonaIds.size === 0 || !currentTask.trim() || !prototypeUrl.trim()) return;

        setAppState('SIMULATING');
        setError(null);
        setSessionResults([]);
        setFrictionSummary(null);
        setAnalysis(null);
        setBusinessAnalysis(null);
        
        const allPersonas = [...hardcodedPersonas, ...generatedPersonas];
        const selectedPersonas = allPersonas.filter(p => selectedPersonaIds.has(p.id));
        const currentResults: SessionResult[] = [];

        try {
            for (const persona of selectedPersonas) {
                const result = await runSimulation(
                    currentTask,
                    prototypeUrl,
                    persona
                );
                const sessionResult = { ...result, persona };
                currentResults.push(sessionResult);
                setSessionResults([...currentResults]);
            }
            
            setAppState('ANALYZING');

            if (testMode === 'UX_TESTING') {
                setIsSummaryLoading(true);
                const summaryPromise = summarizeFrictionPoints(currentResults).then(setFrictionSummary).finally(() => setIsSummaryLoading(false));
                const analysisPromise = analyzeResults(currentResults).then(setAnalysis);
                await Promise.all([summaryPromise, analysisPromise]);
                setAppState('SHOWING_RESULTS');
            } else { // BUSINESS_VALIDATION
                const businessReport = await analyzeBusinessValidation(currentResults);
                setBusinessAnalysis(businessReport);
                setAppState('SHOWING_BUSINESS_REPORT');
            }

        } catch (e: any) {
            setError(e.message || 'An unknown error occurred during simulation.');
            setAppState('CONFIG');
        }
    }, [selectedPersonaIds, currentTask, prototypeUrl, generatedPersonas, testMode]);

    const handleReset = () => {
        setAppState('CONFIG');
        setTestMode('UX_TESTING');
        setUserTask('');
        setBusinessTask('');
        setPrototypeUrl('');
        setSelectedPersonaIds(new Set());
        setSessionResults([]);
        setAnalysis(null);
        setBusinessAnalysis(null);
        setFrictionSummary(null);
        setError(null);
        setGeneratedPersonas([]);
        setPersonaGenGoals('');
        setPersonaGenDemographics('');
        setPersonaGenSkillLevel('Intermediate');
        setBusinessIdea('');
        setPersonaCount(5);
    };
    
    const renderContent = () => {
        switch (appState) {
            case 'SHOWING_RESULTS':
                return <Dashboard sessionResults={sessionResults} analysis={analysis} onReset={handleReset} userTask={currentTask} />;
            case 'SHOWING_BUSINESS_REPORT':
                return <BusinessReport result={businessAnalysis} onReset={handleReset} task={currentTask} />;
            case 'CONFIG':
            case 'GENERATING_PERSONAS':
            case 'SIMULATING':
            case 'ANALYZING':
            default:
                const isSimulating = appState === 'SIMULATING' || appState === 'ANALYZING';
                const isGeneratingPersonas = appState === 'GENERATING_PERSONAS';
                return (
                    <>
                        <InputForm
                            testMode={testMode}
                            setTestMode={setTestMode}
                            userTask={userTask}
                            setUserTask={setUserTask}
                            businessTask={businessTask}
                            setBusinessTask={setBusinessTask}
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
                        />
                        {isSimulating && testMode === 'UX_TESTING' && (
                            <>
                                <AgentLog results={sessionResults} />
                                <AISummary summary={frictionSummary} isLoading={isSummaryLoading} />
                            </>
                        )}
                        {isSimulating && testMode === 'BUSINESS_VALIDATION' && (
                             <AgentLog results={sessionResults} />
                        )}
                   </>
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
            <header className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">
                    AI UX Lab
                </h1>
                <p className="text-slate-400 mt-2 max-w-2xl mx-auto">
                    Get instant UX feedback on your app ideas from a team of AI-powered user personas.
                </p>
            </header>
            <main className="w-full">
                {error && (
                    <div className="my-4 p-4 bg-red-900/50 border border-red-500 text-red-300 rounded-lg max-w-4xl mx-auto text-center">
                        <strong>Error:</strong> {error}
                    </div>
                )}
                {renderContent()}
            </main>
        </div>
    );
};

export default App;