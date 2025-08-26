# PrismTrace MVP Execution Plan

This checklist outlines the sequential steps to build the minimal demo for PrismTrace, focusing on rapid delivery and clear developer value.

## 1. System Design & Data Model
- [x] Define trace, span, and error data models
- [x] Specify API contract for trace ingestion
- [x] Design ClickHouse schema for traces

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
      }
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

## 2. Python SDK
- [ ] Scaffold SDK package structure
- [ ] Implement `@trace` decorator
- [ ] Mock multi-agent workflow for demo
- [ ] Send trace events to backend (simulate for demo)

## 3. Go Ingestion API
- [ ] Scaffold Go API project
- [ ] Implement REST endpoint for trace ingestion
- [ ] Integrate with ClickHouse (mock for demo)

## 4. ClickHouse Database
- [ ] Define minimal schema for traces/spans
- [ ] Set up local ClickHouse instance (optional for demo)
- [ ] Prepopulate with sample trace data

## 5. Next.js Frontend
- [ ] Scaffold Next.js app
- [ ] Implement waterfall trace viewer
- [ ] Highlight error spans and show details
- [ ] Connect to backend (mock data for demo)

## 6. Demo & Recording
- [ ] Write demo script
- [ ] Record demo video
- [ ] Prepare README and documentation

---
This plan ensures a clear path to MVP, with each step building towards a compelling, recordable demo for YC.
