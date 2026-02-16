# post-tool-use.ps1 - Hook for post-tool use events

$ErrorActionPreference = "Stop"

# Read JSON input from stdin
$input = [Console]::In.ReadToEnd() | ConvertFrom-Json

# Extract values
$timestamp = $input.timestamp
$toolName = $input.toolName
$toolArgs = $input.toolArgs
$cwd = $input.cwd
$resultType = $input.toolResult.resultType

# Create metadata object
$metadata = @{
    toolArgs = $toolArgs
    cwd = $cwd
    resultType = $resultType
} | ConvertTo-Json -Compress

# Import and call helper function
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
. "$scriptDir\send-heartbeat.ps1"

Send-Heartbeat -Timestamp $timestamp -EventType "postToolUse" -ToolName $toolName -Metadata $metadata

exit 0
