import { H3Event } from "h3";
import { prisma } from "~~/prisma/db";
import { handleApiError } from "~~/server/utils/logging";

defineRouteMeta({
  openAPI: {
    tags: ["Stats", "Copilot"],
    summary: "Get comprehensive Copilot overview",
    description: "Returns a comprehensive overview of all Copilot agent activity and metrics.",
    parameters: [
      { 
        in: "query", 
        name: "days", 
        required: false, 
        schema: { type: "integer", default: 7 },
        description: "Number of days to look back (default: 7)" 
      },
    ],
    responses: {
      200: { 
        description: "Comprehensive overview",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                overview: {
                  type: "object",
                  properties: {
                    totalSessions: { type: "number" },
                    totalEvents: { type: "number" },
                    totalTimeMinutes: { type: "number" },
                    averageSessionDuration: { type: "number" },
                  }
                },
                tools: {
                  type: "object",
                  properties: {
                    totalUses: { type: "number" },
                    uniqueTools: { type: "number" },
                    successRate: { type: "number" },
                    mostUsed: { type: "string" },
                  }
                },
                activity: {
                  type: "object",
                  properties: {
                    promptsSubmitted: { type: "number" },
                    filesModified: { type: "number" },
                    errors: { type: "number" },
                    mostActiveDay: { type: "string" },
                  }
                },
                languages: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      language: { type: "string" },
                      percentage: { type: "number" },
                    }
                  }
                },
                productivity: {
                  type: "object",
                  properties: {
                    eventsPerSession: { type: "number" },
                    toolsPerSession: { type: "number" },
                    successfulToolsPerSession: { type: "number" },
                  }
                },
                comparison: {
                  type: "object",
                  properties: {
                    copilotTime: { type: "number" },
                    regularCodingTime: { type: "number" },
                    copilotPercentage: { type: "number" },
                  }
                },
              }
            }
          }
        }
      },
      400: { description: "Invalid parameters" },
      401: { description: "Unauthorized" },
      500: { description: "Failed to retrieve overview" },
    },
    operationId: "getCopilotOverview",
  },
});

