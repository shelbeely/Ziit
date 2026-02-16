# Copilot Agent Analytics API

This directory contains specialized API endpoints for tracking and analyzing GitHub Copilot Coding Agent activity.

## Available Endpoints

All endpoints require authentication and are scoped to the authenticated user's data.

### 1. Overview (`GET /api/copilot/overview`)

Get a comprehensive overview of all Copilot agent activity.

**Query Parameters:**
- `days` (optional): Number of days to look back (default: 7, max: 90)

**Response:**
```json
{
  "overview": {
    "totalSessions": 15,
    "totalEvents": 243,
    "totalTimeMinutes": 127,
    "averageSessionDuration": 8,
    "timeRange": "Last 7 days"
  },
  "tools": {
    "totalUses": 89,
    "uniqueTools": 5,
    "successRate": 94,
    "mostUsed": "edit"
  },
  "activity": {
    "promptsSubmitted": 42,
    "filesModified": 23,
    "errors": 3,
    "mostActiveDay": "Wednesday"
  },
  "languages": [
    { "language": "TypeScript", "percentage": 45 },
    { "language": "JavaScript", "percentage": 30 },
    { "language": "Python", "percentage": 15 }
  ],
  "productivity": {
    "eventsPerSession": 16,
    "toolsPerSession": 5.9,
    "successfulToolsPerSession": 5.6
  },
  "comparison": {
    "copilotTimeMinutes": 127,
    "regularCodingTimeMinutes": 58,
    "copilotPercentage": 69
  }
}
```

### 2. Tool Usage (`GET /api/copilot/tool-usage`)

Detailed statistics about tool usage during Copilot sessions.

**Query Parameters:**
- `days` (optional): Number of days to look back (default: 7, max: 365)
- `sessionId` (optional): Filter by specific session ID

**Response:**
```json
{
  "summary": {
    "totalToolUses": 89,
    "uniqueTools": 5,
    "totalSessions": 15,
    "successRate": 94,
    "timeRange": "Last 7 days"
  },
  "toolBreakdown": [
    {
      "toolName": "edit",
      "totalUses": 45,
      "successful": 43,
      "failed": 2,
      "successRate": 96,
      "avgDurationSeconds": 2.3
    },
    {
      "toolName": "view",
      "totalUses": 28,
      "successful": 28,
      "failed": 0,
      "successRate": 100,
      "avgDurationSeconds": 0.8
    }
  ],
  "languageBreakdown": [
    { "language": "TypeScript", "count": 34 },
    { "language": "JavaScript", "count": 22 }
  ],
  "sessions": [
    {
      "sessionId": "session-1704614400-12345",
      "startTime": "2024-01-07T10:00:00.000Z",
      "endTime": "2024-01-07T10:15:00.000Z",
      "durationMinutes": 15,
      "toolsUsed": 4,
      "eventsCount": 23
    }
  ]
}
```

### 3. Session Details (`GET /api/copilot/session`)

Get detailed information about a specific session.

**Query Parameters:**
- `sessionId` (required): The session ID to retrieve

**Response:**
```json
{
  "sessionId": "session-1704614400-12345",
  "startTime": "2024-01-07T10:00:00.000Z",
  "endTime": "2024-01-07T10:15:00.000Z",
  "durationMinutes": 15,
  "source": "new",
  "reason": "complete",
  "initialPrompt": "Add authentication to the API",
  "events": [
    {
      "timestamp": "2024-01-07T10:00:00.000Z",
      "eventType": "sessionStart",
      "toolName": null,
      "language": null,
      "file": null,
      "result": null
    },
    {
      "timestamp": "2024-01-07T10:01:23.000Z",
      "eventType": "preToolUse",
      "toolName": "edit",
      "language": "TypeScript",
      "file": "server/api/auth.ts",
      "result": null
    }
  ],
  "statistics": {
    "totalEvents": 23,
    "toolsUsed": 4,
    "successfulTools": 18,
    "failedTools": 1,
    "promptsSubmitted": 3,
    "errors": 0
  }
}
```

### 4. Activity Timeline (`GET /api/copilot/activity-timeline`)

Get activity timeline showing patterns over time.

**Query Parameters:**
- `days` (optional): Number of days to look back (default: 7, max: 90)
- `groupBy` (optional): Group by "hour" or "day" (default: "hour")

**Response:**
```json
{
  "timeline": [
    {
      "period": "2024-01-07 10:00",
      "sessions": 2,
      "totalEvents": 34,
      "toolUses": 12,
      "prompts": 5,
      "errors": 0,
      "activeMinutes": 25
    }
  ],
  "peakActivity": {
    "hour": 14,
    "day": "Wednesday",
    "sessions": 4
  },
  "patterns": {
    "mostActiveHours": [
      { "hour": 14, "timeRange": "14:00-15:00", "events": 89 },
      { "hour": 10, "timeRange": "10:00-11:00", "events": 67 },
      { "hour": 16, "timeRange": "16:00-17:00", "events": 54 }
    ],
    "averageSessionDuration": 8,
    "averageEventsPerSession": 16,
    "totalSessions": 15
  }
}
```

### 5. File Activity (`GET /api/copilot/file-activity`)

Get heatmap of files modified during Copilot sessions.

