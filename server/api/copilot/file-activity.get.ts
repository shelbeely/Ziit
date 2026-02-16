import { H3Event } from "h3";
import { prisma } from "~~/prisma/db";
import { handleApiError } from "~~/server/utils/logging";

defineRouteMeta({
  openAPI: {
    tags: ["Stats", "Copilot"],
    summary: "Get file activity heatmap",
    description: "Returns a heatmap of files modified during Copilot agent sessions.",
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
        name: "limit", 
        required: false, 
        schema: { type: "integer", default: 50 },
        description: "Maximum number of files to return (default: 50)" 
      },
    ],
    responses: {
      200: { 
        description: "File activity heatmap",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                files: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      path: { type: "string" },
                      language: { type: "string" },
                      edits: { type: "number" },
                      views: { type: "number" },
                      creates: { type: "number" },
                      totalActivity: { type: "number" },
                      lastModified: { type: "string" },
                      sessionsInvolved: { type: "number" },
                    }
                  }
                },
                summary: {
                  type: "object",
                  properties: {
                    totalFiles: { type: "number" },
                    totalEdits: { type: "number" },
                    mostEditedFile: { type: "string" },
                    languageBreakdown: { type: "object" },
                  }
                },
              }
            }
          }
        }
      },
      400: { description: "Invalid parameters" },
      401: { description: "Unauthorized" },
      500: { description: "Failed to retrieve file activity" },
    },
    operationId: "getCopilotFileActivity",
  },
});

export default defineEventHandler(async (event: H3Event) => {
  const userId = event.context.user.id;

  try {
    const query = getQuery(event);
    const days = query.days ? parseInt(query.days as string, 10) : 7;
    const limit = query.limit ? parseInt(query.limit as string, 10) : 50;

    if (days < 1 || days > 90) {
      throw handleApiError(
        400,
        `Invalid days value: ${days}. Must be between 1 and 90.`,
        "Invalid time range specified."
      );
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get tool usage heartbeats with file information
    const heartbeats = await prisma.heartbeats.findMany({
      where: {
        userId,
        category: "copilot-agent",
        eventType: {
          in: ['preToolUse', 'postToolUse'],
        },
        timestamp: {
          gte: startDate,
        },
        file: {
          not: 'copilot-agent', // Exclude generic entries
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      select: {
        timestamp: true,
        toolName: true,
        language: true,
        file: true,
        eventType: true,
        metadata: true,
      },
    });

    // Aggregate file statistics
    const fileStats = new Map<string, {
      language: string;
      edits: number;
      views: number;
      creates: number;
      lastModified: Date;
      sessions: Set<string>;
    }>();

    heartbeats.forEach(h => {
      const filePath = h.file || '';
      if (!filePath || filePath === 'copilot-agent') return;

      if (!fileStats.has(filePath)) {
        fileStats.set(filePath, {
          language: h.language || 'Unknown',
          edits: 0,
          views: 0,
          creates: 0,
          lastModified: h.timestamp,
          sessions: new Set(),
        });
      }

      const stats = fileStats.get(filePath)!;
      
      // Update language if we have a better one
      if (h.language && h.language !== 'Unknown') {
        stats.language = h.language;
      }

      // Track tool types
      if (h.eventType === 'postToolUse') {
        if (h.toolName === 'edit') stats.edits++;
        if (h.toolName === 'view') stats.views++;
        if (h.toolName === 'create') stats.creates++;
      }

      // Track last modified
      if (h.timestamp > stats.lastModified) {
        stats.lastModified = h.timestamp;
      }

      // Track sessions
      const sessionId = (h.metadata as any)?.sessionId;
      if (sessionId) {
        stats.sessions.add(sessionId);
      }
    });

    // Convert to array and sort by total activity
    const files = Array.from(fileStats.entries())
      .map(([path, stats]) => ({
        path,
        language: stats.language,
        edits: stats.edits,
        views: stats.views,
        creates: stats.creates,
        totalActivity: stats.edits + stats.views + stats.creates,
        lastModified: stats.lastModified.toISOString(),
        sessionsInvolved: stats.sessions.size,
      }))
      .sort((a, b) => b.totalActivity - a.totalActivity)
      .slice(0, limit);

    // Calculate summary statistics
    const totalEdits = files.reduce((sum, f) => sum + f.edits, 0);
    const mostEditedFile = files[0]?.path || null;

    // Language breakdown
    const languageBreakdown: { [key: string]: number } = {};
    files.forEach(f => {
      if (f.language !== 'Unknown') {
        languageBreakdown[f.language] = (languageBreakdown[f.language] || 0) + f.totalActivity;
      }
    });

    return {
      files,
      summary: {
        totalFiles: fileStats.size,
        totalEdits,
        mostEditedFile,
        languageBreakdown,
      },
    };
  } catch (error: any) {
    if (error && typeof error === "object" && error.statusCode) throw error;
    const detailedMessage = error instanceof Error 
      ? error.message 
      : "Unknown error in file activity endpoint";
    throw handleApiError(
      69,
      `File activity endpoint failed for user ${userId}. Original error: ${detailedMessage}`,
      "Failed to retrieve file activity."
    );
  }
});
