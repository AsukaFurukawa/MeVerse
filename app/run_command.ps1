# MeVerse Command Runner for Windows PowerShell
# This script helps run commands in older versions of PowerShell that don't support the && operator

param (
    [Parameter(Mandatory=$true)]
    [string]$Directory,
    
    [Parameter(Mandatory=$true)]
    [string]$Command
)

# Output the command information
Write-Host "Running command in directory: $Directory" -ForegroundColor Cyan
Write-Host "Command: $Command" -ForegroundColor Yellow

# Change to the specified directory and run the command
Set-Location $Directory
Invoke-Expression $Command 