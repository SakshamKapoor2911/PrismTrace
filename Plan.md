# PrismTrace MVP Execution Plan

This checklist outlines the sequential steps to build the minimal demo for PrismTrace, focusing on rapid delivery and clear developer value.

## 1. System Design & Data Model
- [ ] Define trace, span, and error data models
- [ ] Specify API contract for trace ingestion
- [ ] Design ClickHouse schema for traces

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