**Query Parameters:**
- `days` (optional): Number of days to look back (default: 7, max: 90)
- `limit` (optional): Maximum number of files to return (default: 50)

**Response:**
```json
{
  "files": [
    {
      "path": "server/api/auth.ts",
      "language": "TypeScript",
      "edits": 12,
      "views": 8,
      "creates": 0,
      "totalActivity": 20,
      "lastModified": "2024-01-07T14:30:00.000Z",
      "sessionsInvolved": 3
    }
  ],
  "summary": {
    "totalFiles": 23,
    "totalEdits": 89,
    "mostEditedFile": "server/api/auth.ts",
    "languageBreakdown": {
      "TypeScript": 56,
      "JavaScript": 34,
      "Python": 12
    }
  }
}
```

### 6. Prompt Analytics (`GET /api/copilot/prompt-analytics`)

Analyze user prompts to identify patterns and topics.

**Query Parameters:**
- `days` (optional): Number of days to look back (default: 7, max: 90)
- `limit` (optional): Maximum number of recent prompts to return (default: 20)

**Response:**
```json
{
  "summary": {
    "totalPrompts": 42,
    "averageLength": 87,
    "averageWordCount": 15,
    "categorized": {
      "Feature Development": 18,
      "Bug Fix": 12,
      "Refactoring": 8,
      "Documentation": 4
    },
    "timeRange": "Last 7 days"
  },
  "recentPrompts": [
    {
      "timestamp": "2024-01-07T14:30:00.000Z",
      "prompt": "Add error handling to the authentication endpoint",
      "sessionId": "session-1704614400-12345",
      "category": "Bug Fix",
      "wordCount": 7
    }
  ],
  "commonPatterns": [
    { "keyword": "authentication", "count": 8 },
    { "keyword": "endpoint", "count": 6 },
    { "keyword": "error", "count": 5 }
  ]
}
```

**Prompt Categories:**
- `Bug Fix`: fix, bug, error, issue, problem, debug
- `Feature Development`: add, create, implement, new, build, make
- `Refactoring`: refactor, improve, optimize, clean, reorganize
- `Testing`: test, spec, unit test, e2e
- `Documentation`: document, comment, readme, explain
- `Modification`: update, upgrade, change, modify
- `Code Review`: review, check, analyze, look
- `General`: Everything else

### 7. Error Tracking (`GET /api/copilot/error-tracking`)

Track errors that occurred during Copilot sessions.

**Query Parameters:**
- `days` (optional): Number of days to look back (default: 7, max: 90)

**Response:**
```json
{
  "summary": {
    "totalErrors": 12,
    "uniqueErrorTypes": 4,
    "sessionsWithErrors": 8,
    "errorRate": 53,
    "timeRange": "Last 7 days"
  },
  "errorsByType": [
    {
      "errorName": "TimeoutError",
      "count": 6,
      "lastOccurrence": "2024-01-07T14:30:00.000Z"
    },
    {
      "errorName": "ValidationError",
      "count": 4,
      "lastOccurrence": "2024-01-06T11:20:00.000Z"
    }
  ],
  "recentErrors": [
    {
      "timestamp": "2024-01-07T14:30:00.000Z",
      "errorName": "TimeoutError",
      "errorMessage": "Network timeout while fetching data",
      "sessionId": "session-1704614400-12345"
    }
  ],
  "errorTrends": [
    { "date": "2024-01-01", "errorCount": 2 },
    { "date": "2024-01-02", "errorCount": 1 },
    { "date": "2024-01-03", "errorCount": 3 }
  ]
}
```

## Usage Examples

### Fetch Overview

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/copilot/overview?days=7"
```

### Get Session Details

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/copilot/session?sessionId=session-1704614400-12345"
```

### Track Tool Usage for Specific Session

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/copilot/tool-usage?sessionId=session-1704614400-12345"
```

### Get Daily Activity Timeline

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/copilot/activity-timeline?days=30&groupBy=day"
```

## Integration Tips

### Building a Dashboard

1. **Start with Overview**: Use `/api/copilot/overview` to display high-level metrics
2. **Add Timeline**: Use `/api/copilot/activity-timeline` for activity charts
3. **Show Recent Activity**: Use `/api/copilot/tool-usage` with `sessions` data
4. **File Heatmap**: Use `/api/copilot/file-activity` for visual file activity
5. **Error Monitoring**: Use `/api/copilot/error-tracking` for error alerts

### Real-time Monitoring

Poll the overview endpoint every 30 seconds for near real-time updates:

```javascript
setInterval(async () => {
  const response = await fetch('/api/copilot/overview?days=1');
  const data = await response.json();
  updateDashboard(data);
}, 30000);
```

### Performance Optimization

- Use appropriate `days` parameter to limit data scope
- Cache responses on the client side
- Use `limit` parameter for large datasets
- Consider pagination for file and session lists

## Response Codes

- `200 OK`: Request successful
- `400 Bad Request`: Invalid parameters (e.g., days out of range)
- `401 Unauthorized`: Missing or invalid authentication
- `404 Not Found`: Session not found (session endpoint only)
- `500 Internal Server Error`: Server error

## Rate Limiting

These endpoints share the same rate limits as other Ziit API endpoints. Consider implementing client-side caching for frequently accessed data.
