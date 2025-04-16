"""
Pytest configuration and shared fixtures for the Embedded AI Project tests.
"""

import os
import time
import pytest
import requests
import subprocess
import threading

# Constants
SERVER_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:5173"

@pytest.fixture(scope="session")
def chroma_server():
    """Start ChromaDB Flask server for the test session if it's not already running."""
    # Check if server is already running
    try:
        requests.get(f"{SERVER_URL}/query", timeout=1)
        print("ChromaDB server is already running.")
        yield SERVER_URL
        # Don't stop the server if it was already running
        return
    except (requests.exceptions.ConnectionError, requests.exceptions.ReadTimeout):
        pass

    # Server not running, start it
    def run_server():
        subprocess.run(["python", "chroma_server.py"])
    
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    
    # Wait for server to start
    for _ in range(5):
        try:
            requests.get(f"{SERVER_URL}/query", timeout=1)
            print("ChromaDB server started successfully.")
            break
        except (requests.exceptions.ConnectionError, requests.exceptions.ReadTimeout):
            time.sleep(1)
    else:
        pytest.fail("Failed to start ChromaDB server")
    
    yield SERVER_URL
    
    # No need to stop the server as the thread is a daemon

@pytest.fixture(scope="session")
def frontend_server():
    """Start BetterChatGPT frontend server for the test session if it's not already running."""
    # Check if server is already running
    try:
        requests.get(FRONTEND_URL, timeout=1)
        print("BetterChatGPT frontend is already running.")
        yield FRONTEND_URL
        # Don't stop the server if it was already running
        return
    except (requests.exceptions.ConnectionError, requests.exceptions.ReadTimeout):
        pass

    # Server not running, start it
    def run_frontend():
        subprocess.run(["npm", "run", "dev"], cwd="BetterChatGPT")
    
    frontend_thread = threading.Thread(target=run_frontend, daemon=True)
    frontend_thread.start()
    
    # Wait for server to start
    for _ in range(10):  # Frontend might take longer to start
        try:
            requests.get(FRONTEND_URL, timeout=1)
            print("BetterChatGPT frontend started successfully.")
            break
        except (requests.exceptions.ConnectionError, requests.exceptions.ReadTimeout):
            time.sleep(1)
    else:
        pytest.fail("Failed to start BetterChatGPT frontend")
    
    yield FRONTEND_URL
    
    # No need to stop the server as the thread is a daemon