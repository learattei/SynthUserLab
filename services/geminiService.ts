import { GoogleGenAI, Type } from "@google/genai";
import { Persona, SessionResult, AnalysisResult, FrictionSummary } from '../types';

if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const personaSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "A unique, descriptive name for the persona, e.g., 'Tech-Savvy Tina'." },
            description: { type: Type.STRING, description: "A concise, single-sentence backstory for the persona (max 150 characters)." },
            skillLevel: { type: Type.STRING, enum: ['Novice', 'Intermediate', 'Expert'] },
            goals: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "A list containing one primary goal for this persona related to the main goals provided."
            }
        },
        required: ["name", "description", "skillLevel", "goals"]
    }
};

const parseAndIdPersonas = (responseText: string): Persona[] => {
    const personasJson = JSON.parse(responseText);
    return (personasJson as Omit<Persona, 'id'>[]).map((p) => ({
        ...p,
        id: `generated-${p.name.replace(/\s+/g, '-')}-${Math.random().toString(16).slice(2)}`
    }));
}


export const generatePersonas = async (
    goals: string,
    demographics: string,
    skillLevel: 'Novice' | 'Intermediate' | 'Expert'
): Promise<Persona[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the following user profile, generate 5 to 10 detailed user personas for usability testing. Each persona must have a unique name, a concise, single-sentence backstory/description (max 150 characters), a specific skill level ('Novice', 'Intermediate', or 'Expert'), and a primary goal.
        
            User Profile:
            - Demographics: "${demographics}"
            - Primary Goals: "${goals}"
            - General Technical Skill Level: "${skillLevel}"

            Provide the output as a JSON array of objects.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: personaSchema,
            }
        });
        return parseAndIdPersonas(response.text);
    } catch (error) {
        console.error("Error generating personas:", error);
        throw new Error("Failed to generate personas.");
    }
};

export const generatePersonasFromIdea = async (
    idea: string,
    count: number
): Promise<Persona[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are a product strategist. Based on the following business idea, generate ${count} distinct and detailed user personas who would likely be target users.
        
        Business Idea: "${idea}"

        For each persona, provide a unique name, a concise, single-sentence backstory/description (max 150 characters), a specific skill level ('Novice', 'Intermediate', 'Expert'), and a primary goal related to the business idea.
        Provide the output as a JSON array of objects.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: personaSchema,
            }
        });
        return parseAndIdPersonas(response.text);
    } catch (error) {
        console.error("Error generating personas from idea:", error);
        throw new Error("Failed to generate personas from idea.");
    }
};

