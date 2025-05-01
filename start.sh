#!/bin/bash

# Start the ChromaDB Flask server in the background
echo "Starting ChromaDB Flask server..."
python3 chroma_server.py &
FLASK_PID=$!

# Change to the BetterChatGPT directory
cd BetterChatGPT

# Start the BetterChatGPT app
echo "Starting BetterChatGPT app..."
npm run dev

# When the app is terminated, also terminate the Flask server
kill $FLASK_PID