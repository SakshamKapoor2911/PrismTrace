# PrismTrace: Datadog for Multi-Agent AI

PrismTrace is a universal control plane for multi-agent AI systems, providing instant observability and debugging across agent workflows. With a single decorator (`@Prism.trace`), developers gain a glass-box view into their entire agent fleet, reducing debugging time from days to minutes.

## Key Features
- **One-line integration:** Add `@Prism.trace` to agent code.
- **Unified trace visualization:** Waterfall view of agent call graphs, even across protocols.
- **Error pinpointing:** Instantly see which agent failed and why.
- **Protocol-agnostic:** Designed for MCP (developer standard), with clear path to A2A (enterprise standard).

## System Design & Data Model
- **Trace:** Unique ID, root span, timestamps, status
- **Span:** Unique ID, parent span, agent name, timestamps, status, error
- **Error:** Type, message, stack trace
- **AI Metadata:** protocol_type, llm_model_name, token_counts, input/output payloads
- **API:** POST /api/trace with trace and spans
- **DB:** ClickHouse tables for traces and spans

## Demo Workflow

```mermaid
graph TD
    AgentCode[Python Agent Code] --> Decorator[Prism.trace Decorator]
    Decorator --> TraceEvent[Trace Event]
    TraceEvent --> IngestionAPI[Go Ingestion API]
    IngestionAPI --> DB[ClickHouse DB]
    DB --> Dashboard[Next.js Dashboard]
    Dashboard --> Waterfall[Waterfall Trace Viewer]
    Waterfall --> Error[Error Highlight]
    Waterfall --> AIMeta[AI Metadata: protocol_type, model, tokens, payloads]
```

## Example: Mock Multi-Agent System

```python
from prismtrace import trace

@trace
def parent_agent():
    child_agent_1()
    child_agent_2()

@trace
def child_agent_1():
    # Simulate success
    pass

@trace
def child_agent_2():
    # Simulate failure
    raise Exception("Subagent failed")

if __name__ == "__main__":
    try:
        parent_agent()
    except Exception as e:
        print(f"Workflow failed: {e}")
```

## MVP Path
- **Python SDK:** Minimal decorator for tracing agent calls.
- **Go Ingestion API:** REST endpoint for trace events.
- **ClickHouse DB:** Store and query traces.
- **Next.js Frontend:** Waterfall trace viewer.

## Path to Production Readiness
PrismTrace MVP demonstrates core tracing and debugging for agent workflows. For full production use in multi-agent systems, the following enhancements are planned:
- Aggregate all spans from a workflow under a single `trace_id`.
- Build a call graph by setting `parent_span_id` correctly for each span.
- Send trace events to a real backend (Go API) and store in ClickHouse DB.
- Handle concurrency, distributed workflows, and large-scale data.
- Integrate with real agent frameworks and LLM APIs.
- Add support for async/concurrent agent calls.

---
PrismTrace is designed for rapid developer adoption and seamless expansion to enterprise standards. The MVP delivers the "magic moment" of instant clarity for agent debugging, with a clear path to full protocol support and advanced governance features.
