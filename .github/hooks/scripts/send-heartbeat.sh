#!/bin/bash
# send-heartbeat.sh - Helper script to send heartbeat to Ziit API

set -euo pipefail

# Read configuration from environment or use defaults
ZIIT_API_URL="${ZIIT_API_URL:-https://ziit.app}"
ZIIT_API_KEY="${ZIIT_API_KEY:-}"

# Function to send heartbeat
send_heartbeat() {
    local timestamp="$1"
    local event_type="$2"
    local tool_name="${3:-}"
    local metadata="${4:-{}}"
    
    # Skip if no API key is configured
    if [ -z "$ZIIT_API_KEY" ]; then
        return 0
    fi
    
    # Get current working directory, editor, OS, and other info
    local cwd="${PWD}"
    local project_name=$(basename "$cwd")
    local editor="GitHub Copilot Agent"
    local os_name=$(uname -s)
    
    # Construct heartbeat payload
    local payload=$(cat <<EOF
{
  "timestamp": $timestamp,
  "project": "$project_name",
  "language": "Unknown",
  "editor": "$editor",
  "os": "$os_name",
  "file": "copilot-agent",
  "category": "copilot-agent",
  "eventType": "$event_type",
  "toolName": "$tool_name",
  "metadata": $metadata
}
EOF
)
    
    # Send to API (silently, don't block on errors)
    curl -X POST \
        -H "Authorization: Bearer $ZIIT_API_KEY" \
        -H "Content-Type: application/json" \
        -d "$payload" \
        "$ZIIT_API_URL/api/external/heartbeat" \
        --silent --show-error --max-time 5 >/dev/null 2>&1 || true
}

# Export function for use in other scripts
export -f send_heartbeat
