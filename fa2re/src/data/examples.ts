import type { Automaton } from '../types/automaton';

export const examples: { name: string; automaton: Automaton }[] = [
  {
    name: 'Example 1 (0(10)*)',
    automaton: {
      states: [
        { id: 'A', name: 'A' },
        { id: 'B', name: 'B' }
      ],
      alphabet: ['0', '1'],
      initialState: 'A',
      finalStates: ['B'],
      transitions: [
        { id: 't1', from: 'A', to: 'B', symbol: '0' },
        { id: 't2', from: 'B', to: 'A', symbol: '1' }
      ]
    }
  },
  {
    name: 'Example 2 ((b+aa)a*)',
    automaton: {
      states: [
        { id: 'q1', name: 'q1' },
        { id: 'q2', name: 'q2' },
        { id: 'q3', name: 'q3' }
      ],
      alphabet: ['a', 'b'],
      initialState: 'q1',
      finalStates: ['q3'],
      transitions: [
        { id: 't1', from: 'q1', to: 'q2', symbol: 'a' },
        { id: 't2', from: 'q1', to: 'q3', symbol: 'b' },
        { id: 't3', from: 'q2', to: 'q3', symbol: 'a' },
        { id: 't4', from: 'q3', to: 'q3', symbol: 'a' }
      ]
    }
  },
  {
    name: 'Example 3 (Simple Loop)',
    automaton: {
      states: [
        { id: 'S0', name: 'S0' },
        { id: 'S1', name: 'S1' }
      ],
      alphabet: ['0', '1'],
      initialState: 'S0',
      finalStates: ['S1'],
      transitions: [
        { id: 't1', from: 'S0', to: 'S1', symbol: '0' },
        { id: 't2', from: 'S0', to: 'S0', symbol: '1' },
        { id: 't3', from: 'S1', to: 'S0', symbol: '0' },
        { id: 't4', from: 'S1', to: 'S1', symbol: '1' }
      ]
    }
  }
];
