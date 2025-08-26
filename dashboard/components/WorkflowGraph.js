import React from 'react';
import ReactFlow, { Controls, Background, MiniMap, Handle } from 'reactflow';
import 'reactflow/dist/style.css';

// Custom node component for rich agent info
function AgentNode({ data }) {
  return (
    <div style={{
      borderRadius: 14,
      border: data.error ? '2px solid #e57373' : '2px solid #90caf9',
      background: data.error ? '#ffebee' : '#e3f2fd',
      boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
      padding: 16,
      minWidth: 220,
      fontFamily: 'Inter, sans-serif',
      position: 'relative',
    }}>
      <Handle type="target" position="top" style={{ background: '#1976d2', width: 12, height: 12, borderRadius: 6 }} />
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4, color: data.error ? '#e57373' : '#1976d2' }}>{data.agent_name}</div>
      <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>{data.protocol_type} | {data.status}</div>
      <div style={{ fontSize: 13, marginBottom: 6 }}><strong>Input:</strong> {data.input_payload}</div>
      <div style={{ fontSize: 13, marginBottom: 6 }}><strong>Output:</strong> {data.output_payload}</div>
      {data.error && (
        <div style={{ fontSize: 13, color: '#e57373', marginBottom: 6 }}><strong>Error:</strong> {data.error.message}</div>
      )}
      <div style={{ fontSize: 12, color: '#aaa' }}><strong>Span ID:</strong> {data.span_id}</div>
      <Handle type="source" position="bottom" style={{ background: '#1976d2', width: 12, height: 12, borderRadius: 6 }} />
    </div>
  );
}

// Utility to convert trace data to React Flow nodes/edges
function traceToGraph(trace) {
  if (!trace || !trace.spans) return { nodes: [], edges: [] };
  // Simple vertical layout for demo
  const yStep = 120;
  const nodes = trace.spans.map((span, i) => ({
    id: span.span_id,
    type: 'agentNode',
    data: {
      ...span
    },
    position: { x: 100 + i * 240, y: 60 + i * yStep },
  }));
  const edges = trace.spans
    .filter(span => span.parent_id)
    .map(span => ({
      id: `${span.parent_id}->${span.span_id}`,
      source: span.parent_id,
      target: span.span_id,
      animated: !!span.error,
      style: { stroke: span.error ? '#e57373' : '#1976d2', strokeWidth: 2 },
      markerEnd: {
        type: 'arrowclosed',
        color: span.error ? '#e57373' : '#1976d2',
      },
    }));
  return { nodes, edges };
}

const nodeTypes = { agentNode: AgentNode };

const WorkflowGraph = ({ trace, onNodeClick }) => {
  const { nodes, edges } = traceToGraph(trace);
  return (
    <div style={{ height: 520, width: '100%', borderRadius: 16, background: '#fafbfc', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', padding: 8 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        onNodeClick={(_, node) => onNodeClick && onNodeClick(node)}
        defaultEdgeOptions={{ type: 'smoothstep', markerEnd: { type: 'arrowclosed' } }}
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <MiniMap nodeColor={n => n.data.error ? '#e57373' : '#90caf9'} style={{ borderRadius: 8 }} />
        <Controls />
        <Background color="#e3f2fd" gap={16} />
      </ReactFlow>
    </div>
  );
};

export default WorkflowGraph;
