# PowerShell script to start the application on Windows

# Navigate to the script directory
Set-Location $PSScriptRoot

# Start the ChromaDB Flask server in the background
Write-Host "Starting ChromaDB Flask server..."
$flask_job = Start-Job -ScriptBlock {
    python chroma_server.py
}

# Change to the BetterChatGPT directory
Set-Location BetterChatGPT

# Start the BetterChatGPT app
Write-Host "Starting BetterChatGPT app..."
try {
    npm run dev
}
finally {
    # When the app is terminated, also terminate the Flask server job
    Write-Host "Stopping ChromaDB Flask server..."
    Stop-Job -Job $flask_job
    Remove-Job -Job $flask_job -Force
}