export default defineEventHandler(async (event: H3Event) => {
  const userId = event.context.user.id;

  try {
    const query = getQuery(event);
    const days = query.days ? parseInt(query.days as string, 10) : 7;

    if (days < 1 || days > 90) {
      throw handleApiError(
        400,
        `Invalid days value: ${days}. Must be between 1 and 90.`,
        "Invalid time range specified."
      );
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all copilot heartbeats
    const copilotHeartbeats = await prisma.heartbeats.findMany({
      where: {
        userId,
        category: "copilot-agent",
        timestamp: {
          gte: startDate,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
      select: {
        timestamp: true,
        eventType: true,
        toolName: true,
        language: true,
        file: true,
        metadata: true,
      },
    });

    // Get regular coding heartbeats for comparison
    const regularHeartbeats = await prisma.heartbeats.findMany({
      where: {
        userId,
        category: {
          not: "copilot-agent",
        },
        timestamp: {
          gte: startDate,
        },
      },
      select: {
        timestamp: true,
      },
    });

    // Calculate session statistics
    const sessionMap = new Map<string, {
      events: typeof copilotHeartbeats;
      tools: Set<string>;
      successfulTools: number;
    }>();

    copilotHeartbeats.forEach(h => {
      const sid = (h.metadata as any)?.sessionId || 'unknown';
      if (!sessionMap.has(sid)) {
        sessionMap.set(sid, {
          events: [],
          tools: new Set(),
          successfulTools: 0,
        });
      }
      const session = sessionMap.get(sid)!;
      session.events.push(h);
      
      if (h.toolName) {
        session.tools.add(h.toolName);
      }
      
      if (h.eventType === 'postToolUse' && (h.metadata as any)?.resultType === 'success') {
        session.successfulTools++;
      }
    });

    // Calculate total time
    const sessionDurations = Array.from(sessionMap.values())
      .filter(s => s.events.length > 1)
      .map(s => {
        const times = s.events.map(e => e.timestamp.getTime());
        return (Math.max(...times) - Math.min(...times)) / 1000 / 60;
      });

    const totalTimeMinutes = Math.round(
      sessionDurations.reduce((sum, d) => sum + d, 0)
    );

    const averageSessionDuration = sessionDurations.length > 0
      ? Math.round(sessionDurations.reduce((sum, d) => sum + d, 0) / sessionDurations.length)
      : 0;

    // Tool statistics
    const toolUses = copilotHeartbeats.filter(h => h.eventType === 'postToolUse');
    const uniqueTools = new Set(toolUses.map(h => h.toolName).filter(Boolean));
    const successfulTools = toolUses.filter(h => 
      (h.metadata as any)?.resultType === 'success'
    );
    
    const toolFrequency = new Map<string, number>();
    toolUses.forEach(h => {
      if (h.toolName) {
        toolFrequency.set(h.toolName, (toolFrequency.get(h.toolName) || 0) + 1);
      }
    });
    
    const mostUsedTool = toolFrequency.size > 0
      ? Array.from(toolFrequency.entries()).sort((a, b) => b[1] - a[1])[0][0]
      : null;

    // Activity statistics
    const promptsSubmitted = copilotHeartbeats.filter(h => h.eventType === 'userPromptSubmitted').length;
    const filesModified = new Set(
      copilotHeartbeats
        .filter(h => h.file && h.file !== 'copilot-agent')
        .map(h => h.file)
    ).size;
    const errors = copilotHeartbeats.filter(h => h.eventType === 'errorOccurred').length;

    // Most active day
    const dayActivity = new Map<string, number>();
    copilotHeartbeats.forEach(h => {
      const day = h.timestamp.toLocaleDateString('en-US', { weekday: 'long' });
      dayActivity.set(day, (dayActivity.get(day) || 0) + 1);
    });
    const mostActiveDay = dayActivity.size > 0
      ? Array.from(dayActivity.entries()).sort((a, b) => b[1] - a[1])[0][0]
      : null;

    // Language breakdown
    const langStats = new Map<string, number>();
    copilotHeartbeats.forEach(h => {
      if (h.language && h.language !== 'Unknown') {
        langStats.set(h.language, (langStats.get(h.language) || 0) + 1);
      }
    });

    const totalLangEvents = Array.from(langStats.values()).reduce((sum, count) => sum + count, 0);
    const languages = Array.from(langStats.entries())
      .map(([language, count]) => ({
        language,
        percentage: totalLangEvents > 0 
          ? Math.round((count / totalLangEvents) * 100)
          : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);

    // Productivity metrics
    const validSessions = Array.from(sessionMap.values()).filter(s => s.events.length > 1);
    const eventsPerSession = validSessions.length > 0
      ? Math.round(validSessions.reduce((sum, s) => sum + s.events.length, 0) / validSessions.length)
      : 0;
    
    const toolsPerSession = validSessions.length > 0
      ? Math.round(validSessions.reduce((sum, s) => sum + s.tools.size, 0) / validSessions.length * 10) / 10
      : 0;
    
    const successfulToolsPerSession = validSessions.length > 0
      ? Math.round(validSessions.reduce((sum, s) => sum + s.successfulTools, 0) / validSessions.length * 10) / 10
      : 0;

    // Comparison with regular coding
    const regularTimeEstimate = Math.round(regularHeartbeats.length * 0.5); // Rough estimate
    const copilotPercentage = (totalTimeMinutes + regularTimeEstimate) > 0
      ? Math.round((totalTimeMinutes / (totalTimeMinutes + regularTimeEstimate)) * 100)
      : 0;

    return {
      overview: {
        totalSessions: sessionMap.size,
        totalEvents: copilotHeartbeats.length,
        totalTimeMinutes,
        averageSessionDuration,
        timeRange: `Last ${days} days`,
      },
      tools: {
        totalUses: toolUses.length,
        uniqueTools: uniqueTools.size,
        successRate: toolUses.length > 0
          ? Math.round((successfulTools.length / toolUses.length) * 100)
          : 0,
        mostUsed: mostUsedTool,
      },
      activity: {
        promptsSubmitted,
        filesModified,
        errors,
        mostActiveDay,
      },
      languages,
      productivity: {
        eventsPerSession,
        toolsPerSession,
        successfulToolsPerSession,
      },
      comparison: {
        copilotTimeMinutes: totalTimeMinutes,
        regularCodingTimeMinutes: regularTimeEstimate,
        copilotPercentage,
      },
    };
  } catch (error: any) {
    if (error && typeof error === "object" && error.statusCode) throw error;
    const detailedMessage = error instanceof Error 
      ? error.message 
      : "Unknown error in overview endpoint";
    throw handleApiError(
      69,
      `Overview endpoint failed for user ${userId}. Original error: ${detailedMessage}`,
      "Failed to retrieve overview."
    );
  }
});
