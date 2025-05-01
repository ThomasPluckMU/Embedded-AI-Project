# PowerShell script for Windows installation

# Check if chocolatey is installed, install if not
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Chocolatey package manager..."
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}

# Install Node.js and npm if not installed
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Node.js and npm..."
    choco install nodejs -y
    refreshenv
}

# Install project dependencies
Write-Host "Installing project dependencies..."
Set-Location $PSScriptRoot
npm install ./BetterChatGPT

# Install Python dependencies
Write-Host "Installing Python dependencies..."
pip install -r requirements.txt

# Start the application
Write-Host "Starting the application..."
npm run dev ./BetterChatGPT