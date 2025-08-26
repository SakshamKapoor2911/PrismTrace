# PrismTrace Utility Functions

import uuid
import time

def generate_id():
    return str(uuid.uuid4())

def now_iso():
    return time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
