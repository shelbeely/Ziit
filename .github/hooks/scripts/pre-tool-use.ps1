# pre-tool-use.ps1 - Hook for pre-tool use events

$ErrorActionPreference = "Stop"

# Read JSON input from stdin
$input = [Console]::In.ReadToEnd() | ConvertFrom-Json

# Extract values
$timestamp = $input.timestamp
$toolName = $input.toolName
$toolArgs = $input.toolArgs
$cwd = $input.cwd

# Create metadata object
$metadata = @{
    toolArgs = $toolArgs
    cwd = $cwd
} | ConvertTo-Json -Compress

# Import and call helper function
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
. "$scriptDir\send-heartbeat.ps1"

Send-Heartbeat -Timestamp $timestamp -EventType "preToolUse" -ToolName $toolName -Metadata $metadata

# Allow the tool to execute by default
# To deny, output: '{"permissionDecision":"deny","permissionDecisionReason":"Reason here"}' | ConvertTo-Json -Compress

exit 0
