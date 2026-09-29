import React, { useEffect } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  MarkerType,
  Background,
  Controls
} from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { Automaton } from '../types/automaton';

interface Props {
  automaton: Automaton;
}

export const AutomatonGraph: React.FC<Props> = ({ automaton }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    // Generate nodes and edges
    const newNodes = automaton.states.map((s, i) => {
      const isInitial = s.id === automaton.initialState;
      const isFinal = automaton.finalStates.includes(s.id);
      
      let label = s.name;
      if (isInitial) label = '→ ' + label;
      if (isFinal) label = '((' + label + '))';

      return {
        id: s.id,
        position: { x: i * 150 + 50, y: 100 }, // Simple layout
        data: { label },
        style: {
          backgroundColor: isFinal ? '#1e293b' : '#334155',
          color: '#e2e8f0',
          border: isFinal ? '2px solid #3b82f6' : '1px solid #475569',
          borderRadius: isFinal ? '20px' : '5px' // Just some distinctive style
        }
      };
    });

    // Group transitions by from-to pair to combine labels
    const edgeMap = new Map<string, string[]>();
    automaton.transitions.forEach(t => {
      const key = `${t.from}->${t.to}`;
      if (!edgeMap.has(key)) edgeMap.set(key, []);
      edgeMap.get(key)!.push(t.symbol);
    });

    const newEdges = Array.from(edgeMap.entries()).map(([key, symbols]) => {
      const [from, to] = key.split('->');
      return {
        id: `e-${key}`,
        source: from,
        target: to,
        label: symbols.join(', '),
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#94a3b8' },
        labelStyle: { fill: '#cbd5e1', fontWeight: 'bold' }
      };
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [automaton, setNodes, setEdges]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};
