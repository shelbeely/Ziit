import { H3Event } from "h3";
import { prisma } from "~~/prisma/db";
import { handleApiError } from "~~/server/utils/logging";

defineRouteMeta({
  openAPI: {
    tags: ["Stats", "Copilot"],
    summary: "Get error tracking and patterns",
    description: "Tracks errors that occurred during Copilot agent sessions and identifies patterns.",
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
        description: "Error tracking data",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                summary: {
                  type: "object",
                  properties: {
                    totalErrors: { type: "number" },
                    uniqueErrorTypes: { type: "number" },
                    sessionsWithErrors: { type: "number" },
                    errorRate: { type: "number" },
                  }
                },
                errorsByType: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      errorName: { type: "string" },
                      count: { type: "number" },
                      lastOccurrence: { type: "string" },
                    }
                  }
                },
                recentErrors: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      timestamp: { type: "string" },
                      errorName: { type: "string" },
                      errorMessage: { type: "string" },
                      sessionId: { type: "string" },
                    }
                  }
                },
                errorTrends: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      date: { type: "string" },
                      errorCount: { type: "number" },
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
      500: { description: "Failed to retrieve error tracking" },
    },
    operationId: "getCopilotErrorTracking",
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

    // Get error events
    const errorHeartbeats = await prisma.heartbeats.findMany({
      where: {
        userId,
        category: "copilot-agent",
        eventType: 'errorOccurred',
        timestamp: {
          gte: startDate,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      select: {
        timestamp: true,
        metadata: true,
      },
    });

    // Get total sessions for error rate calculation
    const allSessions = await prisma.heartbeats.findMany({
      where: {
        userId,
        category: "copilot-agent",
        eventType: 'sessionStart',
        timestamp: {
          gte: startDate,
        },
      },
      select: {
        metadata: true,
      },
    });

    // Extract error information
    const errors = errorHeartbeats.map(h => {
      const meta = h.metadata as any;
      return {
        timestamp: h.timestamp.toISOString(),
        errorName: meta?.errorName || 'Unknown',
        errorMessage: meta?.errorMessage || '',
        sessionId: meta?.sessionId || null,
      };
    });

    // Count unique error types
    const errorTypeMap = new Map<string, { count: number; lastOccurrence: Date }>();
    errorHeartbeats.forEach(h => {
      const errorName = (h.metadata as any)?.errorName || 'Unknown';
      if (!errorTypeMap.has(errorName)) {
        errorTypeMap.set(errorName, { count: 0, lastOccurrence: h.timestamp });
      }
      const stats = errorTypeMap.get(errorName)!;
      stats.count++;
      if (h.timestamp > stats.lastOccurrence) {
        stats.lastOccurrence = h.timestamp;
      }
    });

    const errorsByType = Array.from(errorTypeMap.entries())
      .map(([errorName, stats]) => ({
        errorName,
        count: stats.count,
        lastOccurrence: stats.lastOccurrence.toISOString(),
      }))
      .sort((a, b) => b.count - a.count);

    // Count sessions with errors
    const sessionsWithErrors = new Set(
      errors.map(e => e.sessionId).filter(Boolean)
    ).size;

    // Calculate error rate
    const totalSessions = allSessions.length;
    const errorRate = totalSessions > 0
      ? Math.round((sessionsWithErrors / totalSessions) * 100)
      : 0;

    // Error trends by day
    const trendMap = new Map<string, number>();
    errorHeartbeats.forEach(h => {
      const date = h.timestamp.toISOString().split('T')[0];
      trendMap.set(date, (trendMap.get(date) || 0) + 1);
    });

    const errorTrends = Array.from(trendMap.entries())
      .map(([date, errorCount]) => ({ date, errorCount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      summary: {
        totalErrors: errors.length,
        uniqueErrorTypes: errorTypeMap.size,
        sessionsWithErrors,
        errorRate,
        timeRange: `Last ${days} days`,
      },
      errorsByType,
      recentErrors: errors.slice(0, 20),
      errorTrends,
    };
  } catch (error: any) {
    if (error && typeof error === "object" && error.statusCode) throw error;
    const detailedMessage = error instanceof Error 
      ? error.message 
      : "Unknown error in error tracking endpoint";
    throw handleApiError(
      69,
      `Error tracking endpoint failed for user ${userId}. Original error: ${detailedMessage}`,
      "Failed to retrieve error tracking."
    );
  }
});
