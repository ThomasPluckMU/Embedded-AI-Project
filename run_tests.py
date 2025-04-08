#!/usr/bin/env python3
"""
Test runner for Embedded AI Project.
Runs all integration tests for the RAG functionality.
"""

import os
import sys
import argparse
import subprocess

def main():
    """Main function to run tests."""
    parser = argparse.ArgumentParser(description='Run tests for Embedded AI Project')
    parser.add_argument('--backend-only', action='store_true', help='Run only backend tests')
    parser.add_argument('--e2e-only', action='store_true', help='Run only end-to-end tests')
    parser.add_argument('--browser', default='chrome', choices=['chrome', 'firefox', 'edge'],
                        help='Browser to use for end-to-end testing (default: chrome)')
    parser.add_argument('--api-key', default='', help='API key for the ChatGPT service')
    
    args = parser.parse_args()
    
    # Determine which tests to run
    run_backend = not args.e2e_only
    run_e2e = not args.backend_only

    print("="*80)
    print(" Embedded AI Project - Test Runner")
    print("="*80)
    
    if run_backend:
        print("\nRunning backend tests...")
        backend_cmd = [sys.executable, "-m", "pytest", "tests/test_rag.py", "-v"]
        backend_result = subprocess.run(backend_cmd)
        
        if backend_result.returncode != 0:
            print("❌ Backend tests failed.")
            if not run_e2e:
                sys.exit(backend_result.returncode)
        else:
            print("✅ Backend tests passed.")
    
    if run_e2e:
        print("\nRunning end-to-end tests...")
        e2e_cmd = [sys.executable, "tests/e2e_rag_test.py", "--browser", args.browser]
        if args.api_key:
            e2e_cmd.extend(["--api-key", args.api_key])
            
        e2e_result = subprocess.run(e2e_cmd)
        
        if e2e_result.returncode != 0:
            print("❌ End-to-end tests failed.")
            sys.exit(e2e_result.returncode)
        else:
            print("✅ End-to-end tests passed.")
    
    print("\n✅ All tests passed!")

if __name__ == "__main__":
    main()