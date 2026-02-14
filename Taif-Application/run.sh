#!/bin/bash
# TAIF Flutter Run Wrapper - Defaults to dev flavor
# Usage: ./run.sh [device_id]

if [ -z "$1" ]; then
    flutter run --flavor dev
else
    flutter run --flavor dev -d "$1"
fi
