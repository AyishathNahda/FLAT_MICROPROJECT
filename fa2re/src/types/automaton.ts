export type State = {
  id: string;
  name: string;
};

export type Transition = {
  id: string;
  from: string;
  to: string;
  symbol: string;
};

export type Automaton = {
  states: State[];
  alphabet: string[];
  transitions: Transition[];
  initialState: string;
  finalStates: string[];
};
