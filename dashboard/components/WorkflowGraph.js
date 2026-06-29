import React, { useMemo } from 'react';
import ReactFlow, { Controls, Background, MiniMap, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';

// Custom node component for rich agent info
function AgentNode({ data, selected }) {
  const isError = data.error;

  return (
    <div className="animate-fade-in" style={{
      borderRadius: 'var(--radius-md)',
      border: isError ? '1px solid var(--error-color)' : (selected ? '2px solid var(--primary-color)' : '1px solid var(--border-color)'),
      background: 'var(--surface-color)',
      boxShadow: selected ? '0 0 0 4px var(--primary-light)' : 'var(--shadow-sm)',
      padding: '16px',
      minWidth: '240px',
      maxWidth: '300px',
      fontFamily: 'Inter, sans-serif',
      position: 'relative',
      transition: 'all 0.2s',
      cursor: 'pointer',
    }}>
      <Handle
        type="target"
        position={Position.Top}
        style={{
            background: isError ? 'var(--error-color)' : 'var(--primary-color)',
            width: 10, height: 10,
            border: '2px solid white'
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: isError ? 'var(--error-color)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              {isError ? '🔴' : '🟢'} {data.agent_name}
          </div>
          <span className="mono" style={{
              fontSize: 10,
              background: '#f1f5f9',
              padding: '2px 6px',
              borderRadius: 4,
              color: 'var(--text-secondary)',
              fontWeight: 500
          }}>{data.protocol_type}</span>
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
              <strong style={{color: 'var(--text-primary)'}}>In:</strong> {data.input_payload !== 'N/A' ? data.input_payload : <span style={{color: 'var(--text-muted)'}}>N/A</span>}
          </div>
          <div style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
              <strong style={{color: 'var(--text-primary)'}}>Out:</strong> {data.output_payload !== 'N/A' ? data.output_payload : <span style={{color: 'var(--text-muted)'}}>N/A</span>}
          </div>
      </div>

      {isError && (
        <div style={{
            fontSize: 11,
            color: 'var(--error-color)',
            background: 'var(--error-bg)',
            padding: '6px 8px',
            borderRadius: 4,
            border: '1px solid var(--error-border)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
        }}>
            <strong>Err:</strong> {data.error.message}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
            background: isError ? 'var(--error-color)' : 'var(--primary-color)',
            width: 10, height: 10,
            border: '2px solid white'
        }}
      />
    </div>
  );
}

function traceToGraph(trace) {
  if (!trace || !trace.spans) return { nodes: [], edges: [] };

  // Build a basic hierarchy map to compute x, y better
  // In demo trace, we don't have explicit parent_id, but we have 'indent'
  // Let's create a fake parent_id based on indent to show edges if none exist
  let processedSpans = [...trace.spans];

  // Try to synthesize edges if parent_id is missing but indent implies it (for the demo)
  for (let i = 1; i < processedSpans.length; i++) {
      if (!processedSpans[i].parent_id) {
          // Find the closest previous span with a smaller indent
          for (let j = i - 1; j >= 0; j--) {
              if (processedSpans[j].indent < processedSpans[i].indent) {
                  processedSpans[i].parent_id = processedSpans[j].span_id;
                  break;
              }
          }
      }
  }

  // Layout params
  const levelHeights = {};
  const nodes = processedSpans.map((span) => {
    const level = span.indent;
    levelHeights[level] = (levelHeights[level] || 0) + 1;

    // Stagger x based on how many siblings at this level, and base x on parent
    let xOffset = level * 200 + (levelHeights[level] * 50);
    // Let's just do a simple tree layout mapping

    return {
      id: span.span_id,
      type: 'agentNode',
      data: { ...span },
      position: { x: levelHeights[level] * 300 - 150, y: level * 160 + 50 },
    };
  });

  const edges = processedSpans
    .filter(span => span.parent_id)
    .map(span => ({
      id: `e${span.parent_id}-${span.span_id}`,
      source: span.parent_id,
      target: span.span_id,
      animated: !!span.error,
      style: {
          stroke: span.error ? 'var(--error-color)' : '#94a3b8',
          strokeWidth: 2,
          strokeDasharray: span.error ? '5,5' : 'none'
      },
      markerEnd: {
        type: 'arrowclosed',
        color: span.error ? 'var(--error-color)' : '#94a3b8',
      },
    }));

  return { nodes, edges };
}

const nodeTypes = { agentNode: AgentNode };

const WorkflowGraph = ({ trace, onNodeClick }) => {
  const { nodes, edges } = useMemo(() => traceToGraph(trace), [trace]);
  return (
    <div style={{ height: '400px', width: '100%', background: '#fafbfc' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        onNodeClick={(_, node) => onNodeClick && onNodeClick(node)}
        defaultEdgeOptions={{ type: 'smoothstep', markerEnd: { type: 'arrowclosed' } }}
        minZoom={0.5}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <MiniMap
            nodeColor={n => n.data.error ? 'var(--error-color)' : 'var(--primary-color)'}
            style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--surface-color)' }}
            maskColor="rgba(248, 250, 252, 0.7)"
        />
        <Controls showInteractive={false} style={{ display: 'flex', flexDirection: 'column', gap: 4, boxShadow: 'var(--shadow-md)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }} />
        <Background color="#cbd5e1" gap={20} size={1.5} />
      </ReactFlow>
    </div>
  );
};

export default WorkflowGraph;
