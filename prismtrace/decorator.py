import os
import requests
from .client import TraceClient
from .utils import generate_id, now_iso
import traceback
import sys
import functools

client = TraceClient()

def get_ai_metadata(prompt=None, response=None, error=None):
    return {
        "protocol_type": "MCP",
        "llm_model_name": "gemini-1.5-pro",
        "token_counts": {"prompt": 1024, "completion": 512},
        "input_payload": prompt,
        "output_payload": response,
        "error_message": error
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
        prompt = kwargs.get("prompt")
        if not prompt and args and isinstance(args[0], str):
            prompt = args[0]
        response = None
        error_msg = None
        captured_exc = None
        try:
            result = func(*args, **kwargs)
            response = str(result) if result is not None else None
        except Exception as raised_exc:
            captured_exc = raised_exc
            status = "failure"
            error_msg = str(raised_exc)

            # Security Directive: Do not expose raw stack traces in error payloads.
            # Extract safe stack trace information instead.
            safe_stack_trace = ""
            exc_type, exc_value, exc_tb = sys.exc_info()
            if exc_tb is not None:
                tb_list = traceback.extract_tb(exc_tb)
                if tb_list:
                    # Just the last file and line, not the full stack
                    last_frame = tb_list[-1]
                    safe_stack_trace = f"File {last_frame.filename}, line {last_frame.lineno}, in {last_frame.name}"

            error = {
                "type": type(raised_exc).__name__,
                "message": error_msg,
                "stack_trace": safe_stack_trace
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
        if status == "failure" and captured_exc:
            raise captured_exc
        return result
    return wrapper
