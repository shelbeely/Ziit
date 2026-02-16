# user-prompt.ps1 - Hook for user prompt submitted events

$ErrorActionPreference = "Stop"

# Read JSON input from stdin
$input = [Console]::In.ReadToEnd() | ConvertFrom-Json

# Extract values
$timestamp = $input.timestamp
$prompt = $input.prompt
$cwd = $input.cwd

# Truncate prompt if too long
$promptPreview = if ($prompt.Length -gt 500) { $prompt.Substring(0, 500) } else { $prompt }

# Create metadata object
$metadata = @{
    prompt = $promptPreview
    cwd = $cwd
} | ConvertTo-Json -Compress

# Import and call helper function
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
. "$scriptDir\send-heartbeat.ps1"

Send-Heartbeat -Timestamp $timestamp -EventType "userPromptSubmitted" -Metadata $metadata

exit 0
