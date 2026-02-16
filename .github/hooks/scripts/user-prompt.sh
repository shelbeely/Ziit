#!/bin/bash
# user-prompt.sh - Hook for user prompt submitted events

set -euo pipefail

# Read JSON input from stdin
INPUT=$(cat)

# Parse input using jq
TIMESTAMP=$(echo "$INPUT" | jq -r '.timestamp')
PROMPT=$(echo "$INPUT" | jq -r '.prompt')
CWD=$(echo "$INPUT" | jq -r '.cwd')

# Create metadata object (truncate prompt if too long)
PROMPT_PREVIEW=$(echo "$PROMPT" | head -c 500)
METADATA=$(jq -n \
    --arg prompt "$PROMPT_PREVIEW" \
    --arg cwd "$CWD" \
    '{prompt: $prompt, cwd: $cwd}')

# Source the helper script and send heartbeat
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/send-heartbeat.sh"

send_heartbeat "$TIMESTAMP" "userPromptSubmitted" "" "$METADATA"

exit 0
