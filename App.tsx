import React, { useState, useCallback, useMemo, useEffect } from 'react';
// Fix: Add the missing `FrictionSummary` type to the import statement.
import { AppState, Persona, SessionResult, AnalysisResult, TestMode, HistoryEntry, PersonaTypeTag, TestTypeTag, FrictionSummary, SimulationVersion } from './types';
import { runSimulation, analyzeResults, analyzeCompetitorResults, summarizeFrictionPoints, generatePersonas, generatePersonasFromIdea, suggestJourneySteps, generateHistorySummary, generateLazyTestPlan } from './services/geminiService';
import InputForm from './components/InputForm';
import Dashboard from './components/Dashboard';
import HistorySidebar from './components/HistorySidebar';
import HomePage from './components/HomePage';
import ProgressModal from './components/ProgressModal';
import PlanReview from './components/PlanReview';

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

const funnyMessages = [
    "Waking up the AI agents...",
    "Brewing coffee for the personas...",
    "Teaching the novice user how to click...",
    "Asking the expert user to please slow down...",
    "Finding the tiniest pixel misalignment...",
    "Calibrating the frustration-o-meter...",
    "Polishing the Selenium scripts...",
    "Convincing the AI it's not a robot...",
    "Analyzing subconscious user twitches...",
    "Generating alternative facts for the report...",
    "Hiding the 'skip ad' button...",
    "Debating the meaning of 'intuitive' with the AI..."
];

const planGenerationMessages = [
    "Scanning for login portals...",
    "Designing the perfect user trap... I mean, journey.",
    "Asking the AI what 'synergy' means...",
    "Mapping out the path of least resistance...",
    "Consulting the UX oracle...",
    "Deciding which buttons are most clickable...",
    "Plotting the user's every move...",
    "Generating a plan so good, it should be framed.",
    "Ensuring the plan has enough twists and turns.",
    "Drinking virtual coffee to brainstorm harder."
];

const personaGenerationMessages = [
    "Conducting virtual interviews...",
    "Inventing tragic backstories...",
    "Rolling dice for personality traits...",
    "Searching stock photos for 'thoughtful person'...",
    "Ensuring personas have quirky, relatable hobbies.",
    "Analyzing zodiac signs for compatibility...",
    "Fabricating detailed user demographics...",
    "Crafting goals that are just challenging enough."
];

