@echo off
echo Starting FractureAI Pro...
echo Please wait a moment while the server starts up.

:: Move to the frontend directory
cd frontend

:: Open the web browser automatically
start http://localhost:3000

:: We MUST use 'call' before npm on Windows inside a batch file, otherwise it closes immediately!
call npm run dev

pause
