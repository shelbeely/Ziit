import { H3Event } from "h3";
import { prisma } from "~~/prisma/db";
import { handleApiError } from "~~/server/utils/logging";

defineRouteMeta({
  openAPI: {
    tags: ["Stats", "Copilot"],
    summary: "Get activity timeline for Copilot sessions",
    description: "Returns timeline data showing Copilot agent activity patterns over time.",
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
        name: "groupBy", 
        required: false, 
        schema: { type: "string", enum: ["hour", "day"], default: "hour" },
        description: "Group timeline by hour or day" 
      },
    ],
    responses: {
      200: { 
        description: "Activity timeline data",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                timeline: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      period: { type: "string" },
                      sessions: { type: "number" },
                      totalEvents: { type: "number" },
                      toolUses: { type: "number" },
                      prompts: { type: "number" },
                      errors: { type: "number" },
                      activeMinutes: { type: "number" },
                    }
                  }
                },
                peakActivity: {
                  type: "object",
                  properties: {
                    hour: { type: "number" },
                    day: { type: "string" },
                    sessions: { type: "number" },
                  }
                },
                patterns: {
                  type: "object",
                  properties: {
                    mostActiveHours: { type: "array" },
                    averageSessionDuration: { type: "number" },
                    averageEventsPerSession: { type: "number" },
                  }
                },
              }
            }
          }
        }
      },
      400: { description: "Invalid parameters" },
      401: { description: "Unauthorized" },
      500: { description: "Failed to retrieve timeline" },
    },
    operationId: "getCopilotActivityTimeline",
  },
});

export default defineEventHandler(async (event: H3Event) => {
  const userId = event.context.user.id;

  try {
    const query = getQuery(event);
    const days = query.days ? parseInt(query.days as string, 10) : 7;
    const groupBy = (query.groupBy as string) || "hour";

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
    const heartbeats = await prisma.heartbeats.findMany({
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
        metadata: true,
      },
    });

    // Group by time period
    const timelineMap = new Map<string, {
      sessions: Set<string>;
      totalEvents: number;
      toolUses: number;
      prompts: number;
      errors: number;
      timestamps: number[];
    }>();

    heartbeats.forEach(h => {
      const date = new Date(h.timestamp);
      let period: string;
      
      if (groupBy === "hour") {
        period = `${date.toISOString().split('T')[0]} ${date.getHours().toString().padStart(2, '0')}:00`;
      } else {
        period = date.toISOString().split('T')[0];
      }

      if (!timelineMap.has(period)) {
        timelineMap.set(period, {
          sessions: new Set(),
          totalEvents: 0,
          toolUses: 0,
          prompts: 0,
          errors: 0,
          timestamps: [],
        });
      }

      const stats = timelineMap.get(period)!;
      stats.totalEvents++;
      stats.timestamps.push(date.getTime());

      const sessionId = (h.metadata as any)?.sessionId;
      if (sessionId) {
        stats.sessions.add(sessionId);
      }

      if (h.eventType === 'postToolUse') stats.toolUses++;
      if (h.eventType === 'userPromptSubmitted') stats.prompts++;
      if (h.eventType === 'errorOccurred') stats.errors++;
    });

    // Calculate active minutes per period
    const timeline = Array.from(timelineMap.entries())
      .map(([period, stats]) => {
        // Estimate active minutes based on event distribution
        const sortedTimes = stats.timestamps.sort((a, b) => a - b);
        let activeMinutes = 0;
        
        for (let i = 1; i < sortedTimes.length; i++) {
          const gap = (sortedTimes[i] - sortedTimes[i-1]) / 1000 / 60;
          // Count gaps < 10 minutes as active time
          if (gap < 10) {
            activeMinutes += gap;
          }
        }

        return {
          period,
          sessions: stats.sessions.size,
          totalEvents: stats.totalEvents,
          toolUses: stats.toolUses,
          prompts: stats.prompts,
          errors: stats.errors,
          activeMinutes: Math.round(activeMinutes),
        };
      })
      .sort((a, b) => a.period.localeCompare(b.period));

    // Find peak activity
    const peakPeriod = timeline.reduce((max, curr) => 
      curr.totalEvents > max.totalEvents ? curr : max
    , timeline[0] || { period: '', totalEvents: 0, sessions: 0 });

    const peakDate = new Date(peakPeriod.period);
    const peakActivity = {
      hour: groupBy === "hour" ? peakDate.getHours() : null,
      day: peakDate.toLocaleDateString('en-US', { weekday: 'long' }),
      sessions: peakPeriod.sessions,
    };

    // Calculate activity patterns
    const hourlyActivity = new Map<number, number>();
    heartbeats.forEach(h => {
      const hour = new Date(h.timestamp).getHours();
      hourlyActivity.set(hour, (hourlyActivity.get(hour) || 0) + 1);
    });

    const mostActiveHours = Array.from(hourlyActivity.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour, count]) => ({
        hour,
        timeRange: `${hour}:00-${hour + 1}:00`,
        events: count,
      }));

    // Calculate session statistics
    const sessionMap = new Map<string, number[]>();
    heartbeats.forEach(h => {
      const sid = (h.metadata as any)?.sessionId;
      if (sid) {
        if (!sessionMap.has(sid)) {
          sessionMap.set(sid, []);
        }
        sessionMap.get(sid)!.push(h.timestamp.getTime());
      }
    });

    const sessionDurations = Array.from(sessionMap.values()).map(times => {
      times.sort((a, b) => a - b);
      return (times[times.length - 1] - times[0]) / 1000 / 60;
    });

    const averageSessionDuration = sessionDurations.length > 0
      ? Math.round(sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length)
      : 0;

    const averageEventsPerSession = sessionMap.size > 0
      ? Math.round(heartbeats.length / sessionMap.size)
      : 0;

    return {
      timeline,
      peakActivity,
      patterns: {
        mostActiveHours,
        averageSessionDuration,
        averageEventsPerSession,
        totalSessions: sessionMap.size,
      },
    };
  } catch (error: any) {
    if (error && typeof error === "object" && error.statusCode) throw error;
    const detailedMessage = error instanceof Error 
      ? error.message 
      : "Unknown error in activity timeline endpoint";
    throw handleApiError(
      69,
      `Activity timeline endpoint failed for user ${userId}. Original error: ${detailedMessage}`,
      "Failed to retrieve activity timeline."
    );
  }
});
