# session-end.ps1 - Hook for session end events

$ErrorActionPreference = "Stop"

# Read JSON input from stdin
$input = [Console]::In.ReadToEnd() | ConvertFrom-Json

# Extract values
$timestamp = $input.timestamp
$reason = $input.reason
$cwd = $input.cwd

# Create metadata object
$metadata = @{
    reason = $reason
    cwd = $cwd
} | ConvertTo-Json -Compress

# Import and call helper function
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
. "$scriptDir\send-heartbeat.ps1"

Send-Heartbeat -Timestamp $timestamp -EventType "sessionEnd" -Metadata $metadata

# Log the session end (optional)
Write-Error "Copilot session ended: $reason"

exit 0
