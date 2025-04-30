#!/bin/bash

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$( dirname "$SCRIPT_DIR" )"

# Make sure ChromaDB server is stopped
pkill -f "python chroma_server.py" || true

# Run the integration test
echo "Running RAG integration tests..."
cd "$PROJECT_ROOT"
python3 -m pytest "$SCRIPT_DIR/test_rag.py" -v

# Display test results status
if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "❌ Tests failed."
fi