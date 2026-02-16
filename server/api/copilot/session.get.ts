import { H3Event } from "h3";
import { prisma } from "~~/prisma/db";
import { handleApiError } from "~~/server/utils/logging";

defineRouteMeta({
  openAPI: {
    tags: ["Stats", "Copilot"],
    summary: "Get session details",
    description: "Returns detailed information about a specific Copilot agent session.",
    parameters: [
      { 
        in: "query", 
        name: "sessionId", 
        required: true, 
        schema: { type: "string" },
        description: "The session ID to retrieve details for" 
      },
    ],
    responses: {
      200: { 
        description: "Session details",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                sessionId: { type: "string" },
                startTime: { type: "string" },
                endTime: { type: "string" },
                durationMinutes: { type: "number" },
                source: { type: "string" },
                reason: { type: "string" },
                initialPrompt: { type: "string" },
                events: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      timestamp: { type: "string" },
                      eventType: { type: "string" },
                      toolName: { type: "string" },
                      language: { type: "string" },
                      file: { type: "string" },
                      result: { type: "string" },
                    }
                  }
                },
                statistics: {
                  type: "object",
                  properties: {
                    totalEvents: { type: "number" },
                    toolsUsed: { type: "number" },
                    successfulTools: { type: "number" },
                    failedTools: { type: "number" },
                    promptsSubmitted: { type: "number" },
                    errors: { type: "number" },
                  }
                },
              }
            }
          }
        }
      },
      400: { description: "Invalid parameters" },
      401: { description: "Unauthorized" },
      404: { description: "Session not found" },
      500: { description: "Failed to retrieve session details" },
    },
    operationId: "getSessionDetails",
  },
});

export default defineEventHandler(async (event: H3Event) => {
  const userId = event.context.user.id;

  try {
    const query = getQuery(event);
    const sessionId = query.sessionId as string;

    if (!sessionId) {
      throw handleApiError(
        400,
        "Missing sessionId parameter",
        "Session ID is required."
      );
    }

    // Get all heartbeats for this session
    const heartbeats = await prisma.heartbeats.findMany({
      where: {
        userId,
        category: "copilot-agent",
        metadata: {
          path: ['sessionId'],
          equals: sessionId,
        },
      },
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

    if (heartbeats.length === 0) {
      throw handleApiError(
        404,
        `Session not found: ${sessionId}`,
        "Session not found."
      );
    }

    // Extract session metadata
    const startEvent = heartbeats.find(h => h.eventType === 'sessionStart');
    const endEvent = heartbeats.find(h => h.eventType === 'sessionEnd');
    
    const startTime = heartbeats[0].timestamp;
    const endTime = heartbeats[heartbeats.length - 1].timestamp;
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    const startMeta = startEvent?.metadata as any;
    const endMeta = endEvent?.metadata as any;

    // Calculate statistics
    const toolEvents = heartbeats.filter(h => h.eventType === 'postToolUse');
    const successfulTools = toolEvents.filter(h => (h.metadata as any)?.resultType === 'success').length;
    const failedTools = toolEvents.filter(h => (h.metadata as any)?.resultType === 'failure').length;
    const promptsSubmitted = heartbeats.filter(h => h.eventType === 'userPromptSubmitted').length;
    const errors = heartbeats.filter(h => h.eventType === 'errorOccurred').length;
    const uniqueTools = new Set(heartbeats.filter(h => h.toolName).map(h => h.toolName)).size;

    // Format events for response
    const events = heartbeats.map(h => ({
      timestamp: h.timestamp.toISOString(),
      eventType: h.eventType || 'unknown',
      toolName: h.toolName || null,
      language: h.language !== 'Unknown' ? h.language : null,
      file: h.file !== 'copilot-agent' ? h.file : null,
      result: h.eventType === 'postToolUse' ? (h.metadata as any)?.resultType : null,
      metadata: h.metadata,
    }));

    return {
      sessionId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationMinutes,
      source: startMeta?.source || null,
      reason: endMeta?.reason || null,
      initialPrompt: startMeta?.initialPrompt || null,
      events,
      statistics: {
        totalEvents: heartbeats.length,
        toolsUsed: uniqueTools,
        successfulTools,
        failedTools,
        promptsSubmitted,
        errors,
      },
    };
  } catch (error: any) {
    if (error && typeof error === "object" && error.statusCode) throw error;
    const detailedMessage = error instanceof Error 
      ? error.message 
      : "Unknown error in session details endpoint";
    throw handleApiError(
      69,
      `Session details endpoint failed for user ${userId}. Original error: ${detailedMessage}`,
      "Failed to retrieve session details."
    );
  }
});
