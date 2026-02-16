# Advanced Usage Guide for Ziit-Agent Hooks

This guide covers advanced usage patterns and configuration options for GitHub Copilot Coding Agent integration.

## Session Tracking

Sessions are automatically tracked with unique IDs generated at session start. All heartbeats within a session include the same `sessionId` in their metadata, making it easy to:

- Group related activities
- Analyze session duration
- Track tool usage patterns within sessions
- Identify error rates per session

### Session Flow

```
sessionStart → generates session-{timestamp}-{pid}
    ↓
userPromptSubmitted → includes sessionId
    ↓
preToolUse → includes sessionId + file context
    ↓
postToolUse → includes sessionId + file context + result
    ↓
sessionEnd → includes sessionId + cleanup
```

## Language Detection

The hooks automatically detect programming languages from file extensions during tool events:

- **edit**, **view**, **create** tools: Extract file path and detect language
- Supports 30+ languages including JavaScript, TypeScript, Python, Go, Rust, etc.
- Falls back to "Unknown" for unrecognized extensions

### Supported Languages

| Extension | Language | Extension | Language |
|-----------|----------|-----------|----------|
| .js, .jsx, .mjs, .cjs | JavaScript | .ts, .tsx | TypeScript |
| .py, .pyw | Python | .java | Java |
| .go | Go | .rs | Rust |
| .c, .h | C | .cpp, .cc, .cxx, .hpp | C++ |
| .cs | C# | .rb | Ruby |
| .php | PHP | .swift | Swift |
| .kt, .kts | Kotlin | .scala | Scala |
| .sh, .bash | Shell | .sql | SQL |
| .html, .htm | HTML | .css, .scss, .sass, .less | CSS |
| .vue | Vue | .md, .markdown | Markdown |

## Git Context Detection

The hooks automatically detect Git repository context:

- **Repository name**: Extracted from remote origin URL
- **Branch name**: Current Git branch
- **Project name**: Uses repository name if available, falls back to directory name

This enables:
- Tracking work across multiple projects
- Branch-specific analytics
- Repository-level statistics

### Example Heartbeat with Full Context

```json
{
  "timestamp": 1704614400000,
  "project": "ziit-agent",
  "language": "TypeScript",
  "editor": "GitHub Copilot Agent",
  "os": "Linux",
  "file": "server/api/stats.get.ts",
  "branch": "feature/advanced-hooks",
  "category": "copilot-agent",
  "eventType": "postToolUse",
  "toolName": "edit",
  "metadata": {
    "sessionId": "session-1704614400-12345",
    "toolArgs": "{\"path\":\"server/api/stats.get.ts\"}",
    "cwd": "/home/user/projects/ziit-agent",
    "resultType": "success"
  }
}
```

## Environment Variables

### Required

