@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js not found install nodejs.org
  pause
  exit /b 1
)
if not exist node_modules (
  npm install
)
node bridge.js
pause
