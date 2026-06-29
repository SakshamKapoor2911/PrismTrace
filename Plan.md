# PrismTrace MVP Execution Plan

This checklist outlines the sequential steps to build the minimal demo for PrismTrace, focusing on rapid delivery and clear developer value.

## 1. System Design & Data Model
- [x] Define trace, span, and error data models
- [x] Specify API contract for trace ingestion
- [x] Design ClickHouse schema for traces
- [x] Capture AI-specific metadata in spans (protocol_type, llm_model_name, token_counts, input/output payloads)

### Trace Data Model
- `trace_id`: Unique identifier for the workflow execution.
- `root_span_id`: ID of the root agent call.
- `start_time`, `end_time`: Timestamps for the trace.
- `status`: Success or failure.

### Span Data Model
- `span_id`: Unique identifier for each agent/subagent call.
- `parent_span_id`: ID of the parent span (for call graph).
- `agent_name`: Name of the agent.
- `start_time`, `end_time`: Timestamps for the span.
- `status`: Success or failure.
- `error`: Error object (if any).
- `protocol_type`: "MCP", "A2A", "FunctionCall" (Essential for bridge vision)
- `llm_model_name`: e.g., "gemini-1.5-pro"
- `token_counts`: { "prompt": 1024, "completion": 512 } (Crucial for cost control)
- `input_payload`: The actual prompt or data sent to the agent.
- `output_payload`: The final response or data from the agent.

### Error Data Model
- `error_id`: Unique identifier.
- `span_id`: Associated span.
- `type`: Exception type.
- `message`: Error message.
- `stack_trace`: Stack trace (optional).

### API Contract for Trace Ingestion
**POST /api/trace**
Request Body:
```
{
  "trace_id": "string",
  "spans": [
    {
      "span_id": "string",
      "parent_span_id": "string",
      "agent_name": "string",
      "start_time": "ISO8601",
      "end_time": "ISO8601",
      "status": "success|failure",
      "error": {
        "type": "string",
        "message": "string",
        "stack_trace": "string"
      },
      "protocol_type": "MCP",
      "llm_model_name": "gemini-1.5-pro",
      "token_counts": { "prompt": 1024, "completion": 512 },
      "input_payload": "...",
      "output_payload": "..."
    }
  ]
}
```
Response: `{ "status": "ok" }`

### ClickHouse Schema
**Table: traces**
- `trace_id` String
- `root_span_id` String
- `start_time` DateTime
- `end_time` DateTime
- `status` String

**Table: spans**
- `span_id` String
- `trace_id` String
- `parent_span_id` String
- `agent_name` String
- `start_time` DateTime
- `end_time` DateTime
- `status` String
- `error_type` String
- `error_message` String
- `stack_trace` String
- `protocol_type` String
- `llm_model_name` String
- `token_counts` JSON
- `input_payload` String
- `output_payload` String

## 2. Python SDK
- [x] Scaffold SDK package structure
- [x] Implement `@trace` decorator
- [x] Mock multi-agent workflow for demo
- [x] Send trace events to backend (simulate for demo)
- [ ] Integrate Groq LLM call in agent (using GROQ_API_KEY from .env)
- [ ] Capture and display real prompt, response, and error in trace output
- [x] Improve error reporting in terminal: show error type, message, stack trace line, protocol type, and payloads

### Mock Multi-Agent Workflow Example
```python
from prismtrace.decorator import trace

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
    # Integrate Groq LLM call here
    pass

if __name__ == "__main__":
    try:
        parent_agent()
    except Exception as e:
        print(f"Workflow failed: {e}")
```

---
## Production Improvements for Multi-Agent Systems
To make PrismTrace production-ready for large-scale, multi-agent AI workflows, the following enhancements are planned:
- Aggregate all spans from a workflow under a single `trace_id`.
- Build a call graph by setting `parent_span_id` correctly for each span.
- Send trace events to a real backend (Go API) and store in ClickHouse DB.
- Handle concurrency, distributed workflows, and large-scale data.
- Integrate with real agent frameworks and LLM APIs.
- Add support for async/concurrent agent calls.

## 3. Go Ingestion API
- [ ] Scaffold Go API project
- [ ] Implement REST endpoint for trace ingestion
- [ ] Integrate with ClickHouse (mock for demo)

## 4. ClickHouse Database
- [ ] Define minimal schema for traces/spans
- [ ] Set up local ClickHouse instance (optional for demo)
- [ ] Prepopulate with sample trace data

## 5. Next.js Frontend
- [x] Scaffold Next.js app
- [x] Implement waterfall trace viewer
- [x] Highlight error spans and show details
- [x] Preload demo trace data for instant dashboard experience
- [ ] Make spans clickable to show error details, stack trace, LLM input/output, protocol, and model info
- [ ] Visualize call hierarchy with indentation/tree lines
- [ ] Add filter/search bar for agents/errors
- [ ] Add live/streaming mode to show new traces in real time
- [ ] Deploy dashboard to Vercel

## 6. Demo & Recording
- [ ] Write demo script (CLI pain, dashboard magic moment)
- [ ] Record demo video
- [ ] Prepare README and documentation

---
Checklist order and prioritization is optimal: system design first, then SDK, backend, DB, frontend, and demo. Each step builds on the previous, ensuring rapid, focused MVP delivery.
