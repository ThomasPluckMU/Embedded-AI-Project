#!/bin/bash

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$( dirname "$SCRIPT_DIR" )"

# Usage information
function show_usage {
    echo "Usage: $0 [--browser chrome|firefox|edge] [--api-key YOUR_API_KEY]"
    echo ""
    echo "Options:"
    echo "  --browser    Browser to use for testing (default: chrome)"
    echo "  --api-key    Your OpenAI API key"
    echo ""
    exit 1
}

# Parse command line arguments
BROWSER="chrome"
API_KEY=""

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --browser) BROWSER="$2"; shift ;;
        --api-key) API_KEY="$2"; shift ;;
        --help) show_usage ;;
        *) echo "Unknown parameter: $1"; show_usage ;;
    esac
    shift
done

# Change to project root directory
cd "$PROJECT_ROOT"

# Check if ChromaDB server is running
if ! pgrep -f "python chroma_server.py" > /dev/null; then
    echo "Starting ChromaDB server..."
    python3 chroma_server.py > /dev/null 2>&1 &
    CHROMA_PID=$!
    # Give it time to start up
    sleep 3
else
    echo "ChromaDB server is already running."
    CHROMA_PID=""
fi

# Check if BetterChatGPT is running
if ! curl -s http://localhost:5173 > /dev/null; then
    echo "Starting BetterChatGPT..."
    cd BetterChatGPT
    npm run dev > /dev/null 2>&1 &
    APP_PID=$!
    cd "$PROJECT_ROOT"
    # Give it time to start up
    sleep 5
else
    echo "BetterChatGPT is already running."
    APP_PID=""
fi

# Run the end-to-end test
echo "Running end-to-end RAG tests..."
python3 "$SCRIPT_DIR/e2e_rag_test.py" --browser $BROWSER ${API_KEY:+--api-key $API_KEY}

# Save the test result
TEST_RESULT=$?

# Clean up processes we started
if [ ! -z "$CHROMA_PID" ]; then
    echo "Stopping ChromaDB server..."
    kill $CHROMA_PID
fi

if [ ! -z "$APP_PID" ]; then
    echo "Stopping BetterChatGPT..."
    kill $APP_PID
fi

# Display test results status
if [ $TEST_RESULT -eq 0 ]; then
    echo "✅ All end-to-end tests passed!"
else
    echo "❌ End-to-end tests failed."
fi

exit $TEST_RESULT