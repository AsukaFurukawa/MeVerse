@echo off
REM Script to start both the MeVerse backend and frontend services

echo =============================================
echo          MeVerse Digital Twin Starter
echo =============================================
echo.

REM Create admin user first
echo Setting up admin user...
python scripts/create_admin.py

REM Start the backend in a new terminal window
echo Starting Backend API Server...
start cmd /k "title MeVerse Backend && python app.py"

REM Wait a moment for the backend to initialize
timeout /t 5 /nobreak > nul

REM Start the frontend in a new terminal window
echo Starting Frontend...
start cmd /k "title MeVerse Frontend && cd app\frontend && run_ui.bat"

echo.
echo MeVerse applications started in separate windows.
echo.
echo Admin credentials:
echo   Username: meverse_admin
echo   Password: DigitalTwin2023!
echo.
echo Press any key to close this window...
pause > nul 