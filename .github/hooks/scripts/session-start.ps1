# session-start.ps1 - Hook for session start events

$ErrorActionPreference = "Stop"

# Read JSON input from stdin
$input = [Console]::In.ReadToEnd() | ConvertFrom-Json

# Extract values
$timestamp = $input.timestamp
$source = $input.source
$cwd = $input.cwd
$initialPrompt = if ($input.initialPrompt) { $input.initialPrompt } else { "" }

# Create metadata object
$metadata = @{
    source = $source
    cwd = $cwd
    initialPrompt = $initialPrompt
} | ConvertTo-Json -Compress

# Import and call helper function
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
. "$scriptDir\send-heartbeat.ps1"

Send-Heartbeat -Timestamp $timestamp -EventType "sessionStart" -Metadata $metadata

# Log the session start (optional)
Write-Error "Copilot session started from $source"

exit 0