export const suggestJourneySteps = async (url: string): Promise<string[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are a UX expert. Analyze the purpose of the website at the URL: \`${url}\`. 
            
            Based on your analysis, suggest a list of 5-7 common, high-level user journey steps for this type of application.
            For example, for an e-commerce site, steps might include 'Search for an item', 'Add item to cart', 'View cart', 'Proceed to checkout'.
            
            Return the result as a JSON array of strings.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                },
            }
        });
        const stepsJson = JSON.parse(response.text);
        return stepsJson as string[];
    } catch (error) {
        console.error("Error suggesting journey steps:", error);
        throw new Error("Failed to suggest journey steps.");
    }
}

export const generateLazyTestPlan = async (url: string, persona: Persona): Promise<string[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are a senior UX researcher creating a test plan. Analyze the website at the URL provided and create a customized, sequential, multi-step user journey test plan for the given user persona.

            **IMPORTANT:** First, analyze the page for a user authentication process (sign-up or login).
            - If a sign-up or registration form is the primary entry point, your test plan MUST start with the necessary steps to create a new account. Use realistic placeholder data.
            - If a login form is present, your test plan MUST start with the necessary steps to log in. Use placeholder credentials like 'user@example.com' and 'password123'.
            - After the sign-up or login steps, the rest of the plan MUST detail tasks a logged-in user would perform to achieve their goals on the site.
            - If no authentication is required, create the plan as normal based on the site's public features.
            
            The final plan should reflect the persona's goals and skill level.

            Website URL: \`${url}\`
            
            User Persona:
            - Name: ${persona.name} (${persona.skillLevel})
            - Description: ${persona.description}
            - Primary Goal: ${persona.goals[0]}
            
            Generate a realistic test plan of 4 to 6 logical steps that this persona would likely take to achieve their goal on this specific website. The steps should be clear, actionable, and test a meaningful interaction flow.
            
            Return the result ONLY as a JSON array of strings.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                },
            }
        });
        const planJson = JSON.parse(response.text);
        return planJson as string[];
    } catch (error) {
        console.error("Error generating lazy test plan:", error);
        throw new Error("Failed to generate the test plan.");
    }
}


export const runSimulation = async (
    userTask: string,
    url: string,
    persona: Persona
): Promise<Omit<SessionResult, 'persona'>> => {
    try {
        const goal = persona.goals[0] || "explore the app's main features";
        
        const prompt = `
You are a QA Automation Engineer embodying a user persona for usability testing.
Persona: "${persona.description}".
Your primary goal is to: "${goal}".
Your technical skill level is: ${persona.skillLevel}.

You have been given a URL and a specific task to complete. Your job is to write a sequence of Python Selenium commands to accomplish this task. The task may be a single goal or a sequence of steps; follow them in order.

---
Your Task: "${userTask}"
Website URL: "${url}"
---

Follow these instructions meticulously:
1.  Assume the following Python Selenium setup code is already present and you have a 'driver' variable available:
    \`\`\`python
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.common.keys import Keys
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    import time

    driver = webdriver.Chrome()
    driver.get("${url}")
    \`\`\`
2.  Generate a sequence of 5 to 8 steps to complete the task.
3.  For each step, provide your internal thought process, your current emotion ('Neutral', 'Confused', 'Frustrated', 'Satisfied', 'Curious'), and the specific Python Selenium code to execute that action.
4.  Think carefully about how your persona would behave. A 'Novice' might pause more (time.sleep) or try less optimal selectors. An 'Expert' would be efficient.
5.  Use robust selectors (like IDs, names, or specific CSS selectors) where possible. Add comments to your code explaining your choices.

*** Critical Error Handling ***
6.  If you determine that an action would fail (e.g., trying to find an element that is clearly not present), or if an action fails three times in a row, you are 'stuck'.
7.  If you get stuck, you MUST immediately stop the simulation.
8.  The final step in your log MUST describe the failure. The 'thought' for this step MUST start with "UX Friction: Critical:". Describe the element you couldn't find and suggest a specific fix.
    -   Example thought: "UX Friction: Critical: The 'Add to Cart' button was not visible after selecting a product color. Suggestion: Ensure the 'Add to Cart' button is always visible and enabled once all product options are selected."
9.  If you get stuck, you MUST set 'completed' to false. Otherwise, if you complete the task, set 'completed' to true.
10. Estimate the total time taken in seconds for your persona to complete the task and provide it as \`timeTaken\`.

Provide the output as a JSON object.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        completed: { type: Type.BOOLEAN },
                        timeTaken: { type: Type.NUMBER, description: "Estimated time in seconds to complete the task." },
                        steps: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    code: { type: Type.STRING, description: "The Python Selenium code for this step." },
                                    thought: { type: Type.STRING },
                                    emotion: { type: Type.STRING, enum: ['Neutral', 'Confused', 'Frustrated', 'Satisfied', 'Curious'] },
                                },
                                required: ["code", "thought", "emotion"],
                            },
                        },
                    },
                    required: ["completed", "steps", "timeTaken"],
                },
            },
        });
        const simulationJson = JSON.parse(response.text);
        return simulationJson as Omit<SessionResult, 'persona'>;
    } catch (error) {
        console.error(`Error running simulation for ${persona.name}:`, error);
        throw new Error(`Failed to run simulation for ${persona.name}.`);
    }
};

const singleSiteAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING },
        issues: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    issue: { type: Type.STRING },
                    severity: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
                    recommendation: { type: Type.STRING },
                },
                required: ["issue", "severity", "recommendation"],
            },
        },
        personaFeedback: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    personaName: { type: Type.STRING },
                    feedback: { type: Type.STRING },
                },
                required: ["personaName", "feedback"]
            },
            description: "A one-sentence feedback summary from each persona's perspective."
        }
    },
    required: ["summary", "issues", "personaFeedback"],
};


export const analyzeResults = async (sessionResults: SessionResult[]): Promise<AnalysisResult> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: `You are a senior UX researcher providing a report to a design and product team. Your task is to analyze user testing session logs and produce actionable feedback.

Analyze the following session logs, which include persona thoughts, emotions, and the Selenium code they generated to navigate a website. Look for patterns of confusion, hesitation (e.g., long pauses indicated by 'time.sleep'), or inefficient navigation (e.g., complex code for a simple action). Pay special attention to any steps marked with "UX Friction: Critical".

Your analysis must focus on problems within the UI/UX design, NOT on the user's perceived skill or emotions. Frame every issue as a design flaw.

For example:
-   **BAD issue:** "The Novice User got frustrated because they couldn't find the checkout button."
-   **GOOD issue:** "The primary call-to-action (Checkout button) has poor visibility on the cart page."

Follow these steps:
1.  Provide a high-level summary of the overall user experience and key themes discovered.
2.  Provide a list of specific, actionable usability issues. For each issue:
    -   **issue**: Clearly describe a specific problem with the user interface design or information architecture.
    -   **severity**: Rate its impact on the user experience as 'Low', 'Medium', or 'High'. Critical friction points should be rated 'High'.
    -   **recommendation**: Provide a concrete, actionable suggestion for the design or development team to resolve the issue. Example: "Increase the font size of body text to 16px for better readability."
3.  For each persona in the session, provide a single, summary sentence of their experience from their perspective. Frame it as if the persona is speaking. Example: 'As a novice user, I felt lost trying to find the settings menu.'

Session Logs: ${JSON.stringify(sessionResults, null, 2)}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: singleSiteAnalysisSchema,
            },
        });
        const analysisJson = JSON.parse(response.text);
        return analysisJson as AnalysisResult;
    } catch (error) {
        console.error("Error analyzing results:", error);
        throw new Error("Failed to analyze results.");
    }
};


