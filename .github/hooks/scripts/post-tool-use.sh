#!/bin/bash
# post-tool-use.sh - Hook for post-tool use events

set -euo pipefail

# Read JSON input from stdin
INPUT=$(cat)

# Parse input using jq
TIMESTAMP=$(echo "$INPUT" | jq -r '.timestamp')
TOOL_NAME=$(echo "$INPUT" | jq -r '.toolName')
TOOL_ARGS=$(echo "$INPUT" | jq -r '.toolArgs')
CWD=$(echo "$INPUT" | jq -r '.cwd')
RESULT_TYPE=$(echo "$INPUT" | jq -r '.toolResult.resultType')

# Create metadata object
METADATA=$(jq -n \
    --arg toolArgs "$TOOL_ARGS" \
    --arg cwd "$CWD" \
    --arg resultType "$RESULT_TYPE" \
    '{toolArgs: $toolArgs, cwd: $cwd, resultType: $resultType}')

# Source the helper script and send heartbeat
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/send-heartbeat.sh"

send_heartbeat "$TIMESTAMP" "postToolUse" "$TOOL_NAME" "$METADATA"

exit 0
