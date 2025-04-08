#!/usr/bin/env python3
"""
End-to-end test for the RAG capabilities of the BetterChatGPT + ChromaDB integration.
This test requires:
1. The ChromaDB server to be running
2. The BetterChatGPT frontend to be running

This test uses Selenium to interact with the UI, so the appropriate WebDriver 
should be installed and available in your PATH.
"""

import os
import time
import json
import argparse
import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class BetterChatGPTRAGTest(unittest.TestCase):
    """Test the RAG capabilities via the BetterChatGPT UI."""
    
    @classmethod
    def setUpClass(cls):
        """Set up the webdriver."""
        parser = argparse.ArgumentParser(description='End-to-end RAG testing for BetterChatGPT')
        parser.add_argument('--browser', default='chrome', choices=['chrome', 'firefox', 'edge'],
                            help='Browser to use for testing')
        parser.add_argument('--url', default='http://localhost:5173',
                            help='URL of the BetterChatGPT application')
        parser.add_argument('--api-key', default='',
                            help='API key for the ChatGPT service')
        
        cls.args = parser.parse_args()
        
        # Initialize the webdriver based on the chosen browser
        if cls.args.browser == 'chrome':
            options = webdriver.ChromeOptions()
            options.add_argument('--headless')
            cls.driver = webdriver.Chrome(options=options)
        elif cls.args.browser == 'firefox':
            options = webdriver.FirefoxOptions()
            options.add_argument('--headless')
            cls.driver = webdriver.Firefox(options=options)
        elif cls.args.browser == 'edge':
            options = webdriver.EdgeOptions()
            options.add_argument('--headless')
            cls.driver = webdriver.Edge(options=options)
        
        # Set window size
        cls.driver.set_window_size(1280, 800)
        
        # Navigate to the application
        cls.driver.get(cls.args.url)
        
        # Wait for the application to load
        WebDriverWait(cls.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "div.App"))
        )
        
    @classmethod
    def tearDownClass(cls):
        """Close the webdriver."""
        cls.driver.quit()
    
    def setUp(self):
        """Prepare for each test."""
        # If API key is provided, set it in the application
        if self.args.api_key:
            # Click on the API settings button
            api_button = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='api-menu']")
            api_button.click()
            
            # Wait for the API settings modal to appear
            WebDriverWait(self.driver, 5).until(
                EC.visibility_of_element_located((By.CSS_SELECTOR, "div.api-modal"))
            )
            
            # Enter the API key
            api_input = self.driver.find_element(By.CSS_SELECTOR, "input[type='password']")
            api_input.clear()
            api_input.send_keys(self.args.api_key)
            
            # Save the API key
            save_button = self.driver.find_element(By.CSS_SELECTOR, "button.save-button")
            save_button.click()
            
            # Wait for the modal to close
            WebDriverWait(self.driver, 5).until(
                EC.invisibility_of_element_located((By.CSS_SELECTOR, "div.api-modal"))
            )
    
    def test_rag_functionality(self):
        """Test the RAG functionality by sending a query and checking response."""
        
        # Step 1: Create a new chat
        # Click on the "New Chat" button
        new_chat_button = self.driver.find_element(By.CSS_SELECTOR, "button.new-chat-button")
        new_chat_button.click()
        
        # Step 2: Find the input field and enter a message that will ingest content
        input_field = self.driver.find_element(By.CSS_SELECTOR, "textarea.chat-input")
        
        # Send a message about embedded AI
        message = """
        Let me tell you about Embedded AI systems. They combine machine learning models with hardware 
        devices to enable on-device intelligence. TinyML is a field of machine learning focused on 
        running ML models on microcontrollers and other resource-constrained devices.
        
        Edge computing processes data near the source rather than in a centralized data center, 
        reducing latency and bandwidth usage.
        
        ChromaDB is a vector database used for storing and retrieving embeddings for 
        similarity search in RAG applications.
        
        Retrieval Augmented Generation (RAG) combines information retrieval with text 
        generation to produce more accurate and contextually relevant responses.
        """
        input_field.send_keys(message)
        input_field.send_keys(Keys.CONTROL + Keys.ENTER)
        
        # Wait for the message to be processed and response to appear
        WebDriverWait(self.driver, 30).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "div.message.assistant"))
        )
        
        # Get the ingest to ChromaDB button
        time.sleep(2)  # Allow time for UI to settle
        ingest_button = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "button.ingest-to-chroma"))
        )
        ingest_button.click()
        
        # Wait for the ingest confirmation
        WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "div.toast-content"))
        )
        
        # Step 3: Send a query that should retrieve from ChromaDB
        input_field = self.driver.find_element(By.CSS_SELECTOR, "textarea.chat-input")
        query = "What is ChromaDB and how does it relate to RAG?"
        input_field.send_keys(query)
        input_field.send_keys(Keys.CONTROL + Keys.ENTER)
        
        # Wait for the response
        WebDriverWait(self.driver, 30).until(
            lambda d: len(d.find_elements(By.CSS_SELECTOR, "div.message.assistant")) >= 2
        )
        
        # Get the latest response
        responses = self.driver.find_elements(By.CSS_SELECTOR, "div.message.assistant")
        latest_response = responses[-1].text
        
        # Check if the response contains relevant information
        self.assertIn("ChromaDB", latest_response)
        self.assertIn("vector database", latest_response.lower())
        self.assertIn("RAG", latest_response)
        
        # Print the response for debugging
        print(f"Response to RAG query: {latest_response}")
        
        # Step 4: Send an unrelated query to test negative case
        input_field = self.driver.find_element(By.CSS_SELECTOR, "textarea.chat-input")
        query = "Tell me about quantum computing"
        input_field.send_keys(query)
        input_field.send_keys(Keys.CONTROL + Keys.ENTER)
        
        # Wait for the response
        WebDriverWait(self.driver, 30).until(
            lambda d: len(d.find_elements(By.CSS_SELECTOR, "div.message.assistant")) >= 3
        )
        
        # Get the latest response
        responses = self.driver.find_elements(By.CSS_SELECTOR, "div.message.assistant")
        latest_response = responses[-1].text
        
        # Print the response for debugging
        print(f"Response to unrelated query: {latest_response}")

if __name__ == "__main__":
    unittest.main()