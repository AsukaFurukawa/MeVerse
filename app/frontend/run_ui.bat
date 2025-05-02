@echo off
echo =======================================
echo MeVerse UI Development Server
echo =======================================
echo.
echo Starting development server...
echo.

cd %~dp0
if not exist node_modules (
  echo Installing dependencies first...
  npm install
)

npm run dev 