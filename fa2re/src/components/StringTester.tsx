import React, { useState } from 'react';

interface Props {
  finalRegex?: string;
}

export const StringTester: React.FC<Props> = ({ finalRegex }) => {
  const [testString, setTestString] = useState('');
  const [result, setResult] = useState<boolean | null>(null);

  const testMatch = () => {
    if (!finalRegex) return;
    try {
      // In a real app we might transpile the FLAT regex format to JS regex.
      // E.g. replace 'ε' with '', replace '+' with '|'
      let jsRegexStr = finalRegex.replace(/ε/g, '').replace(/\+/g, '|').replace(/∅/g, '(?!)');
      // For testing full strings, add anchors
      jsRegexStr = `^${jsRegexStr}$`;
      const regex = new RegExp(jsRegexStr);
      setResult(regex.test(testString));
    } catch (e) {
      console.warn("Regex compilation failed for testing:", e);
      setResult(false);
    }
  };

  if (!finalRegex) return null;

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex flex-col gap-4">
      <h2 className="font-semibold text-slate-300 border-b border-slate-700 pb-2">Test String</h2>
      
      <div className="flex gap-2">
        <input 
          value={testString}
          onChange={e => {
            setTestString(e.target.value);
            setResult(null);
          }}
          placeholder="Enter string (e.g. 0101)"
          className="bg-slate-900 border border-slate-700 rounded px-3 py-2 flex-1 font-mono text-slate-200"
        />
        <button 
          onClick={testMatch}
          className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded font-semibold"
        >
          Test
        </button>
      </div>

      {result !== null && (
        <div className={`p-3 rounded flex items-center gap-2 font-bold ${result ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
          {result ? '✓ Accepted' : '✗ Rejected'}
        </div>
      )}
    </div>
  );
};
