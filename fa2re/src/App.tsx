import { useState } from 'react';
import { AutomatonEditor } from './components/AutomatonEditor';
import { AutomatonGraph } from './components/AutomatonGraph';
import { ConversionSteps } from './components/ConversionSteps';
import { StringTester } from './components/StringTester';
import type { Automaton } from './types/automaton';
import { runConversion } from './algorithms/conversionEngine';
import type { ConversionStep } from './algorithms/conversionEngine';

const initialAutomaton: Automaton = {
  states: [],
  alphabet: [],
  transitions: [],
  initialState: '',
  finalStates: []
};

function App() {
  const [automaton, setAutomaton] = useState<Automaton>(initialAutomaton);
  const [steps, setSteps] = useState<ConversionStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showGraph, setShowGraph] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  const handleGenerate = () => {
    // Basic validation
    if (automaton.states.length === 0) return alert("Please add at least one state.");
    if (!automaton.initialState) return alert("Please select a start state.");
    if (automaton.finalStates.length === 0) return alert("Please select at least one final state.");
    
    // Check for epsilons (not supported)
    for (const t of automaton.transitions) {
      if (t.symbol === 'ε') {
        return alert("ε-transitions are not supported in this version.");
      }
      if (!automaton.alphabet.includes(t.symbol)) {
        return alert(`Transition symbol '${t.symbol}' is not part of the alphabet.`);
      }
      if (!automaton.states.find(s => s.id === t.from) || !automaton.states.find(s => s.id === t.to)) {
        return alert("Transition refers to an unknown state.");
      }
    }

    try {
      const resultSteps = runConversion(automaton);
      setSteps(resultSteps);
      // Immediately go to final step for the converter workflow
      setCurrentStep(resultSteps.length - 1);
      setShowSteps(false);
    } catch (e) {
      alert("An error occurred during conversion. Please check your automaton.");
      console.error(e);
    }
  };

  const handleReset = () => {
    setAutomaton(initialAutomaton);
    setSteps([]);
    setCurrentStep(0);
    setShowGraph(false);
    setShowSteps(false);
  };

  const finalRegex = steps.length > 0 ? steps[steps.length - 1].finalRegex : undefined;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900 p-6 flex flex-col gap-2 items-center text-center shadow-md">
        <h1 className="text-3xl font-black text-blue-500 tracking-tight">FA2RE</h1>
        <p className="text-lg text-slate-300 font-medium">Finite Automaton → Regular Expression</p>
        <p className="text-sm text-slate-400">Arden's Theorem Based Converter</p>
      </header>

      <main className="flex-1 p-6 flex flex-col gap-6 max-w-[1000px] mx-auto w-full">
        {/* Editor (Input Automaton) */}
        <section className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 flex flex-col gap-4 shadow-lg backdrop-blur-sm">
          <div className="flex justify-between items-center border-b border-slate-700 pb-3">
            <h2 className="font-bold text-slate-200 flex items-center gap-2 text-xl">
              INPUT FINITE AUTOMATON
            </h2>
            <button onClick={handleReset} className="text-sm px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold transition-colors">Reset</button>
          </div>
          
          <AutomatonEditor 
            automaton={automaton} 
            onChange={(a) => { setAutomaton(a); setSteps([]); }} 
            onGenerate={handleGenerate} 
          />

          <div className="pt-2 border-t border-slate-700/50 flex flex-col gap-2">
            <button 
              onClick={() => setShowGraph(!showGraph)}
              className="text-sm text-slate-400 hover:text-slate-300 self-start"
            >
              {showGraph ? 'Hide Graph ▲' : 'Show Graph ▼'}
            </button>
            {showGraph && (
              <div className="bg-slate-900/80 rounded-lg border border-slate-700 overflow-hidden relative h-[400px]">
                {automaton.states.length > 0 ? (
                  <AutomatonGraph automaton={automaton} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
                    Add states to see visualization
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Output Section */}
        {finalRegex && (
          <section className="bg-slate-800/80 rounded-xl p-6 border-2 border-amber-500/30 flex flex-col gap-4 shadow-lg shadow-amber-500/10 backdrop-blur-sm">
            <h2 className="font-bold text-slate-200 border-b border-slate-700 pb-3 flex items-center gap-2 text-xl">
              EQUIVALENT REGULAR EXPRESSION
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-4 py-4">
              <div className="flex-1 w-full bg-slate-900 border border-slate-700 rounded-lg p-6 flex items-center justify-center">
                <div className="text-3xl font-mono text-amber-400 break-all text-center font-bold">
                  {finalRegex}
                </div>
              </div>
              <button 
                onClick={() => navigator.clipboard.writeText(finalRegex)}
                className="bg-slate-700 hover:bg-slate-600 px-6 py-4 rounded-lg font-bold text-slate-200 uppercase tracking-wider h-full shrink-0"
              >
                Copy
              </button>
            </div>
            
            <StringTester finalRegex={finalRegex} />

            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <button 
                onClick={() => {
                  setShowSteps(!showSteps);
                  if (!showSteps) setCurrentStep(0);
                }}
                className="text-sm text-slate-400 hover:text-slate-300 font-bold uppercase tracking-wider"
              >
                {showSteps ? '▼ Hide Conversion Steps' : '▶ Show Conversion Steps'}
              </button>
              
              {showSteps && (
                <div className="mt-4 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-300">Mathematical Derivation</h3>
                    <div className="flex gap-2">
                      <button 
                        disabled={currentStep === 0}
                        onClick={() => setCurrentStep(c => Math.max(0, c - 1))}
                        className="text-sm px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded"
                      >
                        Previous
                      </button>
                      <button 
                        disabled={currentStep === steps.length - 1}
                        onClick={() => setCurrentStep(c => Math.min(steps.length - 1, c + 1))}
                        className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                  <div className="h-[300px]">
                    <ConversionSteps steps={steps} currentStep={currentStep} />
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
