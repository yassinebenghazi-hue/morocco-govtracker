@echo off
title Morocco GovTracker
rem Source lives in this OneDrive folder; node_modules must NOT (OneDrive sync corrupts installs).
rem So the source is mirrored to %USERPROFILE%\govtracker-run and installed + served from there.
set "SRC=%~dp0"
set "RUN=%USERPROFILE%\govtracker-run"
set "PATH=%ProgramFiles%\nodejs;%PATH%"
robocopy "%SRC%." "%RUN%" /MIR /XD node_modules dist /XF morocco-govtracker.zip start.bat /NFL /NDL /NJH /NJS /NP >nul
cd /d "%RUN%"
if not exist node_modules call npm install
echo Morocco GovTracker - http://localhost:5180  (Ctrl+C to stop)
call npm run dev -- --open --port 5180
pause
