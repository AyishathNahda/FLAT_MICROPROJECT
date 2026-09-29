import type { Automaton } from '../types/automaton';
import { buildUnion } from './core';
import type { RegexExpr } from './core';

export type Equation = {
  state: string;
  expr: RegexExpr;
};

export function generateEquations(automaton: Automaton): Equation[] {
  const equations: Equation[] = [];

  for (const state of automaton.states) {
    const incoming = automaton.transitions.filter(t => t.to === state.id);
    const terms: RegexExpr[] = [];

    if (state.id === automaton.initialState) {
      terms.push({ type: 'epsilon' });
    }

    for (const t of incoming) {
      terms.push({
        type: 'concat',
        left: { type: 'state', name: t.from },
        right: { type: 'symbol', value: t.symbol }
      });
    }

    equations.push({
      state: state.id,
      expr: buildUnion(terms)
    });
  }

  return equations;
}
