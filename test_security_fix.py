import json
from unittest.mock import patch
from prismtrace.decorator import trace, client

def test_trace_error():
    # Mock the client's send_trace method to intercept the payload
    with patch.object(client, 'send_trace') as mock_send_trace:

        @trace
        def failing_function():
            raise ValueError("Something went wrong")

        # Call the failing function, catching the re-raised exception
        try:
            failing_function()
        except Exception:
            pass

        # Check the payload sent to send_trace
        mock_send_trace.assert_called_once()
        trace_payload = mock_send_trace.call_args[0][0]

        # Verify the 'error' field does not contain 'stack_trace'
        assert len(trace_payload['spans']) == 1
        span_data = trace_payload['spans'][0]

        assert span_data['status'] == 'failure'
        assert span_data['error'] is not None
        assert span_data['error']['type'] == 'ValueError'
        assert span_data['error']['message'] == 'Something went wrong'
        assert 'stack_trace' not in span_data['error']

if __name__ == '__main__':
    test_trace_error()
    print("Test passed successfully. No stack trace in the error payload.")
