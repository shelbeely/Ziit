# GitHub Copilot Coding Agent Heartbeat Integration

This directory contains hooks for integrating Ziit with GitHub Copilot Coding Agent to track agent activity and usage.

## Overview

The hooks system allows Ziit to receive heartbeats from GitHub Copilot Coding Agent at key points during agent execution:

- **Session Start/End**: Track when agent sessions begin and complete
- **User Prompts**: Record when users submit prompts to the agent
- **Tool Usage**: Monitor pre and post tool execution (bash, edit, view, etc.)
- **Errors**: Capture error events during agent execution

## Setup

### Prerequisites

1. A Ziit instance (self-hosted or https://ziit.app)
2. A Ziit API key (found in your Ziit account settings)
3. GitHub Copilot Coding Agent enabled in your repository

### Configuration

1. **Set Environment Variables**

   Add these to your shell profile (`.bashrc`, `.zshrc`, etc.) or PowerShell profile:

   ```bash
   # For bash/zsh
   export ZIIT_API_URL="https://ziit.app"  # or your self-hosted instance URL
   export ZIIT_API_KEY="your-api-key-here"
   ```

   ```powershell
   # For PowerShell
   $env:ZIIT_API_URL = "https://ziit.app"
   $env:ZIIT_API_KEY = "your-api-key-here"
   ```

2. **Verify Hooks are Active**

   The hooks will automatically activate when:
   - The `heartbeat-hooks.json` file exists in `.github/hooks/`
   - The repository is on the default branch
   - You're using GitHub Copilot Coding Agent

## How It Works

### Hook Events

Each hook script receives JSON input from the agent and sends a heartbeat to Ziit:

#### Session Start
```json
{
  "timestamp": 1704614400000,
  "cwd": "/path/to/project",
  "source": "new",
  "initialPrompt": "Create a new feature"
}
```

#### Session End
```json
{
  "timestamp": 1704618000000,
  "cwd": "/path/to/project",
  "reason": "complete"
}
```

#### User Prompt Submitted
```json
{
  "timestamp": 1704614500000,
  "cwd": "/path/to/project",
  "prompt": "Fix the authentication bug"
}
```

#### Pre/Post Tool Use
```json
{
  "timestamp": 1704614600000,
  "cwd": "/path/to/project",
  "toolName": "bash",
  "toolArgs": "{\"command\":\"npm test\"}"
}
```

#### Error Occurred
```json
{
  "timestamp": 1704614800000,
  "cwd": "/path/to/project",
  "error": {
    "message": "Network timeout",
    "name": "TimeoutError"
  }
}
```

### Heartbeat Data Structure

Extended heartbeat payload sent to Ziit:

```json
{
  "timestamp": 1704614400000,
  "project": "my-project",
  "language": "Unknown",
  "editor": "GitHub Copilot Agent",
  "os": "Linux",
  "file": "copilot-agent",
  "category": "copilot-agent",
  "eventType": "sessionStart",
  "toolName": "bash",
  "metadata": {
    "source": "new",
    "cwd": "/path/to/project",
    "initialPrompt": "Create a new feature"
  }
}
```

### New Heartbeat Fields

- **category**: Distinguishes between regular IDE heartbeats (`coding`) and Copilot agent events (`copilot-agent`)
- **eventType**: The hook event type (`sessionStart`, `sessionEnd`, `userPromptSubmitted`, `preToolUse`, `postToolUse`, `errorOccurred`)
- **toolName**: Name of the tool being used (for tool-related events)
- **metadata**: Additional context as JSON (prompt text, error details, tool arguments, etc.)

## Scripts

### Bash Scripts (Linux/macOS)

- `send-heartbeat.sh`: Helper function to send heartbeats to Ziit API
- `session-start.sh`: Handles session start events
- `session-end.sh`: Handles session end events
- `user-prompt.sh`: Handles user prompt submission events
- `pre-tool-use.sh`: Handles pre-tool use events (can approve/deny tool execution)
- `post-tool-use.sh`: Handles post-tool use events
- `error-occurred.sh`: Handles error events

### PowerShell Scripts (Windows)

Equivalent PowerShell versions are provided for Windows users:

- `send-heartbeat.ps1`
- `session-start.ps1`
- `session-end.ps1`
- `user-prompt.ps1`
- `pre-tool-use.ps1`
- `post-tool-use.ps1`
- `error-occurred.ps1`

## Privacy & Security

- Heartbeats are sent asynchronously and don't block agent execution
- Failures are silently ignored to prevent disrupting the agent
- Prompts are truncated to 500 characters in metadata
- All data stays on your Ziit instance (self-hosted or chosen public instance)
- API keys are read from environment variables, never hardcoded

## Troubleshooting

### Hooks Not Executing

1. Verify the hooks file is in `.github/hooks/` on the default branch
2. Check JSON syntax: `jq . .github/hooks/heartbeat-hooks.json`
3. Ensure scripts are executable: `chmod +x .github/hooks/scripts/*.sh`
4. Verify scripts have proper shebang: `#!/bin/bash`

### No Heartbeats in Ziit

1. Confirm `ZIIT_API_KEY` environment variable is set
2. Check `ZIIT_API_URL` points to correct instance
3. Verify API key is valid in Ziit account settings
4. Check network connectivity to Ziit instance

### Script Errors

Enable debug mode in bash scripts:
```bash
set -x  # Add at top of script
```

Test scripts manually:
```bash
echo '{"timestamp":1704614400000,"cwd":"/tmp","source":"new"}' | ./.github/hooks/scripts/session-start.sh
```

## Advanced Usage

### Custom Metadata

You can extend the scripts to include additional metadata:

```bash
# In send-heartbeat.sh, add custom fields
METADATA=$(jq -n \
    --arg custom "value" \
    '{customField: $custom}')
```

### Filtering Tool Events

Only track specific tools by modifying the hook scripts:

```bash
# In pre-tool-use.sh, filter by tool name
if [ "$TOOL_NAME" != "bash" ]; then
    exit 0  # Skip non-bash tools
fi
```

### Denying Tool Execution

Implement security policies in `pre-tool-use.sh`:

```bash
# Block dangerous commands
if echo "$TOOL_ARGS" | grep -qE "rm -rf /"; then
    echo '{"permissionDecision":"deny","permissionDecisionReason":"Dangerous command"}' | jq -c
    exit 0
fi
```

## References

- [GitHub Copilot Hooks Documentation](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/use-hooks)
- [Hooks Configuration Reference](https://docs.github.com/en/copilot/reference/hooks-configuration)
- [Ziit Documentation](https://docs.ziit.app)

## Support

For issues or questions:
- Ziit Issues: https://github.com/0PandaDEV/Ziit/issues
- Ziit Discord: https://discord.gg/Y7SbYphVw9
- GitHub Copilot Support: https://github.com/github/copilot-docs
