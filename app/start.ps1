# MeVerse Digital Twin Starter Script for Windows
# This script starts both the backend and frontend in separate PowerShell windows

Write-Host "Starting MeVerse Digital Twin..." -ForegroundColor Cyan

# Get the current directory
$appDir = $PSScriptRoot

# Check if frontend directory exists
$frontendDir = Join-Path -Path $appDir -ChildPath "frontend"
if (-not (Test-Path $frontendDir)) {
    Write-Host "Error: Frontend directory not found at $frontendDir" -ForegroundColor Red
    exit 1
}

# Start the backend
Write-Host "Starting backend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$appDir'; python -m app.main"

# Wait a bit for backend to start
Start-Sleep -Seconds 2

# Start the frontend
Write-Host "Starting frontend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendDir'; npm run dev"

Write-Host "`nMeVerse Digital Twin is starting up!" -ForegroundColor Cyan
Write-Host "- Backend: http://localhost:8000" -ForegroundColor Yellow
Write-Host "- Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "`nClose the terminal windows to stop the servers" -ForegroundColor Gray 