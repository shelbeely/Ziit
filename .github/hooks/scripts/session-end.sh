#!/bin/bash
# session-end.sh - Hook for session end events

set -euo pipefail

# Read JSON input from stdin
INPUT=$(cat)

# Parse input using jq
TIMESTAMP=$(echo "$INPUT" | jq -r '.timestamp')
REASON=$(echo "$INPUT" | jq -r '.reason')
CWD=$(echo "$INPUT" | jq -r '.cwd')

# Create metadata object
METADATA=$(jq -n \
    --arg reason "$REASON" \
    --arg cwd "$CWD" \
    '{reason: $reason, cwd: $cwd}')

# Source the helper script and send heartbeat
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/send-heartbeat.sh"

send_heartbeat "$TIMESTAMP" "sessionEnd" "" "$METADATA"

# Log the session end (optional)
echo "Copilot session ended: $REASON" >&2

exit 0