const App: React.FC = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [appState, setAppState] = useState<AppState | 'IDLE'>('IDLE');
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [activeView, setActiveView] = useState<string | 'new' | 'home' | 'plan-review'>('home');

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
    const [reviewPlan, setReviewPlan] = useState<boolean>(true);
    const [generatedPlan, setGeneratedPlan] = useState<string[]>([]);
    const [generatingPersonaMethod, setGeneratingPersonaMethod] = useState<'details' | 'idea' | null>(null);
    const [isCompetitorMode, setIsCompetitorMode] = useState<boolean>(false);
    const [competitorUrl, setCompetitorUrl] = useState<string>('');

    
    // Progress Modal State
    const [isProgressModalVisible, setIsProgressModalVisible] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');

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
        if (activeView === 'new' || activeView === 'home' || activeView === 'plan-review') return null;
        return history.find(h => h.id === activeView);
    }, [activeView, history]);
    
    const currentTask = useMemo(() => {
        if (testMode === 'SINGLE_TASK') return userTask;
        if (testMode === 'LAZY' && generatedPlan.length > 0) {
             const planString = generatedPlan.map((step, i) => `${i + 1}. ${step}`).join('\n');
             return `Execute the following AI-generated test plan:\n${planString}`;
        }
        if (journeySteps.length > 0) {
            const journeyString = journeySteps.map((step, i) => `${i + 1}. ${step}`).join('\n');
            return `Complete the following user journey, performing each step in sequence:\n${journeyString}`;
        }
        return '';
    }, [testMode, userTask, journeySteps, generatedPlan]);

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

    const startProgressModal = (messages: string[] = funnyMessages) => {
        setIsProgressModalVisible(true);
        setProgress(0);
        setProgressMessage(messages[Math.floor(Math.random() * messages.length)]);

        const progressInterval = setInterval(() => {
            setProgress(oldProgress => {
                if (oldProgress >= 95) return 95;
                const diff = Math.random() * 10;
                return Math.min(oldProgress + diff, 95);
            });
        }, 800);

        const messageInterval = setInterval(() => {
            setProgressMessage(prevMessage => {
                let newMessage = prevMessage;
                if (messages.length > 1) {
                    while (newMessage === prevMessage) {
                        newMessage = messages[Math.floor(Math.random() * messages.length)];
                    }
                }
                return newMessage;
            });
        }, 3000);

        return { progressInterval, messageInterval };
    };

    const stopProgressModal = (intervals: { progressInterval: NodeJS.Timeout, messageInterval: NodeJS.Timeout }) => {
        clearInterval(intervals.progressInterval);
        clearInterval(intervals.messageInterval);
        setProgress(100);
        setTimeout(() => {
            setIsProgressModalVisible(false);
            setAppState('IDLE');
        }, 500);
    };

    const handleGeneratePersonas = async () => {
        if (!personaGenGoals.trim() || !personaGenDemographics.trim()) return;
        
        const intervals = startProgressModal(personaGenerationMessages);
        setGeneratingPersonaMethod('details');
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
            stopProgressModal(intervals);
            setGeneratingPersonaMethod(null);
        }
    };

    const handleGeneratePersonasFromIdea = async () => {
        if (!businessIdea.trim() || personaCount <= 0) return;
        const intervals = startProgressModal(personaGenerationMessages);
        setGeneratingPersonaMethod('idea');
        setError(null);
        try {
            const newPersonas = await generatePersonasFromIdea(businessIdea, personaCount);
            setGeneratedPersonas(prev => [...prev, ...newPersonas]);
        } catch (e: any) {
            setError(e.message || 'Failed to generate personas from idea.');
        } finally {
            stopProgressModal(intervals);
            setGeneratingPersonaMethod(null);
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
    
    const runAllPersonasForUrl = async (task: string, url: string, personas: Persona[]): Promise<SessionResult[]> => {
        const results: SessionResult[] = [];
        for (const persona of personas) {
            const result = await runSimulation(task, url, persona);
            results.push({ ...result, persona });
        }
        return results;
    }

    const runFullSimulation = useCallback(async (
        taskToRun: string,
        personasToTest: Persona[],
        isCompetitorTest: boolean,
        mainUrl: string,
        competitorTestUrl?: string,
    ): Promise<Omit<SimulationVersion, 'version' | 'timestamp'>> => {
        setAppState('SIMULATING');
        
        const yourSiteResults = await runAllPersonasForUrl(taskToRun, mainUrl, personasToTest);
        
        let competitorSiteResults: SessionResult[] | undefined = undefined;
        if (isCompetitorTest && competitorTestUrl) {
            competitorSiteResults = await runAllPersonasForUrl(taskToRun, competitorTestUrl, personasToTest);
        }

        setAppState('ANALYZING');
        let analysis: AnalysisResult | null = null;
        if (isCompetitorTest && competitorSiteResults) {
            analysis = await analyzeCompetitorResults(yourSiteResults, competitorSiteResults);
        } else {
            analysis = await analyzeResults(yourSiteResults);
        }

        return { yourSiteResults, competitorSiteResults, analysis };

    }, []);

    const executeNewSimulation = useCallback(async (
        taskToRun: string,
        personasToTest: Persona[],
        testType: TestTypeTag,
        url: string,
        isCompetitor: boolean,
        compUrl?: string,
    ) => {
        const intervals = startProgressModal();
        setError(null);
        try {
            const { yourSiteResults, competitorSiteResults, analysis } = await runFullSimulation(taskToRun, personasToTest, isCompetitor, url, compUrl);
            
            const resultsForSummary = yourSiteResults;
            const historySummary = await generateHistorySummary(taskToRun, resultsForSummary);
            
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
            
            const newHistoryEntry: HistoryEntry = {
                id: `sim-${Date.now()}`,
                title: historySummary.title,
                fullTask: taskToRun,
                prototypeUrl: url,
                competitorUrl: compUrl,
                tags: { 
                    testType: isCompetitor ? 'Competitor Analysis' : testType, 
                    personaType: getPersonaTypeTag(),
                    isCompetitorAnalysis: isCompetitor,
                },
                personas: personasToTest,
                versions: [{
                    version: 1,
                    timestamp: new Date().toLocaleString(),
                    yourSiteResults,
                    competitorSiteResults,
                    analysis,
                }],
            };

            setHistory(prev => [newHistoryEntry, ...prev]);
            setActiveView(newHistoryEntry.id);
        } catch (e: any) {
            setError(e.message || 'An unknown error occurred during simulation.');
        } finally {
            stopProgressModal(intervals);
        }
    }, [selectedPersonaIds, runFullSimulation]);

    const handleStartSimulation = useCallback(async () => {
        if (selectedPersonaIds.size === 0 || !prototypeUrl.trim()) return;
        
        const allPersonas = [...hardcodedPersonas, ...generatedPersonas];
        const selectedPersonas = allPersonas.filter(p => selectedPersonaIds.has(p.id));

        if (testMode === 'LAZY') {
            if (reviewPlan) {
                // Generate plan with its own progress modal, then show review screen
                const intervals = startProgressModal(planGenerationMessages);
                setAppState('GENERATING_PLAN');
                setError(null);
                try {
                    const plan = await generateLazyTestPlan(prototypeUrl, selectedPersonas[0]);
                    setGeneratedPlan(plan);
                    setActiveView('plan-review');
                } catch (e: any) {
                    setError(e.message || 'Failed to generate test plan.');
                } finally {
                    stopProgressModal(intervals);
                }
            } else {
                // Generate plan and run simulation with a single, continuous progress bar
                const intervals = startProgressModal([...planGenerationMessages, ...funnyMessages]);
                setAppState('GENERATING_PLAN');
                setError(null);
                try {
                    const plan = await generateLazyTestPlan(prototypeUrl, selectedPersonas[0]);
                    setGeneratedPlan(plan);

                    const task = `Execute the following AI-generated test plan:\n${plan.map((step, i) => `${i + 1}. ${step}`).join('\n')}`;
                    await executeNewSimulation(task, selectedPersonas, 'Lazy Mode', prototypeUrl, false);
                } catch (e: any) {
                    setError(e.message || 'An unknown error occurred during the process.');
                } finally {
                    stopProgressModal(intervals);
                }
            }
        } else {
            if (!currentTask.trim()) return;
            const testType: TestTypeTag = testMode === 'SINGLE_TASK' ? 'Specific Task' : 'User Journey';
            await executeNewSimulation(currentTask, selectedPersonas, testType, prototypeUrl, isCompetitorMode, competitorUrl);
        }
    }, [selectedPersonaIds, currentTask, prototypeUrl, generatedPersonas, testMode, reviewPlan, executeNewSimulation, isCompetitorMode, competitorUrl]);

    const handleRunReviewedPlan = useCallback(async () => {
        if (generatedPlan.length === 0) {
            setError("The test plan cannot be empty.");
            return;
        }
        const task = `Execute the following test plan:\n${generatedPlan.map((step, i) => `${i + 1}. ${step}`).join('\n')}`;
        const allPersonas = [...hardcodedPersonas, ...generatedPersonas];
        const selectedPersonas = allPersonas.filter(p => selectedPersonaIds.has(p.id));

        await executeNewSimulation(task, selectedPersonas, 'Lazy Mode', prototypeUrl, false);

    }, [generatedPlan, selectedPersonaIds, generatedPersonas, prototypeUrl, executeNewSimulation]);

    const handleRerunSimulation = useCallback(async (historyEntryId: string) => {
        const entryToRerun = history.find(h => h.id === historyEntryId);
        if (!entryToRerun) {
            setError("Could not find the simulation to rerun.");
            return;
        }

        const intervals = startProgressModal();
        setAppState('SIMULATING');
        setError(null);
        setActiveView(historyEntryId);

        try {
            const { yourSiteResults, competitorSiteResults, analysis } = await runFullSimulation(
                entryToRerun.fullTask, 
                entryToRerun.personas,
                !!entryToRerun.competitorUrl,
                entryToRerun.prototypeUrl,
                entryToRerun.competitorUrl
            );
            
            const newVersion: Omit<SimulationVersion, 'version' | 'timestamp'> = { yourSiteResults, competitorSiteResults, analysis };

            setHistory(prevHistory => prevHistory.map(h => 
                h.id === historyEntryId 
                    ? { ...h, versions: [...h.versions, {
                        ...newVersion,
                        version: h.versions.length + 1,
                        timestamp: new Date().toLocaleString(),
                      }] }
                    : h
            ));

        } catch (e: any)
{
            setError(e.message || 'An unknown error occurred during the rerun.');
        } finally {
            stopProgressModal(intervals);
        }
    }, [history, runFullSimulation]);


    const handleNewSimulation = () => {
        setActiveView('new');
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
        setError(null);
        setAppState('IDLE');
        setGeneratedPlan([]);
        setReviewPlan(true);
        setIsCompetitorMode(false);
        setCompetitorUrl('');
    };

    const handleGoHome = () => {
        setActiveView('home');
        setError(null);
    };
    
    const renderMainContent = () => {
        const isBusy = appState !== 'IDLE' || !!generatingPersonaMethod;
        
        if (activeView === 'home') {
             return <HomePage onStartNew={() => setActiveView('new')} recentHistory={history.slice(0, 3)} onSelectHistory={setActiveView} />;
        }
        
        if (activeView === 'new') {
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
                        isSimulating={appState !== 'IDLE'}
                        personaGenGoals={personaGenGoals}
                        setPersonaGenGoals={setPersonaGenGoals}
                        personaGenDemographics={personaGenDemographics}
                        setPersonaGenDemographics={setPersonaGenDemographics}
                        personaGenSkillLevel={personaGenSkillLevel}
                        setPersonaGenSkillLevel={setPersonaGenSkillLevel}
                        onGeneratePersonas={handleGeneratePersonas}
                        generatingPersonaMethod={generatingPersonaMethod}
                        businessIdea={businessIdea}
                        setBusinessIdea={setBusinessIdea}
                        personaCount={personaCount}
                        setPersonaCount={setPersonaCount}
                        onGeneratePersonasFromIdea={handleGeneratePersonasFromIdea}
                        onSuggestJourneySteps={handleSuggestJourneySteps}
                        reviewPlan={reviewPlan}
                        setReviewPlan={setReviewPlan}
                        isCompetitorMode={isCompetitorMode}
                        setIsCompetitorMode={setIsCompetitorMode}
                        competitorUrl={competitorUrl}
                        setCompetitorUrl={setCompetitorUrl}
                    />
                </div>
            );
        }

        if (activeView === 'plan-review') {
            return (
                <PlanReview 
                    plan={generatedPlan}
                    setPlan={setGeneratedPlan}
                    onRun={handleRunReviewedPlan}
                    isSimulating={appState !== 'IDLE'}
                />
            );
        }

        if (activeHistoryEntry) {
            return <Dashboard historyEntry={activeHistoryEntry} onGoHome={handleGoHome} onRerun={handleRerunSimulation} isRerunning={appState !== 'IDLE'} />;
        }

        return <p>History item not found.</p>;
    };

    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
            <HistorySidebar
                history={history}
                activeId={activeView}
                onSelect={setActiveView}
                onNew={handleNewSimulation}
                onGoHome={handleGoHome}
                theme={theme}
                onToggleTheme={handleToggleTheme}
            />
            <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
                {error && (
                    <div className="my-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl max-w-4xl mx-auto text-center dark:bg-red-950 dark:border-red-800 dark:text-red-200">
                        <strong>Error:</strong> {error}
                    </div>
                )}
                {isProgressModalVisible && <ProgressModal progress={progress} message={progressMessage} />}
                {renderMainContent()}
            </main>
        </div>
    );
};

export default App;