# PrismTrace Trace Client

import json

# ANSI color codes for enhanced output
GREEN = "\033[92m"
RED = "\033[91m"
RESET = "\033[0m"
CHECK = "\u2713"
CROSS = "\u2717"

class TraceClient:
    def __init__(self, endpoint=None):
        self.endpoint = endpoint or "http://localhost:8000/api/trace"
        self.traces = []  # Store traces for inspection

    def print_span_summary(self, span):
        status = span.get("status", "")
        agent = span.get("agent_name", "")
        model = span.get("llm_model_name", "")
        error = span.get("error")
        # Compute duration if possible
        start = span.get("start_time")
        end = span.get("end_time")
        duration = "0s"
        if start and end and start != end:
            duration = "0s"  # For demo, timestamps are strings; can parse for real duration
        if status == "success":
            print(f"  {GREEN}{CHECK} {agent} (Duration: {duration}, Model: {model}) - Success{RESET}")
        else:
            print(f"  {RED}{CROSS} {agent} (Duration: {duration}, Model: {model}) - Failure{RESET}")
            if error:
                print(f"    {RED}Error: {error.get('message', '')}{RESET}")
                stack = error.get("stack_trace", "")
                if stack:
                    print(f"    {RED}Stack Trace: {stack.splitlines()[-1]}{RESET}")

    def send_trace(self, trace_data):
        trace_id = trace_data.get("trace_id", "")
        spans = trace_data.get("spans", [])
        print(f"[PrismTrace] Trace sent: {trace_id}")
        success_count = 0
        fail_count = 0
        for span in spans:
            self.print_span_summary(span)
            if span.get("status") == "success":
                success_count += 1
            else:
                fail_count += 1
        print(f"Trace [{trace_id}] completed with {success_count} success, {fail_count} failures.\n")
        self.traces.append(trace_data)
