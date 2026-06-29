from prismtrace.decorator import trace
import os
import requests

@trace
def parent_agent():
    child_agent_1()
    child_agent_2()
    broken_agent()

@trace
def child_agent_1():
    # Gemini LLM call
    api_key = os.getenv("GEMINI_API_KEY")
    prompt = "What is the capital of France?"
    try:
        response = requests.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
            headers={"x-goog-api-key": api_key},
            json={"contents": [{"parts": [{"text": prompt}]}]},
            timeout=10
        )
        response.raise_for_status()
        result = response.json()
        return result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "No response")
    except Exception as e:
        raise Exception(f"Gemini LLM call failed: {e}")

@trace
def child_agent_2():
    # Groq LLM call
    api_key = os.getenv("GROQ_API_KEY")
    prompt = "Tell me about the color of the number seven."
    try:
        response = requests.post(
            "https://api.groq.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            json={
                "model": "gemini-1.5-pro",
                "messages": [{"role": "user", "content": prompt}]
            },
            timeout=10
        )
        response.raise_for_status()
        result = response.json()
        return result["choices"][0]["message"]["content"]
    except Exception as e:
        raise Exception(f"Groq LLM call failed: {e}")

@trace
def broken_agent():
    # Manual hardcoded error
    x = 1 / 0  # Division by zero

if __name__ == "__main__":
    try:
        parent_agent()
    except Exception as e:
        print(f"Workflow failed: {e}")
