import { useState } from 'react';
import demoTrace from '../demo-trace.json';
import dynamic from 'next/dynamic';
import Head from 'next/head';
const WorkflowGraph = dynamic(() => import('../components/WorkflowGraph'), { ssr: false });

function TraceSpan({ span, onClick, selected }) {
  const isError = span.status !== 'success';
  const branch = span.indent === 0 ? '' : (span.isLast ? '└─' : '├─');

  return (
    <div
      className="animate-fade-in"
      style={{
        marginLeft: span.indent * 24,
        padding: '10px 14px',
        borderLeft: isError ? '4px solid var(--error-color)' : '4px solid var(--success-color)',
        background: selected ? (isError ? 'var(--error-bg)' : 'var(--primary-light)') : 'var(--surface-color)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-color)',
        borderTop: selected ? '1px solid var(--border-color)' : '1px solid transparent',
        transition: 'all 0.2s',
        borderTopLeftRadius: selected ? 0 : 0,
        borderBottomLeftRadius: selected ? 0 : 0,
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
          if(!selected) e.currentTarget.style.background = '#f1f5f9';
      }}
      onMouseLeave={(e) => {
          if(!selected) e.currentTarget.style.background = 'var(--surface-color)';
      }}
    >
      <span className="mono" style={{marginRight: 8, color: 'var(--text-muted)'}}>{branch}</span>
      <strong style={{
        fontSize: '14px',
        color: isError && selected ? 'var(--error-color)' : (selected ? 'var(--primary-color)' : 'var(--text-primary)')
      }}>{span.agent_name}</strong>

      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 18,
        height: 18,
        borderRadius: '50%',
        marginLeft: 8,
        background: isError ? 'var(--error-bg)' : 'var(--success-bg)',
        color: isError ? 'var(--error-color)' : 'var(--success-color)',
        fontSize: 10,
        fontWeight: 'bold'
      }}>
        {isError ? '✗' : '✓'}
      </span>

      <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px'}}>
        <span className="mono" style={{
            fontSize: 11,
            padding: '2px 6px',
            borderRadius: 4,
            background: '#f1f5f9',
            color: 'var(--text-secondary)'
        }}>{span.protocol_type}</span>

        <span style={{
            fontSize: 11,
            textTransform: 'uppercase',
            fontWeight: 600,
            color: isError ? 'var(--error-color)' : 'var(--success-color)'
        }}>{span.status}</span>
      </div>
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

function CodeBlock({ title, code, isError = false }) {
    if (!code || code === 'N/A') return null;
    return (
        <div style={{ marginBottom: 16 }}>
            <div style={{
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
                marginBottom: 6,
                letterSpacing: '0.05em'
            }}>{title}</div>
            <pre className="mono" style={{
                background: isError ? 'var(--error-bg)' : '#1e293b',
                color: isError ? 'var(--error-color)' : '#f8fafc',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                overflowX: 'auto',
                margin: 0,
                border: isError ? '1px solid var(--error-border)' : '1px solid #334155',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
            }}>
                {typeof code === 'string' ? code : JSON.stringify(code, null, 2)}
            </pre>
        </div>
    );
}

