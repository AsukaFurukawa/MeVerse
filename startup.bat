@echo off
echo MeVerse Startup Script
echo This script navigates to the correct directory and starts the development server

echo Navigating to the frontend directory...
cd %~dp0\app\frontend

echo Starting the development server...
echo To stop the server, press Ctrl+C

npm run dev

echo Server is running on http://localhost:3000 