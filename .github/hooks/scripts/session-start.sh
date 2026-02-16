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

# Create metadata object
METADATA=$(jq -n \
    --arg source "$SOURCE" \
    --arg cwd "$CWD" \
    --arg initialPrompt "$INITIAL_PROMPT" \
    '{source: $source, cwd: $cwd, initialPrompt: $initialPrompt}')

# Source the helper script and send heartbeat
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/send-heartbeat.sh"

send_heartbeat "$TIMESTAMP" "sessionStart" "" "$METADATA"

# Log the session start (optional)
echo "Copilot session started from $SOURCE" >&2

exit 0
