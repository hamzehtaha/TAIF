#!/bin/bash
set -e

echo "Waiting for SQL Server to be ready..."
echo "Giving SQL Server 30 seconds to start up..."
sleep 30

echo "Starting TAIF API..."
echo "Note: Database will be created automatically on first connection"
exec dotnet TAIF.API.dll
