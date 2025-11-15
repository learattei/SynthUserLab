import React, { useState } from 'react';
import TrashIcon from './icons/TrashIcon';
import ArrowUpIcon from './icons/ArrowUpIcon';
import ArrowDownIcon from './icons/ArrowDownIcon';

interface PlanReviewProps {
    plan: string[];
    setPlan: (plan: string[]) => void;
    onRun: () => void;
    isSimulating: boolean;
}

const PlanReview: React.FC<PlanReviewProps> = ({ plan, setPlan, onRun, isSimulating }) => {
    const [newStep, setNewStep] = useState('');

    const handleAddStep = () => {
        if (newStep.trim()) {
            setPlan([...plan, newStep.trim()]);
            setNewStep('');
        }
    };
    
    const handleRemoveStep = (index: number) => {
        setPlan(plan.filter((_, i) => i !== index));
    };

    const handleMoveStep = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === plan.length - 1) return;
        
        const newSteps = [...plan];
        const item = newSteps.splice(index, 1)[0];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        newSteps.splice(newIndex, 0, item);
        setPlan(newSteps);
    };

    return (
        <div className="w-full max-w-3xl mx-auto animate-fade-in space-y-8">
            <header className="w-full text-center py-8">
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100">Review Test Plan</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-3 max-w-2xl mx-auto text-lg">
                    The AI has generated the following test plan. You can edit, reorder, or remove steps before running the simulation.
                </p>
            </header>

            <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl shadow-soft p-6">
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={newStep}
                        onChange={(e) => setNewStep(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddStep()}
                        className="flex-grow p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Add a new step..."
                        disabled={isSimulating}
                    />
                    <button onClick={handleAddStep} disabled={isSimulating || !newStep.trim()} className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600">Add Step</button>
                </div>
                
                <div className="mt-4 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[200px]">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">AI-Generated Plan</h3>
                    {plan.length === 0 ? (
                        <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">The test plan is empty.</p>
                    ) : (
                        <ol className="list-decimal list-inside space-y-2">
                            {plan.map((step, index) => (
                                <li key={index} className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 group">
                                    <span className="flex-grow text-slate-800 dark:text-slate-200">{step}</span>
                                    <button onClick={() => handleMoveStep(index, 'up')} disabled={index === 0} className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30"><ArrowUpIcon className="w-4 h-4" /></button>
                                    <button onClick={() => handleMoveStep(index, 'down')} disabled={index === plan.length - 1} className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30"><ArrowDownIcon className="w-4 h-4" /></button>
                                    <button onClick={() => handleRemoveStep(index)} className="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            </div>

            <div className="text-center pt-4">
                <button
                    onClick={onRun}
                    disabled={plan.length === 0 || isSimulating}
                    className="px-10 py-4 text-xl font-bold text-white bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-75 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:scale-100 duration-300 ease-in-out shadow-lg disabled:shadow-none"
                >
                    {isSimulating ? 'Running Simulation...' : `Run Simulation`}
                </button>
            </div>
        </div>
    );
};

export default PlanReview;