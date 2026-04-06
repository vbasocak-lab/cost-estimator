@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%cost-estimator\scripts\Launch-CostEstimator.ps1"

if errorlevel 1 (
  echo.
  echo EA CostEstimator acilamadi.
  echo Loglar: %SCRIPT_DIR%cost-estimator\.launcher\
  echo Cikmak icin bir tusa basin.
  pause >nul
)

endlocal