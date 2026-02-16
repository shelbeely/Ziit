#!/bin/bash
# error-occurred.sh - Hook for error occurred events

set -euo pipefail

# Read JSON input from stdin
INPUT=$(cat)

# Parse input using jq
TIMESTAMP=$(echo "$INPUT" | jq -r '.timestamp')
ERROR_MSG=$(echo "$INPUT" | jq -r '.error.message')
ERROR_NAME=$(echo "$INPUT" | jq -r '.error.name')
CWD=$(echo "$INPUT" | jq -r '.cwd')

# Load session ID if available
if [ -f /tmp/.ziit-session-id ]; then
    export ZIIT_SESSION_ID=$(cat /tmp/.ziit-session-id)
fi

# Create metadata object
METADATA=$(jq -n \
    --arg errorMessage "$ERROR_MSG" \
    --arg errorName "$ERROR_NAME" \
    --arg cwd "$CWD" \
    '{errorMessage: $errorMessage, errorName: $errorName, cwd: $cwd}')

# Source the helper script and send heartbeat
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/send-heartbeat.sh"

send_heartbeat "$TIMESTAMP" "errorOccurred" "" "$METADATA"

# Log the error (optional)
echo "Copilot error: [$ERROR_NAME] $ERROR_MSG" >&2

exit 0
