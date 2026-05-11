from .client import TraceClient
from .utils import generate_id, now_iso
import traceback
import functools

client = TraceClient()

def get_ai_metadata(prompt=None, response=None, error=None):
    return {
        "protocol_type": "MCP",
        "llm_model_name": "gemini-1.5-pro",
        "token_counts": {"prompt": 1024, "completion": 512},
        "input_payload": prompt or "Sample prompt",
        "output_payload": response or "Sample response",
        "error_message": error or None
    }

def trace(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        span_id = generate_id()
        parent_span_id = None  # For demo, not tracking parent/child
        agent_name = func.__name__
        start_time = now_iso()
        error = None
        status = "success"
        result = None
        prompt = None
        response = None
        error_msg = None
        try:
            result = func(*args, **kwargs)
        except Exception as exc:
            status = "failure"
            error = {
                "type": type(exc).__name__,
                "message": str(exc),
                "stack_trace": traceback.format_exc()
            }
        end_time = now_iso()
        span_data = {
            "span_id": span_id,
            "parent_span_id": parent_span_id,
            "agent_name": agent_name,
            "start_time": start_time,
            "end_time": end_time,
            "status": status,
            "error": error,
            **get_ai_metadata(prompt, response, error_msg)
        }
        client.send_trace({"trace_id": generate_id(), "spans": [span_data]})
        if status == "failure":
            raise Exception(error["message"])
        return result
    return wrapper
