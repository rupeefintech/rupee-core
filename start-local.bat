@echo off
title BankInfoHub - Local Dev
color 0B

echo.
echo  ============================================
echo    BankInfoHub - Local Development Setup
echo  ============================================
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js not found. Download from https://nodejs.org
    pause & exit /b 1
)
echo  [OK] Node.js: & node --version

:: Remove stale DB at wrong location (root/data/) if it exists
if exist "%~dp0data\bankinfohub.db" (
    echo  [CLEAN] Removing DB from wrong location: %~dp0data\
    del /f /q "%~dp0data\bankinfohub.db" 2>nul
)

:: Clean old better-sqlite3 if present
if exist "%~dp0backend\node_modules\better-sqlite3" (
    echo  [CLEAN] Removing old node_modules with better-sqlite3...
    rd /s /q "%~dp0backend\node_modules"
    echo  [OK] Cleaned
)

:: Backend install
echo.
echo  [1/4] Installing backend dependencies...
cd /d "%~dp0backend"
call npm install
if %errorlevel% neq 0 ( echo  [ERROR] Backend install failed & pause & exit /b 1 )
echo  [OK] Backend ready

:: Seed DB — always in backend\data\
if not exist "%~dp0backend\data" mkdir "%~dp0backend\data"
if not exist "%~dp0backend\data\bankinfohub.db" (
    echo.
    echo  [2/4] Creating database at backend\data\bankinfohub.db ...
    set NODE_OPTIONS=--experimental-sqlite
    call npx tsx src/seed-sample.ts
    if %errorlevel% neq 0 ( echo  [ERROR] Seeding failed & pause & exit /b 1 )
    echo  [OK] Database ready
) else (
    echo  [OK] Database exists at backend\data\bankinfohub.db
)

:: Frontend install
echo.
echo  [3/4] Installing frontend dependencies...
cd /d "%~dp0frontend"
call npm install
if %errorlevel% neq 0 ( echo  [ERROR] Frontend install failed & pause & exit /b 1 )
echo  [OK] Frontend ready

echo.
echo  [4/4] Starting servers...
echo.
echo  ============================================
echo    Backend API  :  http://localhost:3001
echo    Frontend     :  http://localhost:3000
echo    DB location  :  backend\data\bankinfohub.db
echo  ============================================
echo.

start "BankInfoHub API :3001" cmd /k "cd /d "%~dp0backend" && set NODE_OPTIONS=--experimental-sqlite && npx tsx watch src/index.ts"
timeout /t 4 /nobreak >nul
start "BankInfoHub Frontend :3000" cmd /k "cd /d "%~dp0frontend" && npx vite"

timeout /t 5 /nobreak >nul
start http://localhost:3000
echo  Close the two server windows to stop.
pause
