# FA2RE — Finite Automata to Regular Expression Visualizer

## Project Overview

FA2RE is an interactive educational visualizer that demonstrates the conversion of finite automata into equivalent regular expressions using Arden's Theorem. Users can create or select a finite automaton, visualize its states and transitions, generate state equations, observe symbolic substitution and Arden's Theorem step by step, and obtain the resulting regular expression. The application also provides a string tester to explore the language represented by the generated expression. The project is designed to make the mathematical conversion process in Formal Languages and Automata Theory easier to understand through interactive visualization.

## Problem Statement

Students often understand the individual components of finite automata and regular expressions but find the conversion process difficult to visualize. FA2RE makes the conversion process interactive.

## Objective

To demonstrate the conversion:

```
Finite Automaton
      ↓
State Equations
      ↓
Substitution
      ↓
Arden's Theorem
      ↓
Regular Expression
```

## FLAT Concept

Finite Automata → Regular Expression

## Arden's Theorem

Arden's Theorem provides a method for solving regular-expression equations of the form `R = Q + RP`. If `P` does not contain `ε`, the unique solution is `R = QP*`.

## Features

* Interactive automaton editor
* Automaton visualization
* Example automata
* Dynamic state-equation generation
* Symbolic substitution
* Arden's Theorem
* Step-by-step visualization
* Regular-expression generation
* String testing
* Documentation

## Architecture

The application is built with React, Vite, TypeScript, and Tailwind CSS. React Flow is used for the graph visualization. The state management is primarily driven by React hooks in `App.tsx`, invoking specialized algorithm files (`core.ts`, `equationGenerator.ts`, `conversionEngine.ts`) to compute each stage and capture immutable snapshots of the symbolic expressions. 

## Algorithm

1. Read automaton.
2. Generate state equations based on incoming transitions. The initial state is given an extra `ε`.
3. Eliminate states by substitution.
4. When a self-referencing equation is found (`R = Q + RP`), apply Arden's Theorem (`R = QP*`).
5. Back-substitute into earlier equations.
6. Simplify resulting expressions mathematically (e.g. `εR = R`, `R + ∅ = R`).
7. Combine solved equations of all final states.

## Complexity

Symbolic expression growth can become large. Practical complexity depends heavily on the structure of the automaton and the resulting expressions. The simplifier is kept lightweight so very large nested regexes might be generated.

## Limitations

1. Educational implementation
2. Limited symbolic simplification
3. Supported regex operators are limited
4. Large automata may produce complex expressions
5. Generated regex is not guaranteed to be minimal
6. Initial version focuses on DFA and ε-free NFA

## Future Scope

* ε-NFA support
* state elimination method
* regex → FA
* NFA → DFA
* expression tree visualization
* better symbolic simplification
* export automata
* shareable examples

## Setup and Deployment

```bash
npm install
npm run dev
npm run build
```

This project can easily be deployed on Vercel as a static frontend application.
