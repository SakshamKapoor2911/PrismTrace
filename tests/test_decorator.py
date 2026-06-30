import pytest
from unittest.mock import patch, MagicMock
from prismtrace.decorator import trace

@patch("prismtrace.decorator.client.send_trace")
def test_trace_success(mock_send_trace):
    @trace
    def my_function(prompt, other_arg):
        return f"Response to {prompt} with {other_arg}"

    result = my_function("Hello", "World")

    assert result == "Response to Hello with World"
    assert mock_send_trace.call_count == 1

    trace_data = mock_send_trace.call_args[0][0]
    assert "trace_id" in trace_data
    assert len(trace_data["spans"]) == 1

    span = trace_data["spans"][0]
    assert span["agent_name"] == "my_function"
    assert span["status"] == "success"
    assert span["error"] is None
    assert span["input_payload"] == "Hello"
    assert span["output_payload"] == "Response to Hello with World"


@patch("prismtrace.decorator.client.send_trace")
def test_trace_failure(mock_send_trace):
    @trace
    def my_failing_function():
        raise ValueError("Something went wrong")

    with pytest.raises(ValueError, match="Something went wrong"):
        my_failing_function()

    assert mock_send_trace.call_count == 1

    trace_data = mock_send_trace.call_args[0][0]
    assert "trace_id" in trace_data
    assert len(trace_data["spans"]) == 1

    span = trace_data["spans"][0]
    assert span["agent_name"] == "my_failing_function"
    assert span["status"] == "failure"
    assert span["error"] is not None
    assert span["error"]["type"] == "ValueError"
    assert span["error"]["message"] == "Something went wrong"
    assert "test_decorator.py" in span["error"]["stack_trace"]


@patch("prismtrace.decorator.client.send_trace")
def test_trace_prompt_kwarg(mock_send_trace):
    @trace
    def my_function(prompt=None):
        return f"Response to {prompt}"

    result = my_function(prompt="Hello Kwarg")

    assert result == "Response to Hello Kwarg"
    assert mock_send_trace.call_count == 1

    trace_data = mock_send_trace.call_args[0][0]
    span = trace_data["spans"][0]
    assert span["input_payload"] == "Hello Kwarg"
