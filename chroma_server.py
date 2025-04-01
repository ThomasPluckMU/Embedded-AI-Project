#!/usr/bin/env python3
"""
Simple Flask server to handle ChromaDB ingestion from BetterChatGPT.
"""

import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import chromadb
from chromadb.config import Settings

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize ChromaDB client
client = chromadb.PersistentClient(
    path="./db",
    settings=Settings(
        allow_reset=True,
        anonymized_telemetry=False
    )
)

# Create or get the collection
collection = client.get_or_create_collection(
    name="chat_history",
    metadata={"hnsw:space": "cosine"}
)

@app.route('/ingest', methods=['POST'])
def ingest():
    """
    Ingest chat messages into ChromaDB.
    
    Expected format:
    {
        "documents": [
            {
                "id": "unique_id",
                "text": "message content",
                "metadata": {
                    "role": "user/assistant/system",
                    "chatId": "chat_id",
                    "title": "chat title",
                    "timestamp": "ISO timestamp",
                    "messageIndex": 0
                }
            },
            ...
        ]
    }
    """
    try:
        data = request.json
        
        if not data or 'documents' not in data:
            return jsonify({"error": "Invalid request format"}), 400
        
        documents = data['documents']
        
        # Extract data for ChromaDB ingestion
        ids = [doc["id"] for doc in documents]
        texts = [doc["text"] for doc in documents]
        metadatas = [doc["metadata"] for doc in documents]
        
        # Add documents to collection
        collection.add(
            ids=ids,
            documents=texts,
            metadatas=metadatas
        )
        
        return jsonify({
            "success": True,
            "message": f"Successfully ingested {len(documents)} messages",
            "count": len(documents)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)