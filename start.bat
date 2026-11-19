@echo off
rem Author: Meng Siyijia (24001010430) | Date: 2026-11-19 | Model: Doubao
rem Purpose: start local MySQL (port 3307) if needed, install deps, run Express on 8325
chcp 437 >nul
setlocal
title KeTangAI Backend - port 8325
pushd "%~dp0"

echo ==================================================
echo   KeTangAI Tech News Platform - Backend Start
echo   Student: 24001010430
echo ==================================================
echo.

echo [1/3] Checking MySQL on port 3307 ...
powershell -NoProfile -Command "$c = Get-NetTCPConnection -LocalPort 3307 -State Listen -ErrorAction SilentlyContinue; if ($c) { exit 0 } else { exit 1 }"
if errorlevel 1 goto START_MYSQL
echo         MySQL is running.
goto DEP_CHECK

:START_MYSQL
set "CHENEY_MYSQLD=C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe"
echo         MySQL is not running, starting local instance ...
if exist "%CHENEY_MYSQLD%" goto DO_START_MYSQL
echo         [WARN] mysqld not found, please start MySQL manually.
goto DEP_CHECK

:DO_START_MYSQL
start "Cheney_MySQL" /min "%CHENEY_MYSQLD%" --datadir=E:\MySQLData\data --port=3307 --mysqlx=0 --log-error=E:\MySQLData\logs\mysqld.err
echo         Start command sent, waiting 8 seconds ...
timeout /t 8 /nobreak >nul
goto DEP_CHECK

:DEP_CHECK
cd /d "%~dp0backend"
if exist "node_modules" goto RUN_SERVER
echo [2/3] node_modules not found, installing dependencies ...
where cnpm >nul 2>nul
if errorlevel 1 goto NPM_INSTALL
call cnpm i
goto INSTALL_DONE

:NPM_INSTALL
echo         cnpm not found, using npm i ...
call npm i

:INSTALL_DONE
if errorlevel 1 goto INSTALL_FAIL
goto RUN_SERVER

:INSTALL_FAIL
echo         [ERROR] dependency install failed, check network and run again.
pause
popd
exit /b 1

:RUN_SERVER
echo [3/3] Starting Express server on port 8325 ...
echo.
echo     Home  : http://localhost:8325
echo     API   : http://localhost:8325/api
echo     Stop  : press Ctrl + C in this window
echo.
start "" "http://localhost:8325/index.html"
node app.js

echo.
echo Server stopped.
pause
popd
endlocal
