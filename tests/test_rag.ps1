# PowerShell script to run RAG integration tests

# Get the directory of this script
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir

# Make sure ChromaDB server is stopped
Get-Process -Name python -ErrorAction SilentlyContinue | 
    Where-Object { $_.CommandLine -like "*chroma_server.py*" } | 
    Stop-Process -Force -ErrorAction SilentlyContinue

# Run the integration test
Write-Host "Running RAG integration tests..."
Set-Location $projectRoot
python -m pytest "$scriptDir\test_rag.py" -v

# Display test results status
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ All tests passed!" -ForegroundColor Green
} else {
    Write-Host "❌ Tests failed." -ForegroundColor Red
}