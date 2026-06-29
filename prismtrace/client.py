# PrismTrace Trace Client

import json
from datetime import datetime

# ANSI color codes for enhanced output
GREEN = "\033[92m"
RED = "\033[91m"
RESET = "\033[0m"
CHECK = "\u2713"
CROSS = "\u2717"
BRANCH = "├─"
END = "└─"
SEP = "-" * 56

class TraceClient:
    def __init__(self, endpoint=None):
        self.endpoint = endpoint or "http://localhost:8000/api/trace"
        self.traces = []  # Store traces for inspection

    def _parse_time(self, t):
        # Assumes ISO8601 format
        try:
            return datetime.strptime(t, "%Y-%m-%dT%H:%M:%SZ")
        except Exception:
            return None

    def _duration(self, start, end):
        s = self._parse_time(start)
        e = self._parse_time(end)
        if s and e:
            ms = int((e-s).total_seconds() * 1000)
            if ms < 1000:
                return f"{ms}ms"
            else:
                return f"{(e-s).total_seconds():.3f}s"
        return "0ms"

    def _time_short(self, t):
        dt = self._parse_time(t)
        if dt:
            return dt.strftime("%H:%M:%SZ")
        return t

    def print_span_summary(self, span, indent=0, all_spans=None, branch_symbol=BRANCH):
        status = span.get("status", "")
        agent = span.get("agent_name", "")
        model = span.get("llm_model_name", "")
        protocol = span.get("protocol_type", "")
        error = span.get("error")
        start = span.get("start_time")
        end = span.get("end_time")
        duration = self._duration(start, end)
        start_disp = self._time_short(start)
        prefix = "  " * indent + (branch_symbol if indent else "")
        proto_disp = f"[{protocol}] " if protocol else ""
        if status == "success":
            print(f"{prefix}{GREEN}{CHECK} {proto_disp}{agent} (Start: {start_disp}, Duration: {duration}, Model: {model}) - Success{RESET}")
        else:
            print(f"{prefix}{RED}{CROSS} {proto_disp}{agent} (Start: {start_disp}, Duration: {duration}, Model: {model}) - Failure{RESET}")
            if error:
                print(f"{prefix}  {RED}Error Type: {error.get('type', '')}{RESET}")
                print(f"{prefix}  {RED}Error Message: {error.get('message', '')}{RESET}")
                stack = error.get("stack_trace", "")
                if stack:
                    stack_lines = [line.strip() for line in stack.splitlines() if line.strip()]
                    # Find the last line that starts with 'File "' to indicate the failing frame
                    stack_trace_line = next((line for line in reversed(stack_lines) if line.startswith('File "')), stack_lines[-1] if stack_lines else "")
                    if stack_trace_line:
                        print(f"{prefix}  {RED}Stack Trace: {stack_trace_line}{RESET}")
            if protocol:
                print(f"{prefix}  {RED}Protocol: {protocol}{RESET}")

            input_payload = span.get("input_payload")
            output_payload = span.get("output_payload")
            if input_payload:
                print(f"{prefix}  Input Payload: {input_payload}")
            if output_payload:
                print(f"{prefix}  Output Payload: {output_payload}")
        # Print children if any
        if all_spans:
            children = [s for s in all_spans if s.get("parent_span_id") == span.get("span_id")]
            for i, child in enumerate(children):
                child_branch = BRANCH if i < len(children)-1 else END
                self.print_span_summary(child, indent=indent+1, all_spans=all_spans, branch_symbol=child_branch)

    def send_trace(self, trace_data):
        trace_id = trace_data.get("trace_id", "")
        spans = trace_data.get("spans", [])
        print(f"[PrismTrace] Trace sent: {trace_id}")
        success_count = 0
        fail_count = 0
        # Find root spans (no parent)
        roots = [s for s in spans if not s.get("parent_span_id")]
        for root in roots:
            self.print_span_summary(root, indent=0, all_spans=spans)
        for span in spans:
            if span.get("status") == "success":
                success_count += 1
            else:
                fail_count += 1
        print(SEP)
        print(f"Trace [{trace_id}] completed with {success_count} success{'es' if success_count != 1 else ''}, {fail_count} failure{'s' if fail_count != 1 else ''}.\n")
        self.traces.append(trace_data)
