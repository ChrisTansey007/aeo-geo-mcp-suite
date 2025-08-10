# Start both frontend and backend MCP server

# This script will launch the backend MCP server and the frontend dev server in parallel.
# Adjust the backend path and Python command as needed for your environment.


# Correct backend path (relative to project root)
$backendPath = "./backend/mcp_server/seo_astro_analyzer_server.py"
# Correct frontend path
$frontendPath = "./frontend"


# Use venv Python and set PYTHONPATH to backend for seo_tools import
$venvPython = "./.venv/Scripts/python.exe"
$env:PYTHONPATH = "$(Resolve-Path ./backend)"
Write-Host "Starting backend MCP server..."
Start-Process -NoNewWindow -FilePath $venvPython -ArgumentList $backendPath -Environment @{"PYTHONPATH" = $env:PYTHONPATH }

Start-Sleep -Seconds 2  # Give backend time to start

Write-Host "Starting frontend dev server..."
Push-Location $frontendPath
pnpm dev
Pop-Location
