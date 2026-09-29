import React from 'react';
import type { ConversionStep } from '../algorithms/conversionEngine';
import { formatExpr } from '../algorithms/core';

interface Props {
  steps: ConversionStep[];
  currentStep: number;
}

export const ConversionSteps: React.FC<Props> = ({ steps, currentStep }) => {
  if (steps.length === 0) return null;
  const step = steps[currentStep];

  return (
    <div className="flex flex-col gap-4 text-sm h-full overflow-y-auto pr-2">
      <div className="bg-slate-900 border border-slate-700 rounded p-4 shadow-inner">
        <h3 className="font-bold text-blue-400 text-base mb-1">
          Step {currentStep + 1} of {steps.length}: {step.title}
        </h3>
        <p className="text-slate-400 mb-4">{step.description}</p>
        
        <div className="flex flex-col gap-2 font-mono text-base">
          {step.equations.map(eq => (
            <div 
              key={eq.state} 
              className={`p-2 rounded flex gap-2 ${step.highlightState === eq.state ? 'bg-blue-900/30 border border-blue-500/50' : 'bg-slate-800'}`}
            >
              <span className="font-bold text-slate-300 w-8">{eq.state}</span>
              <span className="text-slate-500">=</span>
              <span className="text-slate-200 break-all">{formatExpr(eq.expr)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
