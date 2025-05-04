# MeVerse Startup Script
# This script navigates to the correct directory and starts the development server

Write-Host "Navigating to the frontend directory..."
Set-Location -Path "$PSScriptRoot\app\frontend"

Write-Host "Starting the development server..."
Write-Host "To stop the server, press Ctrl+C"

# Run npm command (compatible with Windows PowerShell)
& npm run dev

Write-Host "Server is running on http://localhost:3000" 