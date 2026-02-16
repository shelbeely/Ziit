# Ziit-Agent: Complete Feature Set for GitHub Copilot Coding Agent

## 🎯 Overview

Ziit-Agent now provides comprehensive tracking and analytics for GitHub Copilot Coding Agent sessions, enabling developers to understand how they work with AI coding assistants.

## ✨ Core Features Implemented

### 1. Enhanced Hook System

**Smart Context Detection:**
- 🔍 **Language Detection**: Automatically detects 30+ programming languages from file extensions
- 📁 **Git Integration**: Extracts repository name and branch information
- 🆔 **Session Tracking**: Generates unique session IDs to group related activities
- 📂 **File Path Extraction**: Captures actual file paths from tool arguments

**Hook Scripts (Bash + PowerShell):**
- `session-start.sh/.ps1` - Generates session ID, tracks initialization
- `session-end.sh/.ps1` - Records session completion with cleanup
- `user-prompt.sh/.ps1` - Captures user prompts (truncated for privacy)
- `pre-tool-use.sh/.ps1` - Tracks tool requests with file context
- `post-tool-use.sh/.ps1` - Records tool results and duration
- `error-occurred.sh/.ps1` - Logs errors with full context
- `send-heartbeat.sh/.ps1` - Helper with language detection and Git integration

### 2. Extended Heartbeat Schema

**New Fields in Heartbeats Table:**
```typescript
{
  category: string     // "copilot-agent" vs "coding"
  eventType: string    // sessionStart, preToolUse, etc.
  toolName: string     // bash, edit, view, create, etc.
  metadata: json       // Rich contextual data
}
```

**Metadata Structure:**
- `sessionId`: Groups heartbeats by session
- `source`: Session source (new, resume, startup)
- `initialPrompt`: What the user asked for
- `toolArgs`: Tool-specific arguments
- `resultType`: success, failure, denied
- `errorMessage` / `errorName`: Error details
- `prompt`: User prompt text
- `cwd`: Working directory

### 3. Analytics API Endpoints

#### Overview Endpoint
**`GET /api/copilot/overview?days=7`**

Returns comprehensive metrics:
- Total sessions, events, time
- Tool usage statistics
- Activity summary
- Language breakdown
- Productivity metrics
- Copilot vs regular coding comparison

#### Tool Usage Endpoint
**`GET /api/copilot/tool-usage?days=7&sessionId=xyz`**

Detailed tool analytics:
- Tool breakdown with success rates
- Average execution duration
- Language distribution
- Recent session summaries

#### Session Details Endpoint
**`GET /api/copilot/session?sessionId=xyz`**

Complete session timeline:
- Start/end times and duration
- Initial prompt and completion reason
- All events with timestamps
- Statistics (tools used, success rate, errors)

#### Activity Timeline Endpoint
**`GET /api/copilot/activity-timeline?days=7&groupBy=hour`**

Temporal activity patterns:
- Hourly or daily aggregation
- Sessions, events, tools, prompts per period
- Peak activity identification
- Active minutes calculation
- Usage patterns analysis

#### File Activity Endpoint
**`GET /api/copilot/file-activity?days=7&limit=50`**

File modification heatmap:
- Files sorted by activity (edits + views + creates)
- Language detection per file
- Last modified timestamp
- Sessions involved per file
- Summary statistics

#### Prompt Analytics Endpoint
**`GET /api/copilot/prompt-analytics?days=7&limit=20`**

Prompt intelligence:
- Total prompts and average length
- Auto-categorization (Bug Fix, Feature Dev, etc.)
- Recent prompts list
- Common keyword patterns
- Word frequency analysis

**Prompt Categories:**
- Bug Fix: fix, bug, error, issue, problem, debug
- Feature Development: add, create, implement, new, build
- Refactoring: refactor, improve, optimize, clean
- Testing: test, spec, unit test, e2e
- Documentation: document, comment, readme, explain
- Modification: update, upgrade, change, modify
- Code Review: review, check, analyze, look
- General: Everything else

#### Error Tracking Endpoint
**`GET /api/copilot/error-tracking?days=7`**

Error monitoring:
- Total errors and unique types
- Sessions with errors
- Error rate calculation
- Error trends over time
- Recent error details
- Error categorization

## 📊 Key Capabilities

### Session Intelligence
- **Unique ID Generation**: Each session gets a unique identifier
- **Cross-Event Tracking**: All events in a session linked by ID
- **Duration Calculation**: Precise session timing
- **Activity Patterns**: When developers use Copilot most

### Tool Analytics
- **Success Rate Tracking**: Which tools work best
- **Duration Monitoring**: How long tools take to execute
- **Usage Patterns**: Most frequently used tools
- **Failure Analysis**: Why tools fail

### Language Insights
- **Auto-Detection**: From file extensions during tool use
- **Distribution Analysis**: Which languages get most AI assistance
- **Per-Tool Breakdown**: Language usage by tool type

### Productivity Metrics
- **Events per Session**: How active sessions are
- **Tools per Session**: Tool usage density
- **Success Rate**: Overall effectiveness
- **Copilot vs Regular Coding**: Time comparison

### File Tracking
- **Modification Heatmap**: Most edited files
- **Session Correlation**: Files worked on together
- **Language Context**: File language tracking
- **Activity Timeline**: When files were modified

### Error Intelligence
- **Type Classification**: Common error patterns
- **Trend Analysis**: Error rates over time
- **Session Impact**: Which sessions had errors
- **Root Cause**: Error messages and contexts

