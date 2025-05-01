# Embedded AI - Group 1

To use this repository, clone it:

```bash
git clone https://github.com/ThomasPluckMU/Embedded-AI-Project
```

## Installation

### Linux/macOS
```bash
# Install dependencies and set up the environment
./install.sh

# Start the application
./start.sh
```

### Windows
```powershell
# Install dependencies and set up the environment
.\install.ps1

# Start the application
.\start.ps1
```

## Testing

### RAG Integration Tests
We provide integration tests to verify the functionality of our RAG (Retrieval Augmented Generation) system with ChromaDB. All test files are located in the `tests/` directory.

#### Using the Test Runner

The easiest way to run tests is using the test runner script:

```bash
# Run all tests
python run_tests.py

# Run only backend tests
python run_tests.py --backend-only

# Run only end-to-end tests with your API key
python run_tests.py --e2e-only --browser chrome --api-key YOUR_API_KEY
```

Options:
- `--backend-only`: Run only the backend integration tests
- `--e2e-only`: Run only the end-to-end UI tests
- `--browser`: Choose the browser for testing (chrome, firefox, or edge)
- `--api-key`: Provide your OpenAI API key for testing with actual LLM responses

#### Individual Test Scripts

You can also run specific test scripts directly:

##### Backend Tests

Linux/macOS:
```bash
./tests/test_rag.sh
```

Windows:
```powershell
.\tests\test_rag.ps1
```

##### End-to-End Tests

Linux/macOS:
```bash
./tests/run_e2e_test.sh --browser chrome --api-key YOUR_API_KEY
```

Windows:
```powershell
.\tests\run_e2e_test.ps1 -browser chrome -apiKey YOUR_API_KEY
```

#### Using pytest

You can also run tests using pytest:

```bash
# Run backend tests
pytest tests/test_rag.py -v

# Run all tests
pytest tests/
```

## Task Attribution

You can build the repository in Ubuntu using `texlive` with the `latexmk` command:

```bash
cd report
latexmk -f main.tex
```