import { useState } from 'react';
import demoTrace from '../demo-trace.json';

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
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  // Compute isLast for call hierarchy
  const spans = filterSpans(demoTrace.spans, search).map((span, i, arr) => ({
    ...span,
    isLast: i === arr.length - 1 || arr[i + 1].indent < span.indent
  }));
  return (
    <div style={{maxWidth: 700, margin: '40px auto', fontFamily: 'sans-serif'}}>
      <h2>PrismTrace Demo: Debugging a failed Groq/Gemini LLM call.</h2>
      <input
        type="text"
        placeholder="Filter by agent or error..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{marginBottom: 16, padding: 8, width: '100%', fontSize: 16}}
      />
      <div style={{marginBottom: 24}}>
        {spans.map((span, i) => (
          <TraceSpan
            key={span.span_id}
            span={span}
            selected={selected === i}
            onClick={() => setSelected(i)}
          />
        ))}
      </div>
      {selected !== null && (
        <div style={{border: '1px solid #eee', padding: 16, background: '#fff'}}>
          <h4>Error Details</h4>
          <pre style={{color: '#e00'}}>{spans[selected].error ? JSON.stringify(spans[selected].error, null, 2) : 'No error'}</pre>
          <h4>LLM Input</h4>
          <pre>{spans[selected].input_payload}</pre>
          <h4>LLM Output</h4>
          <pre>{spans[selected].output_payload}</pre>
          <h4>Protocol</h4>
          <pre>{spans[selected].protocol_type}</pre>
          <h4>Model</h4>
          <pre>{spans[selected].llm_model_name || 'N/A'}</pre>
        </div>
      )}
      <footer style={{marginTop: 40, fontSize: 13, color: '#888'}}>Demo trace data preloaded for instant YC experience.</footer>
    </div>
  );
}
