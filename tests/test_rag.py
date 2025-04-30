#!/usr/bin/env python3
"""
Integration test for RAG (Retrieval Augmented Generation) capabilities 
of ChromaDB using the BetterChatGPT framework.
"""

import os
import json
import time
import unittest
import requests
import uuid
from datetime import datetime

# Flask server URL
SERVER_URL = "http://localhost:8000"

class RAGIntegrationTest(unittest.TestCase):
    """Test the RAG capabilities of ChromaDB via the Flask server."""
    
    @classmethod
    def setUpClass(cls):
        """Start the Flask server if it's not already running."""
        try:
            # Check if server is running
            requests.get(f"{SERVER_URL}/query")
            print("Server is already running.")
        except:
            print("Starting the server...")
            # Server not running, start it
            import subprocess
            import threading
            
            def run_server():
                subprocess.run(["python", "chroma_server.py"])
            
            cls.server_thread = threading.Thread(target=run_server)
            cls.server_thread.daemon = True
            cls.server_thread.start()
            
            # Wait for server to start
            for _ in range(5):
                try:
                    requests.get(f"{SERVER_URL}/query")
                    print("Server started successfully.")
                    break
                except:
                    time.sleep(1)
    
    def setUp(self):
        """Prepare test data."""
        # Sample documents for ingestion
        self.test_documents = {
            "documents": [
                {
                    "id": str(uuid.uuid4()),
                    "text": "Embedded AI systems combine machine learning models with hardware devices to enable on-device intelligence.",
                    "metadata": {
                        "role": "assistant",
                        "chatId": "test_chat_1",
                        "title": "Embedded AI Overview",
                        "timestamp": datetime.now().isoformat(),
                        "messageIndex": 0
                    }
                },
                {
                    "id": str(uuid.uuid4()),
                    "text": "TinyML is a field of machine learning focused on running ML models on microcontrollers and other resource-constrained devices.",
                    "metadata": {
                        "role": "assistant",
                        "chatId": "test_chat_1",
                        "title": "Embedded AI Overview",
                        "timestamp": datetime.now().isoformat(),
                        "messageIndex": 1
                    }
                },
                {
                    "id": str(uuid.uuid4()),
                    "text": "Edge computing processes data near the source rather than in a centralized data center, reducing latency and bandwidth usage.",
                    "metadata": {
                        "role": "assistant",
                        "chatId": "test_chat_2",
                        "title": "Edge Computing",
                        "timestamp": datetime.now().isoformat(),
                        "messageIndex": 0
                    }
                },
                {
                    "id": str(uuid.uuid4()),
                    "text": "ChromaDB is a vector database used for storing and retrieving embeddings for similarity search in RAG applications.",
                    "metadata": {
                        "role": "assistant",
                        "chatId": "test_chat_2",
                        "title": "Vector Databases",
                        "timestamp": datetime.now().isoformat(),
                        "messageIndex": 1
                    }
                },
                {
                    "id": str(uuid.uuid4()),
                    "text": "Retrieval Augmented Generation (RAG) combines information retrieval with text generation to produce more accurate and contextually relevant responses.",
                    "metadata": {
                        "role": "assistant",
                        "chatId": "test_chat_3",
                        "title": "RAG Systems",
                        "timestamp": datetime.now().isoformat(),
                        "messageIndex": 0
                    }
                }
            ]
        }
    
    def test_ingest_and_query(self):
        """Test ingestion of documents and subsequent querying."""
        
        # Step 1: Ingest test documents
        ingest_response = requests.post(
            f"{SERVER_URL}/ingest",
            json=self.test_documents
        )
        
        # Verify ingestion success
        self.assertEqual(ingest_response.status_code, 200)
        response_data = ingest_response.json()
        self.assertTrue(response_data["success"])
        self.assertEqual(response_data["count"], len(self.test_documents["documents"]))
        
        # Step 2: Test basic query
        query_response = requests.post(
            f"{SERVER_URL}/query",
            json={"query": "What is embedded AI?", "n_results": 2}
        )
        
        # Verify query success
        self.assertEqual(query_response.status_code, 200)
        query_results = query_response.json()
        self.assertTrue(query_results["success"])
        
        # Verify we got results
        self.assertTrue(len(query_results["results"]) > 0)
        
        # Check that most relevant result is about embedded AI
        top_result = query_results["results"][0]
        self.assertIn("embedded ai", top_result["text"].lower())
        
        # Step 3: Test query about ChromaDB
        chroma_query_response = requests.post(
            f"{SERVER_URL}/query",
            json={"query": "What is ChromaDB?", "n_results": 1}
        )
        
        self.assertEqual(chroma_query_response.status_code, 200)
        chroma_results = chroma_query_response.json()
        self.assertTrue(chroma_results["success"])
        
        # Verify the top result is about ChromaDB
        if len(chroma_results["results"]) > 0:
            top_chroma_result = chroma_results["results"][0]
            self.assertIn("chromadb", top_chroma_result["text"].lower())
        
        # Step 4: Test query with no relevant results
        irrelevant_query_response = requests.post(
            f"{SERVER_URL}/query",
            json={"query": "What is quantum computing?", "n_results": 3}
        )
        
        self.assertEqual(irrelevant_query_response.status_code, 200)
        irrelevant_results = irrelevant_query_response.json()
        
        # Results might still come back but should have higher distance scores
        if len(irrelevant_results["results"]) > 0:
            for result in irrelevant_results["results"]:
                print(f"Distance for irrelevant query: {result['distance']}")

if __name__ == "__main__":
    unittest.main()