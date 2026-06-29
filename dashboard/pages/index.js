import { useState } from 'react';
import demoTrace from '../demo-trace.json';
import dynamic from 'next/dynamic';
const WorkflowGraph = dynamic(() => import('../components/WorkflowGraph'), { ssr: false });

function TraceSpan({ span, onClick, selected }) {
  const isError = span.status !== 'success';
  // Use tree branch symbols for hierarchy
  const branch = span.indent === 0 ? '' : (span.isLast ? '└─' : '├─');
  return (
    <div
      style={{
        marginLeft: span.indent * 24,
        padding: '8px',
        borderLeft: isError ? '4px solid #e00' : '4px solid #0a0',
        background: selected ? '#f5f5f5' : 'white',
        cursor: 'pointer',
        fontFamily: 'monospace',
        display: 'flex',
        alignItems: 'center',
      }}
      onClick={onClick}
    >
      <span style={{marginRight: 8, color: '#888'}}>{branch}</span>
      <strong>{span.agent_name}</strong> <span style={{color: isError ? '#e00' : '#0a0'}}>{isError ? '✗' : '✓'}</span>
      <span style={{marginLeft: 8, fontSize: 12, color: '#888'}}>[{span.protocol_type}]</span>
      <span style={{marginLeft: 8, fontSize: 12}}>{span.status}</span>
    </div>
  );
}

function filterSpans(spans, query) {
  if (!query) return spans;
  const q = query.toLowerCase();
  return spans.filter(span =>
    span.agent_name.toLowerCase().includes(q) ||
    (span.error && JSON.stringify(span.error).toLowerCase().includes(q))
  );
}

export default function Home() {
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  // Compute isLast for call hierarchy
  const spans = filterSpans(demoTrace.spans, search).map((span, i, arr) => ({
    ...span,
    isLast: i === arr.length - 1 || arr[i + 1].indent < span.indent
  }));
  // Find selected span by id (for graph click)
  const selectedSpan = selectedId !== null ? spans.find(s => s.span_id === selectedId) : null;
  return (
    <div style={{maxWidth: 900, margin: '40px auto', fontFamily: 'Inter, sans-serif', background: '#f6f8fa', borderRadius: 18, boxShadow: '0 8px 32px rgba(0,0,0,0.07)', padding: 32}}>
      <h2 style={{fontWeight: 700, fontSize: 28, marginBottom: 8, color: '#222'}}>PrismTrace: Multi-Agent Workflow Visualization</h2>
      <p style={{color: '#666', marginBottom: 24}}>Instantly debug and visualize agent workflows, errors, and LLM calls. Click nodes or spans for details.</p>
      <WorkflowGraph trace={demoTrace} searchQuery={search} onNodeClick={node => {
        setSelectedId(node.id);
      }} />
      <div style={{margin: '32px 0 24px 0'}}>
        <input
          type="text"
          placeholder="Filter by agent or error..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{marginBottom: 16, padding: 10, width: '100%', fontSize: 17, borderRadius: 8, border: '1px solid #e0e0e0', boxShadow: '0 1px 4px rgba(0,0,0,0.03)'}}
        />
        <div>
          {spans.map((span) => (
            <TraceSpan
              key={span.span_id}
              span={span}
              selected={selectedId === span.span_id}
              onClick={() => setSelectedId(span.span_id)}
            />
          ))}
        </div>
      </div>
      {selectedSpan && (
        <div style={{border: '1px solid #eee', padding: 20, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: 16}}>
          <h3 style={{color: selectedSpan.error ? '#e57373' : '#1976d2', marginBottom: 8}}>
            {selectedSpan.agent_name} {selectedSpan.error ? 'Error' : 'Details'}
          </h3>
          {selectedSpan.error && (
            <>
              <h4 style={{margin: '8px 0 4px 0'}}>Error</h4>
              <pre style={{color: '#e00', background: '#ffebee', padding: 8, borderRadius: 6}}>{JSON.stringify(selectedSpan.error, null, 2)}</pre>
            </>
          )}
          <h4 style={{margin: '8px 0 4px 0'}}>LLM Input</h4>
          <pre style={{background: '#f5f5f5', padding: 8, borderRadius: 6}}>{selectedSpan.input_payload}</pre>
          <h4 style={{margin: '8px 0 4px 0'}}>LLM Output</h4>
          <pre style={{background: '#f5f5f5', padding: 8, borderRadius: 6}}>{selectedSpan.output_payload}</pre>
          <h4 style={{margin: '8px 0 4px 0'}}>Protocol</h4>
          <pre style={{background: '#f5f5f5', padding: 8, borderRadius: 6}}>{selectedSpan.protocol_type}</pre>
          <h4 style={{margin: '8px 0 4px 0'}}>Model</h4>
          <pre style={{background: '#f5f5f5', padding: 8, borderRadius: 6}}>{selectedSpan.llm_model_name || 'N/A'}</pre>
        </div>
      )}
      <footer style={{marginTop: 40, fontSize: 13, color: '#888'}}>Demo trace data preloaded for instant YC experience.</footer>
    </div>
  );
}
