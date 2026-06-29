import pytest
from datetime import datetime
from prismtrace.client import TraceClient

@pytest.fixture
def client():
    return TraceClient()

def test_parse_time_valid(client):
    parsed = client._parse_time("2024-05-10T12:30:45Z")
    assert parsed == datetime(2024, 5, 10, 12, 30, 45)

def test_parse_time_invalid_format(client):
    parsed = client._parse_time("2024/05/10 12:30:45")
    assert parsed is None

def test_parse_time_empty_string(client):
    parsed = client._parse_time("")
    assert parsed is None

def test_parse_time_none(client):
    parsed = client._parse_time(None)
    assert parsed is None

def test_parse_time_invalid_type(client):
    parsed = client._parse_time(1234567890)
    assert parsed is None