export const analyzeCompetitorResults = async (yourSiteResults: SessionResult[], competitorSiteResults: SessionResult[]): Promise<AnalysisResult> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: `You are a senior UX researcher comparing two websites. Your task is to analyze two sets of user testing session logs and produce a head-to-head comparative report.

- The first set of logs is for "Your Site".
- The second set of logs is for "Competitor Site".

Your analysis must:
1.  **Declare a winner:** In a "competitorAnalysis" object, state which site provided the better user experience ('Your Site', 'Competitor Site', or 'Tie') and provide a clear, concise reason for your decision.
2.  **Analyze "Your Site":** Provide a standard UX analysis for this site (as "yourSiteAnalysis") including a high-level summary, a list of specific issues (with severity and recommendations), and one-sentence feedback from each persona.
3.  **Analyze "Competitor Site":** Provide the same standard UX analysis for the competitor's site (as "competitorSiteAnalysis").

Frame all issues as design flaws, not user errors.

Your Site Logs: ${JSON.stringify(yourSiteResults, null, 2)}
Competitor Site Logs: ${JSON.stringify(competitorSiteResults, null, 2)}

Provide the entire output as a single JSON object.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        competitorAnalysis: {
                            type: Type.OBJECT,
                            properties: {
                                winner: { type: Type.STRING, enum: ['Your Site', 'Competitor Site', 'Tie'] },
                                reason: { type: Type.STRING },
                            },
                            required: ['winner', 'reason'],
                        },
                        // The original `analyzeResults` schema is nested for the main site
                        summary: { type: Type.STRING },
                        issues: singleSiteAnalysisSchema.properties.issues,
                        personaFeedback: singleSiteAnalysisSchema.properties.personaFeedback,
                        // The same schema is duplicated for the competitor site
                        competitorSiteAnalysis: singleSiteAnalysisSchema,
                    },
                    required: ["summary", "issues", "personaFeedback", "competitorSiteAnalysis", "competitorAnalysis"],
                },
            },
        });
        const analysisJson = JSON.parse(response.text);
        return analysisJson as AnalysisResult;
    } catch (error) {
        console.error("Error analyzing competitor results:", error);
        throw new Error("Failed to analyze competitor results.");
    }
};


export const summarizeFrictionPoints = async (sessionResults: SessionResult[]): Promise<FrictionSummary> => {
    try {
        const thoughtsLog = sessionResults.map(r => ({
            persona: r.persona.name,
            thoughts: r.steps.map(s => s.thought)
        }));

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `As a UX expert, analyze the following "think aloud" logs from user persona simulations.
            Logs: ${JSON.stringify(thoughtsLog, null, 2)}
            
            Based on these logs, do two things:
            1. Write a brief summary of the key friction points or areas of confusion encountered by the users.
            2. Provide a single, actionable, natural language suggestion for improving the user interface.
            
            Provide the output as a JSON object.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        frictionSummary: { 
                            type: Type.STRING,
                            description: "A brief summary of the key friction points."
                        },
                        suggestion: {
                            type: Type.STRING,
                            description: "A single, actionable suggestion for improvement."
                        }
                    },
                    required: ["frictionSummary", "suggestion"],
                },
            },
        });
        const summaryJson = JSON.parse(response.text);
        return { summary: summaryJson.frictionSummary, suggestion: summaryJson.suggestion };
    } catch (error) {
        console.error("Error summarizing friction points:", error);
        throw new Error("Failed to generate friction summary.");
    }
};

export const generateHistorySummary = async (
    task: string, 
    results: SessionResult[]
): Promise<{ title: string }> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze the following user simulation results for the task: "${task}".
            
            Results:
            ${JSON.stringify(results.map(r => ({ persona: r.persona.name, completed: r.completed, thoughts: r.steps.map(s => s.thought).slice(0, 2) })), null, 2)}

            Based on this, generate:
            1.  A short, concise title for this simulation test (max 5 words).

            Provide the output as a JSON object.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                    },
                    required: ["title"],
                },
            },
        });
        const summaryJson = JSON.parse(response.text);
        return summaryJson as { title: string };
    } catch (error) {
        console.error("Error generating history summary:", error);
        throw new Error("Failed to generate history summary.");
    }
};