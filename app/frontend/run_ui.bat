@echo off
REM Run the Next.js frontend for MeVerse Digital Twin
REM This needs to be executed from the frontend directory

echo Starting MeVerse frontend...

REM Check if we're already in the frontend directory
if exist "package.json" (
    echo Found package.json in current directory
) else (
    echo Changing to the frontend directory
    cd %~dp0
)

REM Check if node_modules exists, if not install dependencies
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

REM Set the API URL environment variable
set "NEXT_PUBLIC_API_URL=http://localhost:8000/api"

REM Start the development server
echo Starting Next.js development server...
call npm run dev

echo MeVerse frontend stopped. 