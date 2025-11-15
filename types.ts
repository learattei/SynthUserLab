
export interface Persona {
  id: string;
  name: string;
  description: string;
  skillLevel: 'Novice' | 'Intermediate' | 'Expert';
  goals: string[];
}

export interface SimulationStep {
  code: string;
  thought: string;
  emotion: 'Neutral' | 'Confused' | 'Frustrated' | 'Satisfied' | 'Curious';
}

export interface SessionResult {
  persona: Persona;
  steps: SimulationStep[];
  completed: boolean;
  timeTaken: number; // in seconds
}

export interface AnalysisIssue {
  issue: string;
  severity: 'Low' | 'Medium' | 'High';
  recommendation: string;
}

export interface AnalysisResult {
  summary: string;
  issues: AnalysisIssue[];
}

// Fix: Add the missing BusinessAnalysisResult interface.
export interface BusinessAnalysisResult {
  conversionRate: number;
  topFrictionPoints: {
    impact: 'High' | 'Medium' | 'Low';
    point: string;
  }[];
}

export interface FrictionSummary {
  summary: string;
  suggestion: string;
}

export type TestMode = 'SINGLE_TASK' | 'USER_JOURNEY' | 'LAZY';

export type PersonaTypeTag = 'Novice' | 'Expert' | 'Custom' | 'Mixed';
export type TestTypeTag = 'Specific Task' | 'User Journey' | 'Lazy Mode';

export interface SimulationVersion {
    version: number;
    timestamp: string;
    sessionResults: SessionResult[];
    analysis: AnalysisResult | null;
}

export interface HistoryEntry {
    id: string;
    title: string;
    fullTask: string;
    prototypeUrl: string;
    tags: {
        testType: TestTypeTag;
        personaType: PersonaTypeTag;
    };
    personas: Persona[]; // The personas used for all versions
    versions: SimulationVersion[];
}


export type AppState =
  | 'CONFIG'
  | 'GENERATING_PERSONAS'
  | 'GENERATING_PLAN'
  | 'SIMULATING'
  | 'ANALYZING'
  | 'SHOWING_RESULTS';