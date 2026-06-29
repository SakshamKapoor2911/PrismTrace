CREATE DATABASE IF NOT EXISTS prismtrace;

CREATE TABLE IF NOT EXISTS prismtrace.traces (
    trace_id String,
    root_span_id String,
    start_time DateTime64(3),
    end_time DateTime64(3),
    status String
) ENGINE = MergeTree()
ORDER BY (start_time, trace_id);

CREATE TABLE IF NOT EXISTS prismtrace.spans (
    span_id String,
    trace_id String,
    parent_span_id String,
    agent_name String,
    start_time DateTime64(3),
    end_time DateTime64(3),
    status String,
    error_type String,
    error_message String,
    stack_trace String,
    protocol_type String,
    llm_model_name String,
    token_counts String, -- Stored as JSON string
    input_payload String,
    output_payload String
) ENGINE = MergeTree()
ORDER BY (start_time, trace_id, span_id);
