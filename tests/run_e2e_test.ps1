# PowerShell script to run end-to-end RAG tests

param (
    [string]$browser = "chrome",
    [string]$apiKey = ""
)

# Get the directory of this script
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir

# Show usage information
function Show-Usage {
    Write-Host "Usage: .\run_e2e_test.ps1 [-browser chrome|firefox|edge] [-apiKey YOUR_API_KEY]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -browser    Browser to use for testing (default: chrome)"
    Write-Host "  -apiKey     Your OpenAI API key"
    Write-Host ""
    exit 1
}

# Validate browser parameter
if ($browser -notin @("chrome", "firefox", "edge")) {
    Write-Host "Invalid browser: $browser" -ForegroundColor Red
    Show-Usage
}

# Change to project root directory
Set-Location $projectRoot

# Check if ChromaDB server is running
$chromaRunning = Get-Process -Name python -ErrorAction SilentlyContinue | 
    Where-Object { $_.CommandLine -like "*chroma_server.py*" }

if (-not $chromaRunning) {
    Write-Host "Starting ChromaDB server..."
    $chromaJob = Start-Job -ScriptBlock {
        python $using:projectRoot\chroma_server.py
    }
    # Give it time to start up
    Start-Sleep -Seconds 3
} else {
    Write-Host "ChromaDB server is already running."
    $chromaJob = $null
}

# Check if BetterChatGPT is running
try {
    $null = Invoke-WebRequest -Uri "http://localhost:5173" -Method Head -TimeoutSec 1 -ErrorAction Stop
    Write-Host "BetterChatGPT is already running."
    $appJob = $null
} catch {
    Write-Host "Starting BetterChatGPT..."
    $appJob = Start-Job -ScriptBlock {
        Set-Location $using:projectRoot\BetterChatGPT
        npm run dev
    }
    # Give it time to start up
    Start-Sleep -Seconds 5
}

# Run the end-to-end test
Write-Host "Running end-to-end RAG tests..."
$testArgs = @("$scriptDir\e2e_rag_test.py", "--browser", $browser)
if ($apiKey) {
    $testArgs += @("--api-key", $apiKey)
}
& python $testArgs

# Save the test result
$testResult = $LASTEXITCODE

# Clean up processes we started
if ($chromaJob) {
    Write-Host "Stopping ChromaDB server..."
    Stop-Job -Job $chromaJob
    Remove-Job -Job $chromaJob -Force
}

if ($appJob) {
    Write-Host "Stopping BetterChatGPT..."
    Stop-Job -Job $appJob
    Remove-Job -Job $appJob -Force
}

# Display test results status
if ($testResult -eq 0) {
    Write-Host "✅ All end-to-end tests passed!" -ForegroundColor Green
} else {
    Write-Host "❌ End-to-end tests failed." -ForegroundColor Red
}

exit $testResult