import unittest
from unittest.mock import MagicMock, patch
import os
import sys

# Ensure we can import prismtrace
sys.path.append(os.getcwd())

from prismtrace.decorator import trace

class TestTraceDecorator(unittest.TestCase):
    def test_child_agent_2_no_longer_intercepted(self):
        # We need a function named child_agent_2
        @trace
        def child_agent_2():
            child_agent_2.called = True
            return "original result"

        child_agent_2.called = False

        result = child_agent_2()

        self.assertEqual(result, "original result")
        self.assertTrue(child_agent_2.called, "The original function SHOULD now be called")

    def test_other_agent_no_interception(self):
        @trace
        def other_agent():
            other_agent.called = True
            return "original result"

        other_agent.called = False

        result = other_agent()

        self.assertEqual(result, "original result")
        self.assertTrue(other_agent.called, "The original function SHOULD have been called")

if __name__ == '__main__':
    unittest.main()
