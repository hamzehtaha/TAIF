@echo off
REM TAIF Flutter Run Wrapper - Defaults to dev flavor
REM Usage: run.bat [device_id]

if "%~1"=="" (
    flutter run --flavor dev
) else (
    flutter run --flavor dev -d %1
)