export default function Home() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  const spans = filterSpans(demoTrace.spans, search).map((span, i, arr) => ({
    ...span,
    isLast: i === arr.length - 1 || arr[i + 1].indent < span.indent
  }));

  const selectedSpan = selected !== null ? spans[selected] : null;

  return (
    <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    }}>
      <Head>
        <title>PrismTrace - Multi-Agent Observability</title>
      </Head>

      {/* Header */}
      <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--border-color)'
      }}>
          <div>
              <h1 style={{
                  fontWeight: 700,
                  fontSize: 24,
                  margin: '0 0 8px 0',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
              }}>
                  <div style={{
                      width: 24, height: 24,
                      background: 'linear-gradient(135deg, var(--primary-color), #8b5cf6)',
                      borderRadius: 6
                  }}></div>
                  PrismTrace
              </h1>
              <p style={{color: 'var(--text-secondary)', margin: 0, fontSize: 14}}>
                  Multi-Agent Workflow Visualization & Debugging
              </p>
          </div>
          <div style={{
              fontSize: 12,
              background: '#e2e8f0',
              padding: '4px 10px',
              borderRadius: 12,
              color: '#475569',
              fontWeight: 500
          }}>Demo Mode</div>
      </header>

      {/* Main Content Grid */}
      <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 350px',
          gap: '24px',
          alignItems: 'start'
      }}>
          {/* Left Column: Graph */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
              <div style={{
                  background: 'var(--surface-color)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--border-color)',
                  overflow: 'hidden'
              }}>
                  <div style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--border-color)',
                      fontWeight: 600,
                      fontSize: 14,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                  }}>
                      <span>Trace Call Graph</span>
                      <span className="mono" style={{fontSize: 12, color: 'var(--text-muted)'}}>trace_id: pt-8f92a1b</span>
                  </div>
                  <WorkflowGraph trace={demoTrace} onNodeClick={node => {
                    const idx = spans.findIndex(s => s.span_id === node.id);
                    if (idx !== -1) setSelected(idx);
                  }} />
              </div>

              {/* Trace Spans Waterfall */}
              <div style={{
                  background: 'var(--surface-color)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--border-color)',
                  overflow: 'hidden'
              }}>
                  <div style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--border-color)',
                      background: '#f8fafc'
                  }}>
                      <input
                        type="text"
                        placeholder="Filter agents, errors, payloads..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            fontSize: 14,
                            boxSizing: 'border-box'
                        }}
                      />
                  </div>
                  <div style={{display: 'flex', flexDirection: 'column'}}>
                    {spans.map((span, i) => (
                      <TraceSpan
                        key={span.span_id}
                        span={span}
                        selected={selected === i}
                        onClick={() => setSelected(i)}
                      />
                    ))}
                    {spans.length === 0 && (
                        <div style={{padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14}}>
                            No spans match your filter.
                        </div>
                    )}
                  </div>
              </div>
          </div>

          {/* Right Column: Span Inspector */}
          <div style={{
              background: 'var(--surface-color)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              border: selectedSpan?.error ? '1px solid var(--error-border)' : '1px solid var(--border-color)',
              position: 'sticky',
              top: '24px',
              height: 'calc(100vh - 140px)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
          }}>
              <div style={{
                  padding: '16px',
                  borderBottom: '1px solid var(--border-color)',
                  background: selectedSpan?.error ? 'var(--error-bg)' : '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
              }}>
                  <div style={{
                      width: 32, height: 32,
                      borderRadius: 8,
                      background: selectedSpan?.error ? '#fca5a5' : '#bae6fd',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16
                  }}>
                      {selectedSpan ? (selectedSpan.error ? '⚠️' : '⚡') : '🔍'}
                  </div>
                  <div>
                      <h3 style={{
                          margin: 0, fontSize: 16,
                          color: selectedSpan?.error ? 'var(--error-color)' : 'var(--text-primary)'
                      }}>
                          {selectedSpan ? selectedSpan.agent_name : 'Inspector'}
                      </h3>
                      <div className="mono" style={{fontSize: 11, color: 'var(--text-secondary)', marginTop: 2}}>
                          {selectedSpan ? `span_id: ${selectedSpan.span_id}` : 'Select a span to view details'}
                      </div>
                  </div>
              </div>

              <div style={{padding: '20px', overflowY: 'auto', flex: 1}}>
                  {selectedSpan ? (
                      <div className="animate-fade-in">
                          {/* Metadata Tags */}
                          <div style={{display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24}}>
                              <span style={{fontSize: 12, padding: '4px 8px', background: '#f1f5f9', borderRadius: 4, color: '#475569', fontWeight: 500}}>
                                  Protocol: <span className="mono">{selectedSpan.protocol_type}</span>
                              </span>
                              {selectedSpan.llm_model_name && (
                                  <span style={{fontSize: 12, padding: '4px 8px', background: '#f1f5f9', borderRadius: 4, color: '#475569', fontWeight: 500}}>
                                      Model: <span className="mono">{selectedSpan.llm_model_name}</span>
                                  </span>
                              )}
                          </div>

                          {selectedSpan.error && (
                              <CodeBlock title={`Error: ${selectedSpan.error.type}`} code={selectedSpan.error.message + '\n\n' + selectedSpan.error.stack_trace} isError={true} />
                          )}

                          <CodeBlock title="Input Payload" code={selectedSpan.input_payload} />
                          <CodeBlock title="Output Payload" code={selectedSpan.output_payload} />

                      </div>
                  ) : (
                      <div style={{
                          height: '100%', display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'
                      }}>
                          <div style={{fontSize: 48, marginBottom: 16, opacity: 0.2}}>🖱️</div>
                          <p style={{margin: 0, fontSize: 14, textAlign: 'center'}}>
                              Click on a node in the graph or a span<br/>in the waterfall to inspect details.
                          </p>
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
}
