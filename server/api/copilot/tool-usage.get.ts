import { H3Event } from "h3";
import { prisma } from "~~/prisma/db";
import { handleApiError } from "~~/server/utils/logging";

defineRouteMeta({
  openAPI: {
    tags: ["Stats", "Copilot"],
    summary: "Get tool usage statistics",
    description: "Returns aggregated tool usage statistics for GitHub Copilot Coding Agent sessions.",
    parameters: [
      { 
        in: "query", 
        name: "days", 
        required: false, 
        schema: { type: "integer", default: 7 },
        description: "Number of days to look back (default: 7)" 
      },
      { 
        in: "query", 
        name: "sessionId", 
        required: false, 
        schema: { type: "string" },
        description: "Filter by specific session ID" 
      },
    ],
    responses: {
      200: { 
        description: "Tool usage statistics",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                summary: {
                  type: "object",
                  properties: {
                    totalToolUses: { type: "number" },
                    uniqueTools: { type: "number" },
                    totalSessions: { type: "number" },
                    successRate: { type: "number" },
                    timeRange: { type: "string" },
                  }
                },
                toolBreakdown: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      toolName: { type: "string" },
                      totalUses: { type: "number" },
                      successful: { type: "number" },
                      failed: { type: "number" },
                      successRate: { type: "number" },
                      avgDurationSeconds: { type: "number" },
                    }
                  }
                },
                languageBreakdown: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      language: { type: "string" },
                      count: { type: "number" },
                    }
                  }
                },
                sessions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      sessionId: { type: "string" },
                      startTime: { type: "string" },
                      endTime: { type: "string" },
                      durationMinutes: { type: "number" },
                      toolsUsed: { type: "number" },
                      eventsCount: { type: "number" },
                    }
                  }
                },
              }
            }
          }
        }
      },
      400: { description: "Invalid parameters" },
      401: { description: "Unauthorized" },
      500: { description: "Failed to retrieve statistics" },
    },
    operationId: "getToolUsageStats",
  },
});

export default defineEventHandler(async (event: H3Event) => {
  const userId = event.context.user.id;

  try {
    const query = getQuery(event);
    const days = query.days ? parseInt(query.days as string, 10) : 7;
    const sessionId = query.sessionId as string | undefined;

    if (days < 1 || days > 365) {
      throw handleApiError(
        400,
        `Invalid days value: ${days}. Must be between 1 and 365.`,
        "Invalid time range specified."
      );
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Base query conditions
    const whereConditions: any = {
      userId,
      category: "copilot-agent",
      timestamp: {
        gte: startDate,
      },
    };

    // Add session filter if provided
    if (sessionId) {
      whereConditions.metadata = {
        path: ['sessionId'],
        equals: sessionId,
      };
    }

    // Get all copilot agent heartbeats
    const heartbeats = await prisma.heartbeats.findMany({
      where: whereConditions,
      orderBy: {
        timestamp: 'asc',
      },
      select: {
        id: true,
        timestamp: true,
        eventType: true,
        toolName: true,
        language: true,
        file: true,
        metadata: true,
      },
    });

    // Calculate summary statistics
    const toolUses = heartbeats.filter(h => h.eventType === 'postToolUse');
    const uniqueTools = new Set(toolUses.map(h => h.toolName).filter(Boolean)).size;
    
    const successfulTools = toolUses.filter(h => 
      (h.metadata as any)?.resultType === 'success'
    ).length;
    
    const successRate = toolUses.length > 0 
      ? Math.round((successfulTools / toolUses.length) * 100) 
      : 0;

    // Get unique sessions
    const sessionIds = new Set<string>();
    heartbeats.forEach(h => {
      const sid = (h.metadata as any)?.sessionId;
      if (sid) sessionIds.add(sid);
    });

    // Tool breakdown
    const toolStats = new Map<string, {
      total: number;
      successful: number;
      failed: number;
      durations: number[];
    }>();

    const preToolMap = new Map<string, Date>();

    heartbeats.forEach(h => {
      if (h.eventType === 'preToolUse' && h.toolName) {
        preToolMap.set(`${h.toolName}-${(h.metadata as any)?.sessionId || ''}`, h.timestamp);
      }
      
      if (h.eventType === 'postToolUse' && h.toolName) {
        if (!toolStats.has(h.toolName)) {
          toolStats.set(h.toolName, { total: 0, successful: 0, failed: 0, durations: [] });
        }
        
        const stats = toolStats.get(h.toolName)!;
        stats.total++;
        
        const resultType = (h.metadata as any)?.resultType;
        if (resultType === 'success') {
          stats.successful++;
        } else if (resultType === 'failure') {
          stats.failed++;
        }

        // Calculate duration if we have a matching preToolUse
        const preKey = `${h.toolName}-${(h.metadata as any)?.sessionId || ''}`;
        const preTime = preToolMap.get(preKey);
        if (preTime) {
          const duration = (h.timestamp.getTime() - preTime.getTime()) / 1000;
          stats.durations.push(duration);
        }
      }
    });

    const toolBreakdown = Array.from(toolStats.entries())
      .map(([toolName, stats]) => ({
        toolName,
        totalUses: stats.total,
        successful: stats.successful,
        failed: stats.failed,
        successRate: stats.total > 0 
          ? Math.round((stats.successful / stats.total) * 100) 
          : 0,
        avgDurationSeconds: stats.durations.length > 0
          ? Math.round((stats.durations.reduce((a, b) => a + b, 0) / stats.durations.length) * 100) / 100
          : null,
      }))
      .sort((a, b) => b.totalUses - a.totalUses);

    // Language breakdown
    const langStats = new Map<string, number>();
    toolUses.forEach(h => {
      if (h.language && h.language !== 'Unknown') {
        langStats.set(h.language, (langStats.get(h.language) || 0) + 1);
      }
    });

    const languageBreakdown = Array.from(langStats.entries())
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count);

    // Session breakdown
    const sessionStats = new Map<string, {
      events: typeof heartbeats;
      toolsUsed: Set<string>;
    }>();

    heartbeats.forEach(h => {
      const sid = (h.metadata as any)?.sessionId || 'unknown';
      if (!sessionStats.has(sid)) {
        sessionStats.set(sid, { events: [], toolsUsed: new Set() });
      }
      const stats = sessionStats.get(sid)!;
      stats.events.push(h);
      if (h.toolName) {
        stats.toolsUsed.add(h.toolName);
      }
    });

    const sessions = Array.from(sessionStats.entries())
      .map(([sessionId, stats]) => {
        const times = stats.events.map(e => e.timestamp.getTime());
        const startTime = new Date(Math.min(...times));
        const endTime = new Date(Math.max(...times));
        const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

        return {
          sessionId: sessionId === 'unknown' ? null : sessionId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          durationMinutes,
          toolsUsed: stats.toolsUsed.size,
          eventsCount: stats.events.length,
        };
      })
      .filter(s => s.sessionId !== null)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    return {
      summary: {
        totalToolUses: toolUses.length,
        uniqueTools,
        totalSessions: sessionIds.size,
        successRate,
        timeRange: `Last ${days} days`,
      },
      toolBreakdown,
      languageBreakdown,
      sessions: sessions.slice(0, 20), // Limit to 20 most recent sessions
    };
  } catch (error: any) {
    if (error && typeof error === "object" && error.statusCode) throw error;
    const detailedMessage = error instanceof Error 
      ? error.message 
      : "Unknown error in tool usage stats endpoint";
    throw handleApiError(
      69,
      `Tool usage stats endpoint failed for user ${userId}. Original error: ${detailedMessage}`,
      "Failed to retrieve tool usage statistics."
    );
  }
});
