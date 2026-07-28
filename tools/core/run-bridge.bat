@echo off
setlocal
title Smile Live Kit v2
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo [error] Node.js not found. Install https://nodejs.org LTS
  pause
  exit /b 1
)
if not exist node_modules (
  echo [setup] npm install
  call npm install --no-audit --no-fund
)
if not exist secrets.env (
  echo [setup] Creating secrets.env
  copy secrets.env.example secrets.env
  echo [action] Edit secrets.env and add TWELVE_DATA_API_KEY + OBS_WS_PASSWORD
)
echo [bridge] http://localhost:8787
node bridge.js
pause
