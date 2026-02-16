#!/bin/bash
# send-heartbeat.sh - Helper script to send heartbeat to Ziit API

set -euo pipefail

# Read configuration from environment or use defaults
ZIIT_API_URL="${ZIIT_API_URL:-https://ziit.app}"
ZIIT_API_KEY="${ZIIT_API_KEY:-}"
ZIIT_SESSION_ID="${ZIIT_SESSION_ID:-}"

# Function to detect language from file path
detect_language() {
    local file_path="$1"
    local ext="${file_path##*.}"
    
    case "$ext" in
        js|jsx|mjs|cjs) echo "JavaScript" ;;
        ts|tsx) echo "TypeScript" ;;
        py|pyw) echo "Python" ;;
        java) echo "Java" ;;
        go) echo "Go" ;;
        rs) echo "Rust" ;;
        c|h) echo "C" ;;
        cpp|cc|cxx|hpp) echo "C++" ;;
        cs) echo "C#" ;;
        rb) echo "Ruby" ;;
        php) echo "PHP" ;;
        swift) echo "Swift" ;;
        kt|kts) echo "Kotlin" ;;
        scala) echo "Scala" ;;
        sh|bash) echo "Shell" ;;
        sql) echo "SQL" ;;
        html|htm) echo "HTML" ;;
        css|scss|sass|less) echo "CSS" ;;
        json) echo "JSON" ;;
        xml) echo "XML" ;;
        yaml|yml) echo "YAML" ;;
        md|markdown) echo "Markdown" ;;
        vue) echo "Vue" ;;
        *) echo "Unknown" ;;
    esac
}

# Function to get Git repository context
get_git_context() {
    local cwd="$1"
    local branch=""
    local repo_name=""
    
    if [ -d "$cwd/.git" ] || git -C "$cwd" rev-parse --git-dir > /dev/null 2>&1; then
        branch=$(git -C "$cwd" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
        repo_name=$(git -C "$cwd" config --get remote.origin.url 2>/dev/null | sed 's/.*[\/:]//;s/\.git$//' || echo "")
    fi
    
    echo "$branch|$repo_name"
}

# Function to send heartbeat
send_heartbeat() {
    local timestamp="$1"
    local event_type="$2"
    local tool_name="${3:-}"
    local metadata="${4:-{}}"
    local file_path="${5:-}"
    
    # Skip if no API key is configured
    if [ -z "$ZIIT_API_KEY" ]; then
        return 0
    fi
    
    # Get current working directory, editor, OS, and other info
    local cwd="${PWD}"
    local project_name=$(basename "$cwd")
    local editor="GitHub Copilot Agent"
    local os_name=$(uname -s)
    
    # Get Git context
    local git_info=$(get_git_context "$cwd")
    local branch=$(echo "$git_info" | cut -d'|' -f1)
    local repo_name=$(echo "$git_info" | cut -d'|' -f2)
    
    # Use repo name as project if available
    if [ -n "$repo_name" ]; then
        project_name="$repo_name"
    fi
    
    # Detect language from file path if provided
    local language="Unknown"
    local file="copilot-agent"
    if [ -n "$file_path" ]; then
        language=$(detect_language "$file_path")
        file="$file_path"
    fi
    
    # Add session ID to metadata if available
    local enhanced_metadata="$metadata"
    if [ -n "$ZIIT_SESSION_ID" ]; then
        enhanced_metadata=$(echo "$metadata" | jq --arg sid "$ZIIT_SESSION_ID" '. + {sessionId: $sid}' 2>/dev/null || echo "$metadata")
    fi
    
    # Construct heartbeat payload
    local payload=$(cat <<EOF
{
  "timestamp": $timestamp,
  "project": "$project_name",
  "language": "$language",
  "editor": "$editor",
  "os": "$os_name",
  "file": "$file",
  "branch": "$branch",
  "category": "copilot-agent",
  "eventType": "$event_type",
  "toolName": "$tool_name",
  "metadata": $enhanced_metadata
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
