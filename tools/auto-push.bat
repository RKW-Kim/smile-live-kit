@echo off
setlocal enabledelayedexpansion
echo Smile Live Kit Auto Push Windows
git rev-parse --git-dir
git fetch origin
git checkout main
git pull origin main
for /f %%i in ('powershell -command "Get-Date -Format yyyyMMdd-HHmmss"') do set TS=%%i
set BRANCH_BACKUP=backup-auto-%TS%
git checkout -b %BRANCH_BACKUP%
git push -u origin %BRANCH_BACKUP%
git checkout main
for /f %%i in ('powershell -command "Get-Date -Format yyyyMMdd-HHmm"') do set TS2=%%i
set BRANCH_FEAT=feat/fresh-v4-%TS2%
git checkout -b %BRANCH_FEAT%
del /q obs\*FINAL*.json 2>nul
del /q obs\Smile-Trading-Kit-v2.json 2>nul
del /q obs\Smile-Trading-Kit-v3.json 2>nul
del /q core\live.json 2>nul
rmdir /s /q core\vendor 2>nul
rmdir /s /q core\node_modules 2>nul
git add .
for /f %%i in ('powershell -command "Get-Date -Format yyyy-MM-ddTHH:mm:ssZ -AsUTC"') do set UTC=%%i
set COMMIT_MSG=feat: fresh v4 localhost + 1:1 SVG + validate fix - %UTC%
git commit -m "%COMMIT_MSG%"
git push -u origin %BRANCH_FEAT%
where gh >nul 2>nul
if %errorlevel%==0 (
  gh pr create --title "%COMMIT_MSG%" --body "Auto generated fresh push" --base main
) else (
  echo Create PR manually at https://github.com/RKW-Kim/smile-live-kit/compare/%BRANCH_FEAT%
)
echo Done
