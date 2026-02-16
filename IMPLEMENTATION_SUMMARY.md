# Ziit-Agent: GitHub Copilot Coding Agent Integration

## Summary

This implementation transforms Ziit into Ziit-Agent, adding comprehensive GitHub Copilot Coding Agent integration while maintaining full backward compatibility with the original Ziit features.

## What Was Implemented

### 1. Extended Heartbeat Schema

**Database Changes:**
- Added `category` field (default: "coding") to distinguish between regular IDE and agent heartbeats
- Added `eventType` field to capture hook event types (sessionStart, sessionEnd, etc.)
- Added `toolName` field to track which tools the agent uses (bash, edit, view, etc.)
- Added `metadata` JSON field for rich contextual data
- Created indexes for all new fields for optimal query performance

**Migration:**
- Created migration file: `prisma/migrations/20260216060626_add_copilot_fields_to_heartbeats/migration.sql`
- All new fields are optional for backward compatibility

### 2. API Endpoint Updates

**Modified Files:**
- `server/api/external/heartbeat.post.ts` - Single heartbeat endpoint
- `server/api/external/heartbeats.post.ts` - Deprecated heartbeat endpoint
- `server/api/external/batch.post.ts` - Batch heartbeat endpoint

**Changes:**
- Updated Zod schemas to accept new optional fields
- Modified database insert operations to include new fields
- Updated OpenAPI documentation to reflect new schema

### 3. GitHub Copilot Hooks System

**Configuration:**
- `.github/hooks/heartbeat-hooks.json` - Main hooks configuration file
- Implements all 6 hook types supported by GitHub Copilot Coding Agent

**Hook Scripts (Bash & PowerShell):**
- `session-start.sh/.ps1` - Tracks session initialization
- `session-end.sh/.ps1` - Tracks session completion
- `user-prompt.sh/.ps1` - Captures user prompts (truncated to 500 chars)
- `pre-tool-use.sh/.ps1` - Monitors tool execution requests
- `post-tool-use.sh/.ps1` - Tracks tool execution results
- `error-occurred.sh/.ps1` - Captures error events

**Helper Scripts:**
- `send-heartbeat.sh/.ps1` - Reusable function to send heartbeats to Ziit API
- Reads `ZIIT_API_URL` and `ZIIT_API_KEY` from environment
- Silently handles errors to avoid blocking agent execution

### 4. Documentation

**Created Files:**
- `.github/hooks/README.md` - Comprehensive hooks documentation including:
  - Setup instructions
  - Hook event descriptions with JSON examples
  - Troubleshooting guide
  - Privacy and security considerations
  - Advanced usage patterns

**Updated Files:**
- `README.md` - Rebranded as Ziit-Agent with:
  - Clear fork identification
  - Focus on AI agent tracking
  - Quick start for Copilot integration
  - Upstream credits and contributing guidelines
- `package.json` - Updated name and description

### 5. Branding

**New Identity: Ziit-Agent**
- Clear distinction from upstream Ziit
- Emphasizes focus on GitHub Copilot Coding Agent tracking
- Maintains respect for original project with proper credits
- Links to upstream for core contributions

## Technical Details

### Heartbeat Data Flow

1. **GitHub Copilot Coding Agent** triggers a hook event
2. **Hook script** receives JSON input via stdin
3. **Helper function** constructs heartbeat payload with:
   - Timestamp from event
   - Project name from working directory
   - Editor: "GitHub Copilot Agent"
   - OS from system info
   - Category: "copilot-agent"
   - Event type, tool name, and metadata from hook input
4. **API call** sends heartbeat to Ziit instance (silently fails if unavailable)
5. **Ziit API** validates and stores in database

### Backward Compatibility

✅ Existing IDE extensions continue to work without changes
✅ All new fields are optional with sensible defaults
✅ Regular coding heartbeats unaffected (category defaults to "coding")
✅ API responses remain consistent

### Security Considerations

✅ No security vulnerabilities detected (CodeQL scan passed)
✅ API keys read from environment, never hardcoded
✅ Prompts truncated to 500 characters in metadata
✅ All data stays on user's Ziit instance
✅ Failed API calls silently ignored (no blocking)
✅ Hook scripts timeout after 30 seconds by default

## Usage Example

### Setup
```bash
# Set environment variables
export ZIIT_API_URL="https://ziit.app"
export ZIIT_API_KEY="your-api-key-here"

# Hooks activate automatically when using GitHub Copilot Coding Agent
```

### Sample Heartbeat
```json
{
  "timestamp": 1704614400000,
  "project": "my-awesome-project",
  "language": "Unknown",
  "editor": "GitHub Copilot Agent",
  "os": "Linux",
  "file": "copilot-agent",
  "category": "copilot-agent",
  "eventType": "sessionStart",
  "toolName": "",
  "metadata": {
    "source": "new",
    "cwd": "/home/user/projects/my-awesome-project",
    "initialPrompt": "Create a new authentication system"
  }
}
```

## Testing

✅ All hook scripts tested with sample JSON input
✅ JSON configuration validated with `jq`
✅ Bash scripts made executable
✅ Code review completed - no issues
✅ Security scan completed - no vulnerabilities
✅ Backward compatibility verified

## Future Enhancements

Potential improvements for consideration:

1. **Dashboard Visualization**
   - Separate view for Copilot agent activity
   - Tool usage statistics
   - Prompt analysis and patterns
   - Error tracking dashboard

2. **Analytics**
   - Agent vs. manual coding time comparison
   - Most used tools breakdown
   - Session duration analysis
   - Error frequency tracking

3. **Advanced Filtering**
   - Filter by event type
   - Tool-specific views
   - Category-based filtering

4. **Webhook Support**
   - Real-time notifications for specific events
   - Integration with other tools
   - Custom actions on hook events

## Migration Guide

For existing Ziit instances:

1. **Pull latest changes**
2. **Run database migration:**
   ```bash
   bunx prisma migrate deploy
   ```
3. **Regenerate Prisma client:**
   ```bash
   bunx prisma generate
   ```
4. **Restart application**
5. **Setup Copilot hooks** (optional, for Copilot tracking)

## Support

- **Issues**: https://github.com/shelbeely/Ziit/issues
- **Upstream Ziit**: https://github.com/0PandaDEV/Ziit
- **Documentation**: `.github/hooks/README.md`

## Credits

- Original Ziit project: [0PandaDEV/Ziit](https://github.com/0PandaDEV/Ziit)
- GitHub Copilot Hooks: [GitHub Documentation](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/use-hooks)
- Ziit-Agent enhancements: This fork