## 🔧 Configuration

### Environment Variables

```bash
# Required
export ZIIT_API_KEY="your-api-key-here"

# Optional
export ZIIT_API_URL="https://ziit.app"  # default
export ZIIT_SESSION_ID="custom-session-id"  # override auto-generation
```

### Per-Project Setup with direnv

```bash
# .envrc in project root
export ZIIT_API_KEY="project-specific-key"
export ZIIT_API_URL="https://company-ziit.com"
```

## 📁 File Structure

```
.github/hooks/
├── README.md                    # Setup and usage guide
├── ADVANCED.md                  # Advanced patterns and examples
├── config.example               # Configuration template
├── heartbeat-hooks.json         # Hooks configuration
└── scripts/
    ├── send-heartbeat.sh        # Core helper (language detection, Git)
    ├── send-heartbeat.ps1       # PowerShell version
    ├── session-start.sh         # Session initialization
    ├── session-end.sh           # Session completion
    ├── user-prompt.sh           # Prompt capture
    ├── pre-tool-use.sh          # Tool request tracking
    ├── post-tool-use.sh         # Tool result tracking
    ├── error-occurred.sh        # Error logging
    └── *.ps1                    # PowerShell equivalents

server/api/copilot/
├── README.md                    # API documentation
├── overview.get.ts              # Comprehensive dashboard
├── tool-usage.get.ts            # Tool statistics
├── session.get.ts               # Session details
├── activity-timeline.get.ts     # Temporal patterns
├── file-activity.get.ts         # File heatmap
├── prompt-analytics.get.ts      # Prompt intelligence
└── error-tracking.get.ts        # Error monitoring
```

## 🚀 Usage Examples

### Basic Setup
```bash
# Set your API key
export ZIIT_API_KEY="your-key"

# Hooks automatically activate with Copilot agent
# No additional configuration needed!
```

### Query APIs
```bash
# Get overview
curl -H "Authorization: Bearer TOKEN" \
  "https://ziit.app/api/copilot/overview?days=7"

# Get session details
curl -H "Authorization: Bearer TOKEN" \
  "https://ziit.app/api/copilot/session?sessionId=session-123"

# Track tool usage
curl -H "Authorization: Bearer TOKEN" \
  "https://ziit.app/api/copilot/tool-usage?days=30"
```

### Build a Dashboard
```javascript
// Fetch comprehensive data
const overview = await fetch('/api/copilot/overview?days=7');
const timeline = await fetch('/api/copilot/activity-timeline?days=7');
const files = await fetch('/api/copilot/file-activity?days=7');
const errors = await fetch('/api/copilot/error-tracking?days=7');

// Display metrics, charts, heatmaps, and alerts
```

## 📈 Database Schema

**Heartbeats Table (Extended):**
```sql
CREATE TABLE "Heartbeats" (
  id          TEXT,
  timestamp   TIMESTAMPTZ,
  userId      TEXT,
  project     TEXT,
  editor      TEXT,
  language    TEXT,
  os          TEXT,
  file        TEXT,
  branch      TEXT,
  category    TEXT DEFAULT 'coding',     -- NEW
  eventType   TEXT,                      -- NEW
  toolName    TEXT,                      -- NEW
  metadata    JSONB,                     -- NEW
  createdAt   TIMESTAMPTZ,
  summariesId TEXT,
  
  -- Indexes for performance
  INDEX idx_category (category),
  INDEX idx_eventType (eventType),
  INDEX idx_toolName (toolName),
  -- ... existing indexes
);
```

## 🎓 Benefits

### For Developers
- **Understand AI Usage**: See how Copilot helps your workflow
- **Optimize Productivity**: Identify most useful tools and patterns
- **Track Progress**: Monitor AI-assisted coding over time
- **Debug Issues**: Quickly identify and fix errors

### For Teams
- **Adoption Metrics**: Track Copilot usage across team
- **Best Practices**: Learn from successful patterns
- **ROI Analysis**: Compare Copilot vs regular coding time
- **Training Needs**: Identify where help is needed

### For Organizations
- **Usage Analytics**: Comprehensive adoption tracking
- **Cost Justification**: Prove value of AI tools
- **Security Monitoring**: Track what's being done
- **Compliance**: Full audit trail of AI interactions

## 🔒 Privacy & Security

- **No External Services**: All data stays on your Ziit instance
- **Prompt Truncation**: Prompts limited to 500 characters
- **Silent Failures**: Errors don't block Copilot usage
- **API Key Security**: Read from environment, never logged
- **Session Isolation**: Each session tracked independently

## 📚 Documentation

- **Setup Guide**: `.github/hooks/README.md`
- **Advanced Patterns**: `.github/hooks/ADVANCED.md`
- **API Reference**: `server/api/copilot/README.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`

## 🎉 Summary Statistics

- **7 New API Endpoints**: Comprehensive analytics
- **14 Hook Scripts**: Cross-platform (Bash + PowerShell)
- **4 New Database Fields**: Extended schema
- **30+ Languages Detected**: Auto-detection
- **8 Prompt Categories**: Intelligent classification
- **100% Backward Compatible**: Existing features unaffected

## 🔄 What's Next?

The foundation is complete! Potential future enhancements:
- Dashboard UI components
- Real-time WebSocket updates
- AI-powered insights
- Team collaboration features
- Advanced filtering and search
- Export and reporting tools

---

**Ziit-Agent is now production-ready with full GitHub Copilot Coding Agent integration! 🚀**