- `ZIIT_API_KEY`: Your Ziit API key (required)
- `ZIIT_API_URL`: Ziit instance URL (default: http://localhost:3000)

### Optional

- `ZIIT_SESSION_ID`: Override automatic session ID generation
- `ZIIT_SESSION_PREFIX`: Add prefix to session IDs for environment tracking

## Per-Project Configuration with direnv

[direnv](https://direnv.net/) allows automatic environment variable loading per directory:

1. **Install direnv**: `brew install direnv` (macOS) or `apt install direnv` (Linux)

2. **Configure your shell**: Add to `~/.bashrc` or `~/.zshrc`:
   ```bash
   eval "$(direnv hook bash)"  # or zsh
   ```

3. **Create project `.envrc`**:
   ```bash
   # .envrc in your project directory
   export ZIIT_API_KEY="project-specific-key"
   export ZIIT_API_URL="https://company-ziit.com"
   ```

4. **Allow the directory**: `direnv allow .`

Now when you `cd` into the project, the environment variables are automatically set!

## Security Best Practices

### Protecting API Keys

1. **Never commit API keys** to version control
   ```bash
   # Add to .gitignore
   .envrc
   .env
   ```

2. **Use different keys** for different environments:
   - Work projects → work Ziit instance
   - Personal projects → personal Ziit instance

3. **Rotate keys periodically** through Ziit settings

### Hook Security

The hooks implement several security measures:

- **Timeout**: Default 30 seconds per hook
- **Silent failures**: Don't block agent on API errors
- **Prompt truncation**: Limits prompts to 500 characters
- **Local metadata**: All data stays on your Ziit instance

## Filtering and Analytics

### Query Copilot-Specific Activity

Use the `category` field to filter heartbeats:

```sql
-- Example query (PostgreSQL)
SELECT 
  "eventType",
  "toolName",
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM ("timestamp" - LAG("timestamp") OVER (PARTITION BY "userId" ORDER BY "timestamp")))) as avg_interval_seconds
FROM "Heartbeats"
WHERE "userId" = 'user-id'
  AND "category" = 'copilot-agent'
  AND "timestamp" > NOW() - INTERVAL '7 days'
GROUP BY "eventType", "toolName"
ORDER BY count DESC;
```

### Session-Based Analytics

Track sessions using the `metadata->>'sessionId'` field:

```sql
-- Sessions with their duration and event counts
SELECT 
  metadata->>'sessionId' as session_id,
  MIN("timestamp") as session_start,
  MAX("timestamp") as session_end,
  EXTRACT(EPOCH FROM (MAX("timestamp") - MIN("timestamp"))) / 60 as duration_minutes,
  COUNT(*) as total_events,
  COUNT(CASE WHEN "eventType" = 'preToolUse' THEN 1 END) as tools_used,
  COUNT(CASE WHEN "metadata"->>'resultType' = 'failure' THEN 1 END) as failed_operations
FROM "Heartbeats"
WHERE "category" = 'copilot-agent'
  AND "timestamp" > NOW() - INTERVAL '7 days'
GROUP BY metadata->>'sessionId'
ORDER BY session_start DESC;
```

## Tool Success Rate Tracking

Track which tools are most successful:

```sql
SELECT 
  "toolName",
  COUNT(*) as total_uses,
  COUNT(CASE WHEN metadata->>'resultType' = 'success' THEN 1 END) as successful,
  COUNT(CASE WHEN metadata->>'resultType' = 'failure' THEN 1 END) as failed,
  ROUND(100.0 * COUNT(CASE WHEN metadata->>'resultType' = 'success' THEN 1 END) / COUNT(*), 2) as success_rate
FROM "Heartbeats"
WHERE "eventType" = 'postToolUse'
  AND "category" = 'copilot-agent'
GROUP BY "toolName"
ORDER BY total_uses DESC;
```

## Customizing Hook Behavior

### Example: Log Tool Usage to File

Add to `post-tool-use.sh` before sending heartbeat:

```bash
# Log tool usage for debugging
echo "$(date -Iseconds) | $TOOL_NAME | $RESULT_TYPE | $FILE_PATH" >> ~/.ziit-tool-usage.log
```

### Example: Block Dangerous Commands

Add to `pre-tool-use.sh`:

```bash
# Block potentially dangerous bash commands
if [ "$TOOL_NAME" = "bash" ]; then
    COMMAND=$(echo "$TOOL_ARGS" | jq -r '.command')
    if echo "$COMMAND" | grep -qE "rm -rf /|format |DROP DATABASE"; then
        echo '{"permissionDecision":"deny","permissionDecisionReason":"Dangerous command blocked"}' | jq -c
        exit 0
    fi
fi
```

### Example: Track Only Specific File Types

Modify `send-heartbeat.sh` to filter by language:

```bash
# Only track Python and JavaScript files
if [ "$language" != "Python" ] && [ "$language" != "JavaScript" ] && [ "$language" != "TypeScript" ]; then
    return 0  # Skip heartbeat
fi
```

## Troubleshooting

### Sessions Not Linking

If heartbeats aren't grouped by session:

1. Check `/tmp/.ziit-session-id` file exists during session
2. Verify session-start.sh ran successfully
3. Check other scripts are loading the session ID:
   ```bash
   if [ -f /tmp/.ziit-session-id ]; then
       export ZIIT_SESSION_ID=$(cat /tmp/.ziit-session-id)
   fi
   ```

### Language Not Detected

If languages show as "Unknown":

1. Verify file extensions are standard
2. Add custom extensions to `detect_language()` function in `send-heartbeat.sh`
3. Check that tool events include file paths in their arguments

### Git Context Missing

If repository/branch not detected:

1. Ensure you're in a Git repository: `git rev-parse --git-dir`
2. Check Git is configured: `git config --get remote.origin.url`
3. Verify the hook runs in the repository directory

## Performance Optimization

### Batch Heartbeats (Advanced)

For high-frequency events, consider batching:

```bash
# In send-heartbeat.sh, append to a queue file
echo "$payload" >> /tmp/.ziit-queue.json

# Separate script to flush queue every 30 seconds
while true; do
    sleep 30
    if [ -f /tmp/.ziit-queue.json ]; then
        # Read all queued heartbeats
        BATCH=$(jq -s '.' /tmp/.ziit-queue.json)
        # Send as batch
        curl -X POST \
            -H "Authorization: Bearer $ZIIT_API_KEY" \
            -H "Content-Type: application/json" \
            -d "$BATCH" \
            "$ZIIT_API_URL/api/external/batch" \
            --silent --max-time 10
        # Clear queue
        rm /tmp/.ziit-queue.json
    fi
done
```

## Integration Examples

### Slack Notifications on Errors

Add to `error-occurred.sh`:

```bash
# Send Slack notification for errors
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST "$SLACK_WEBHOOK_URL" \
        -H 'Content-Type: application/json' \
        -d "{\"text\":\"Copilot Error: [$ERROR_NAME] $ERROR_MSG\"}" \
        --silent --max-time 5 >/dev/null 2>&1 || true
fi
```

### Custom Metrics Dashboard

Export metrics to Prometheus/Grafana:

```bash
# In post-tool-use.sh
# Increment Prometheus counter
echo "copilot_tool_use_total{tool=\"$TOOL_NAME\",result=\"$RESULT_TYPE\"} 1" | \
    curl --data-binary @- http://localhost:9091/metrics/job/copilot_hooks || true
```

## Further Reading

- [GitHub Copilot Hooks Documentation](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/use-hooks)
- [Ziit-Agent README](../../README.md)
- [Hooks Configuration Reference](https://docs.github.com/en/copilot/reference/hooks-configuration)
- [direnv Documentation](https://direnv.net/)
