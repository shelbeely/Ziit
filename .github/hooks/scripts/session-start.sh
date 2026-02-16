#!/bin/bash
# session-start.sh - Hook for session start events

set -euo pipefail

# Read JSON input from stdin
INPUT=$(cat)

# Parse input using jq
TIMESTAMP=$(echo "$INPUT" | jq -r '.timestamp')
SOURCE=$(echo "$INPUT" | jq -r '.source')
CWD=$(echo "$INPUT" | jq -r '.cwd')
INITIAL_PROMPT=$(echo "$INPUT" | jq -r '.initialPrompt // empty')

# Generate a unique session ID and export it
export ZIIT_SESSION_ID="session-$(date +%s)-$$"

# Create metadata object with session ID
METADATA=$(jq -n \
    --arg source "$SOURCE" \
    --arg cwd "$CWD" \
    --arg initialPrompt "$INITIAL_PROMPT" \
    --arg sessionId "$ZIIT_SESSION_ID" \
    '{source: $source, cwd: $cwd, initialPrompt: $initialPrompt, sessionId: $sessionId}')

# Source the helper script and send heartbeat
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/send-heartbeat.sh"

send_heartbeat "$TIMESTAMP" "sessionStart" "" "$METADATA"

# Persist session ID for other hooks in this session
echo "$ZIIT_SESSION_ID" > /tmp/.ziit-session-id 2>/dev/null || true

# Log the session start (optional)
echo "Copilot session started from $SOURCE (Session: $ZIIT_SESSION_ID)" >&2

exit 0
