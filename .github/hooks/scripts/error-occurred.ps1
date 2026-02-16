# error-occurred.ps1 - Hook for error occurred events

$ErrorActionPreference = "Stop"

# Read JSON input from stdin
$input = [Console]::In.ReadToEnd() | ConvertFrom-Json

# Extract values
$timestamp = $input.timestamp
$errorMsg = $input.error.message
$errorName = $input.error.name
$cwd = $input.cwd

# Create metadata object
$metadata = @{
    errorMessage = $errorMsg
    errorName = $errorName
    cwd = $cwd
} | ConvertTo-Json -Compress

# Import and call helper function
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
. "$scriptDir\send-heartbeat.ps1"

Send-Heartbeat -Timestamp $timestamp -EventType "errorOccurred" -Metadata $metadata

# Log the error (optional)
Write-Error "Copilot error: [$errorName] $errorMsg"

exit 0
