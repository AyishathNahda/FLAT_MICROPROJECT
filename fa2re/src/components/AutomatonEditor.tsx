import { useState } from 'react';
import type { Automaton } from '../types/automaton';
import { examples } from '../data/examples';

interface Props {
  automaton: Automaton;
  onChange: (a: Automaton) => void;
  onGenerate: () => void;
}

export const AutomatonEditor: React.FC<Props> = ({ automaton, onChange, onGenerate }) => {
  const [newStateName, setNewStateName] = useState('');
  const [newSymbol, setNewSymbol] = useState('');
  
  const [transFrom, setTransFrom] = useState('');
  const [transTo, setTransTo] = useState('');
  const [transSym, setTransSym] = useState('');

  const update = (patch: Partial<Automaton>) => {
    onChange({ ...automaton, ...patch });
  };

  const addState = () => {
    if (!newStateName) return;
    if (automaton.states.find(s => s.id === newStateName)) return;
    update({ states: [...automaton.states, { id: newStateName, name: newStateName }] });
    setNewStateName('');
  };

  const removeState = (id: string) => {
    update({
      states: automaton.states.filter(s => s.id !== id),
      transitions: automaton.transitions.filter(t => t.from !== id && t.to !== id),
      finalStates: automaton.finalStates.filter(s => s !== id),
      initialState: automaton.initialState === id ? '' : automaton.initialState
    });
  };

  const addSymbol = () => {
    if (!newSymbol || automaton.alphabet.includes(newSymbol)) return;
    update({ alphabet: [...automaton.alphabet, newSymbol] });
    setNewSymbol('');
  };

  const addTransition = () => {
    if (!transFrom || !transTo || !transSym) return;
    const newId = `t${Date.now()}`;
    update({
      transitions: [...automaton.transitions, { id: newId, from: transFrom, to: transTo, symbol: transSym }]
    });
  };

  return (
    <div className="flex flex-col gap-6 text-base">
      <div className="flex items-center gap-2 border-b border-slate-700 pb-4">
        <label className="text-slate-400 text-sm font-semibold uppercase tracking-wide">Load Example (Optional):</label>
        <select 
          className="bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-600 outline-none focus:border-blue-500"
          onChange={e => {
            const ex = examples.find(ex => ex.name === e.target.value);
            if (ex) onChange(ex.automaton);
          }}
          value=""
        >
          <option value="" disabled>Select an example...</option>
          {examples.map(ex => (
            <option key={ex.name} value={ex.name}>{ex.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-slate-300">States</h3>
          <div className="flex gap-2">
            <input 
              value={newStateName} onChange={e => setNewStateName(e.target.value)} 
              placeholder="State name (e.g. A)" className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 w-full outline-none focus:border-blue-500"
            />
            <button onClick={addState} className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg font-semibold shrink-0">Add</button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {automaton.states.map(s => (
              <span key={s.id} className="bg-blue-900/40 text-blue-300 border border-blue-700/50 px-3 py-1 rounded-full flex items-center gap-2">
                {s.name} <button onClick={() => removeState(s.id)} className="text-blue-400 hover:text-blue-200 font-bold">×</button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-slate-300">Alphabet</h3>
          <div className="flex gap-2">
            <input 
              value={newSymbol} onChange={e => setNewSymbol(e.target.value)} 
              placeholder="Symbol (e.g. 0)" className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 w-full outline-none focus:border-blue-500"
            />
            <button onClick={addSymbol} className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg font-semibold shrink-0">Add</button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {automaton.alphabet.map(a => (
              <span key={a} className="bg-purple-900/40 text-purple-300 border border-purple-700/50 px-3 py-1 rounded-full flex items-center gap-2">
                {a} <button onClick={() => update({ alphabet: automaton.alphabet.filter(x => x !== a) })} className="text-purple-400 hover:text-purple-200 font-bold">×</button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-slate-300">Start State</h3>
          <select 
            value={automaton.initialState} 
            onChange={e => update({ initialState: e.target.value })}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
          >
            <option value="">Select...</option>
            {automaton.states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-slate-300">Final States</h3>
          <select 
            onChange={e => {
              const v = e.target.value;
              if (v && !automaton.finalStates.includes(v)) {
                update({ finalStates: [...automaton.finalStates, v] });
              }
            }}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
            value=""
          >
            <option value="">Add Final State...</option>
            {automaton.states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <div className="flex flex-wrap gap-2 mt-1">
            {automaton.finalStates.map(fs => (
              <span key={fs} className="bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                {fs} <button onClick={() => update({ finalStates: automaton.finalStates.filter(x => x !== fs) })} className="text-emerald-400 hover:text-emerald-200 font-bold">×</button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-slate-300">Transitions</h3>
        
        {/* Transition Table Header */}
        <div className="grid grid-cols-4 gap-4 px-4 py-2 bg-slate-800 rounded-t-lg font-semibold text-slate-400 border border-slate-700 border-b-0">
          <div>From</div>
          <div>Symbol</div>
          <div>To</div>
          <div className="text-right">Action</div>
        </div>
        
        {/* Transition Table Body */}
        <div className="flex flex-col border border-slate-700 rounded-b-lg overflow-hidden bg-slate-900">
          {automaton.transitions.length === 0 ? (
            <div className="px-4 py-6 text-center text-slate-500 italic">No transitions added yet.</div>
          ) : (
            automaton.transitions.map((t, idx) => (
              <div key={t.id} className={`grid grid-cols-4 gap-4 px-4 py-3 items-center ${idx % 2 === 0 ? 'bg-slate-800/30' : 'bg-transparent'} border-b border-slate-700/50 last:border-0`}>
                <div className="font-mono text-slate-300">{t.from}</div>
                <div className="font-mono text-blue-300">{t.symbol}</div>
                <div className="font-mono text-slate-300">{t.to}</div>
                <div className="text-right">
                  <button onClick={() => update({ transitions: automaton.transitions.filter(x => x.id !== t.id) })} className="text-red-400 hover:text-red-300 hover:bg-red-900/30 px-3 py-1 rounded transition-colors">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Transition Form */}
        <div className="grid grid-cols-4 gap-4 mt-2">
          <select value={transFrom} onChange={e => setTransFrom(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500">
            <option value="">From State...</option>
            {automaton.states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={transSym} onChange={e => setTransSym(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500">
            <option value="">Symbol...</option>
            {automaton.alphabet.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select value={transTo} onChange={e => setTransTo(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500">
            <option value="">To State...</option>
            {automaton.states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button onClick={addTransition} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg transition-colors shadow-md">
            + Add
          </button>
        </div>
      </div>

      <div className="mt-8">
        <button 
          onClick={onGenerate} 
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xl py-5 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 hover:shadow-xl uppercase tracking-widest"
        >
          Convert To Regular Expression
        </button>
      </div>
    </div>
  );
};
