import re
import time
from unittest.mock import patch
from prismtrace.utils import generate_id, now_iso

def test_generate_id():
    uid = generate_id()
    assert isinstance(uid, str)
    # Basic UUID check
    assert re.match(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', uid)

def test_now_iso_format():
    iso_time = now_iso()
    assert isinstance(iso_time, str)
    # Check if it matches the expected format: YYYY-MM-DDTHH:MM:SSZ
    assert re.match(r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$', iso_time)

def test_now_iso_behavior():
    with patch('time.gmtime') as mock_gmtime:
        # Fixed time: 2024-05-20 12:00:00
        mock_gmtime.return_value = time.struct_time((2024, 5, 20, 12, 0, 0, 0, 141, 0))
        assert now_iso() == "2024-05-20T12:00:00Z"
