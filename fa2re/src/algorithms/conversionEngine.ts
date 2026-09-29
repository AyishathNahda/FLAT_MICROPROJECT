import type { Automaton } from '../types/automaton';
import { generateEquations } from './equationGenerator';
import type { Equation } from './equationGenerator';
import { applyArden, substitute, simplify, formatExpr, buildUnion } from './core';
import type { RegexExpr } from './core';

export type ConversionStep = {
  title: string;
  description: string;
  equations: Equation[];
  highlightState?: string;
  finalRegex?: string;
};

export function runConversion(automaton: Automaton): ConversionStep[] {
  const steps: ConversionStep[] = [];
  const stateIds = automaton.states.map(s => s.id);
  
  if (stateIds.length === 0 || automaton.finalStates.length === 0) {
    return [];
  }

  let currentEquations = generateEquations(automaton);
  
  steps.push({
    title: 'Generate State Equations',
    description: 'Create an equation for each state using its incoming transitions. The initial state receives ε.',
    equations: JSON.parse(JSON.stringify(currentEquations)) // deep copy representation not perfect but we only store static snapshots ideally. Wait, JSON.stringify doesn't work well if we have functions, but we just have plain objects.
  });

  const deepCopy = (eqs: Equation[]): Equation[] => JSON.parse(JSON.stringify(eqs));

  // For a general DFA to Regex, we eliminate states one by one.
  // We can solve equations from state 0 to N-1.
  for (let i = 0; i < stateIds.length; i++) {
    const targetState = stateIds[i];

    // 1. If the equation has self-reference, apply Arden
    let eqIndex = currentEquations.findIndex(e => e.state === targetState);
    if (eqIndex !== -1) {
      const eq = currentEquations[eqIndex];
      const simplified = simplify(eq.expr);
      const ardenApplied = applyArden(simplified, targetState);
      
      if (ardenApplied && JSON.stringify(ardenApplied) !== JSON.stringify(simplified)) {
        currentEquations[eqIndex] = { state: targetState, expr: simplify(ardenApplied) };
        steps.push({
          title: `Apply Arden's Theorem on ${targetState}`,
          description: `Applied R = QP* on state ${targetState}.`,
          equations: deepCopy(currentEquations),
          highlightState: targetState
        });
      } else if (JSON.stringify(simplified) !== JSON.stringify(eq.expr)) {
        currentEquations[eqIndex] = { state: targetState, expr: simplified };
      }
    }

    // 2. Substitute this targetState into all OTHER subsequent equations
    const targetEq = currentEquations.find(e => e.state === targetState);
    if (targetEq) {
      let substitutedAny = false;
      for (let j = i + 1; j < stateIds.length; j++) {
        const subState = stateIds[j];
        const subEqIndex = currentEquations.findIndex(e => e.state === subState);
        if (subEqIndex !== -1) {
          const subEq = currentEquations[subEqIndex];
          const newExpr = substitute(subEq.expr, targetState, targetEq.expr);
          if (JSON.stringify(newExpr) !== JSON.stringify(subEq.expr)) {
            currentEquations[subEqIndex] = { state: subState, expr: simplify(newExpr) };
            substitutedAny = true;
          }
        }
      }
      
      if (substitutedAny) {
        steps.push({
          title: `Substitute ${targetState}`,
          description: `Substituted the equation for ${targetState} into remaining states.`,
          equations: deepCopy(currentEquations),
          highlightState: targetState
        });
      }
    }
  }

  // Now, we have equations in terms of themselves or earlier states? Wait.
  // Standard Arden elimination:
  // If we process state 1, apply arden, substitute 1 into 2..N.
  // If we process state 2, apply arden, substitute 2 into 3..N.
  // At the end, state N depends only on itself (handled by Arden) and constants.
  // So state N is fully solved in terms of alphabet symbols.
  // But state N-1 depends on state N (if there were backward edges)?
  // Ah! If there are backward edges, state 1 might depend on state 2.
  // If we just substitute i into i+1..N, state N is solved.
  // Then we have to back-substitute N into N-1..1.
  
  for (let i = stateIds.length - 1; i >= 0; i--) {
    const targetState = stateIds[i];
    const targetEq = currentEquations.find(e => e.state === targetState);
    if (targetEq) {
      let substitutedAny = false;
      for (let j = i - 1; j >= 0; j--) {
        const subState = stateIds[j];
        const subEqIndex = currentEquations.findIndex(e => e.state === subState);
        if (subEqIndex !== -1) {
          const subEq = currentEquations[subEqIndex];
          const newExpr = substitute(subEq.expr, targetState, targetEq.expr);
          if (JSON.stringify(newExpr) !== JSON.stringify(subEq.expr)) {
            currentEquations[subEqIndex] = { state: subState, expr: simplify(newExpr) };
            substitutedAny = true;
          }
        }
      }
      if (substitutedAny) {
        steps.push({
          title: `Back-substitute ${targetState}`,
          description: `Substituted the solved equation for ${targetState} back into earlier states.`,
          equations: deepCopy(currentEquations),
          highlightState: targetState
        });
      }
      
      // We might need to re-apply Arden or simplify after back-subbing, though typically it's already solved.
      const currentEq = currentEquations.find(e => e.state === targetState);
      if (currentEq) {
        const furtherSimplified = simplify(currentEq.expr);
        const eqIdx = currentEquations.findIndex(e => e.state === targetState);
        currentEquations[eqIdx] = { state: targetState, expr: furtherSimplified };
      }
    }
  }

  // Final regex is union of all final states.
  const finalStateExprs: RegexExpr[] = [];
  for (const f of automaton.finalStates) {
    const eq = currentEquations.find(e => e.state === f);
    if (eq) finalStateExprs.push(eq.expr);
  }

  let finalExpr = buildUnion(finalStateExprs);
  finalExpr = simplify(finalExpr);
  
  const finalRegexStr = formatExpr(finalExpr);

  steps.push({
    title: 'Final Expression',
    description: 'The final regular expression is obtained by combining the solved equations of the final states.',
    equations: deepCopy(currentEquations),
    finalRegex: finalRegexStr
  });

  return steps;
}
