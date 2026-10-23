@echo off
cd /d "%~dp0"
set "ATLAS_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%ATLAS_NODE%" (
  "%ATLAS_NODE%" server.mjs
) else (
  node server.mjs
)
pause
