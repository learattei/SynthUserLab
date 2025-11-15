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

export interface FrictionSummary {
  summary: string;
  suggestion: string;
}

export type AppState =
  | 'CONFIG'
  | 'GENERATING_PERSONAS'
  | 'SIMULATING'
  | 'ANALYZING'
  | 'SHOWING_RESULTS';