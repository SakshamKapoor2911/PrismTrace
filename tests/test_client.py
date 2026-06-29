from prismtrace.client import TraceClient

def test_trace_client_default_endpoint():
    client = TraceClient()
    assert client.endpoint == "https://localhost:8000/api/trace"

def test_trace_client_custom_endpoint():
    client = TraceClient(endpoint="https://example.com/api/trace")
    assert client.endpoint == "https://example.com/api/trace"
