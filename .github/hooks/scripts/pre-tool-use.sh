#!/bin/bash
# pre-tool-use.sh - Hook for pre-tool use events

set -euo pipefail

# Read JSON input from stdin
INPUT=$(cat)

# Parse input using jq
TIMESTAMP=$(echo "$INPUT" | jq -r '.timestamp')
TOOL_NAME=$(echo "$INPUT" | jq -r '.toolName')
TOOL_ARGS=$(echo "$INPUT" | jq -r '.toolArgs')
CWD=$(echo "$INPUT" | jq -r '.cwd')

# Create metadata object
METADATA=$(jq -n \
    --arg toolArgs "$TOOL_ARGS" \
    --arg cwd "$CWD" \
    '{toolArgs: $toolArgs, cwd: $cwd}')

# Source the helper script and send heartbeat
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/send-heartbeat.sh"

send_heartbeat "$TIMESTAMP" "preToolUse" "$TOOL_NAME" "$METADATA"

# Allow the tool to execute by default
# To deny, output: echo '{"permissionDecision":"deny","permissionDecisionReason":"Reason here"}'
exit 0
