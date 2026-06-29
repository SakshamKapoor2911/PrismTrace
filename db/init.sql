CREATE TABLE IF NOT EXISTS traces (
    trace_id String,
    root_span_id String,
    start_time DateTime,
    end_time DateTime,
    status String
) ENGINE = MergeTree()
ORDER BY (start_time, trace_id);

CREATE TABLE IF NOT EXISTS spans (
    span_id String,
    trace_id String,
    parent_span_id String,
    agent_name String,
    start_time DateTime,
    end_time DateTime,
    status String,
    error_type String,
    error_message String,
    stack_trace String,
    protocol_type String,
    llm_model_name String,
    token_counts String,
    input_payload String,
    output_payload String
) ENGINE = MergeTree()
ORDER BY (start_time, trace_id, span_id);

-- Sample Data for traces
INSERT INTO traces (trace_id, root_span_id, start_time, end_time, status) VALUES
('trace-001', 'span-001', '2023-10-27 10:00:00', '2023-10-27 10:00:05', 'failure');

-- Sample Data for spans
INSERT INTO spans (span_id, trace_id, parent_span_id, agent_name, start_time, end_time, status, error_type, error_message, stack_trace, protocol_type, llm_model_name, token_counts, input_payload, output_payload) VALUES
('span-001', 'trace-001', '', 'parent_agent', '2023-10-27 10:00:00', '2023-10-27 10:00:05', 'failure', 'Exception', 'Groq LLM call failed', 'Traceback...', 'MCP', '', '', 'N/A', 'N/A'),
('span-002', 'trace-001', 'span-001', 'child_agent_1', '2023-10-27 10:00:01', '2023-10-27 10:00:02', 'success', '', '', '', 'MCP', 'gemini-pro', '{"prompt": 10, "completion": 20}', 'What is the capital of France?', 'Paris'),
('span-003', 'trace-001', 'span-001', 'child_agent_2', '2023-10-27 10:00:02', '2023-10-27 10:00:04', 'failure', 'Exception', 'Groq LLM call failed: 404 Client Error', 'Traceback...', 'MCP', 'gemini-1.5-pro', '', 'Tell me about the color of the number seven.', 'Sample response'),
('span-004', 'trace-001', 'span-001', 'broken_agent', '2023-10-27 10:00:04', '2023-10-27 10:00:05', 'failure', 'ZeroDivisionError', 'division by zero', 'Traceback...', 'FunctionCall', '', '', 'N/A', 'N/A');
