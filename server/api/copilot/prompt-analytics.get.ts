import { H3Event } from "h3";
import { prisma } from "~~/prisma/db";
import { handleApiError } from "~~/server/utils/logging";

defineRouteMeta({
  openAPI: {
    tags: ["Stats", "Copilot"],
    summary: "Get prompt analytics",
    description: "Analyzes user prompts submitted to Copilot agent to identify patterns and topics.",
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
        schema: { type: "integer", default: 20 },
        description: "Maximum number of recent prompts to return (default: 20)" 
      },
    ],
    responses: {
      200: { 
        description: "Prompt analytics",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                summary: {
                  type: "object",
                  properties: {
                    totalPrompts: { type: "number" },
                    averageLength: { type: "number" },
                    categorized: { type: "object" },
                  }
                },
                recentPrompts: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      timestamp: { type: "string" },
                      prompt: { type: "string" },
                      sessionId: { type: "string" },
                      category: { type: "string" },
                      wordCount: { type: "number" },
                    }
                  }
                },
                commonPatterns: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      keyword: { type: "string" },
                      count: { type: "number" },
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
      500: { description: "Failed to retrieve prompt analytics" },
    },
    operationId: "getCopilotPromptAnalytics",
  },
});

// Simple categorization based on keywords
function categorizePrompt(prompt: string): string {
  const lower = prompt.toLowerCase();
  
  if (lower.match(/\b(fix|bug|error|issue|problem|debug)\b/)) return 'Bug Fix';
  if (lower.match(/\b(add|create|implement|new|build|make)\b/)) return 'Feature Development';
  if (lower.match(/\b(refactor|improve|optimize|clean|reorganize)\b/)) return 'Refactoring';
  if (lower.match(/\b(test|spec|unit test|e2e)\b/)) return 'Testing';
  if (lower.match(/\b(document|comment|readme|explain)\b/)) return 'Documentation';
  if (lower.match(/\b(update|upgrade|change|modify)\b/)) return 'Modification';
  if (lower.match(/\b(review|check|analyze|look)\b/)) return 'Code Review';
  
  return 'General';
}

export default defineEventHandler(async (event: H3Event) => {
  const userId = event.context.user.id;

  try {
    const query = getQuery(event);
    const days = query.days ? parseInt(query.days as string, 10) : 7;
    const limit = query.limit ? parseInt(query.limit as string, 10) : 20;

    if (days < 1 || days > 90) {
      throw handleApiError(
        400,
        `Invalid days value: ${days}. Must be between 1 and 90.`,
        "Invalid time range specified."
      );
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get user prompt submissions
    const heartbeats = await prisma.heartbeats.findMany({
      where: {
        userId,
        category: "copilot-agent",
        eventType: 'userPromptSubmitted',
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

    // Extract and analyze prompts
    const prompts = heartbeats
      .map(h => {
        const meta = h.metadata as any;
        const prompt = meta?.prompt || '';
        const sessionId = meta?.sessionId || null;
        
        return {
          timestamp: h.timestamp.toISOString(),
          prompt,
          sessionId,
          category: categorizePrompt(prompt),
          wordCount: prompt.split(/\s+/).length,
        };
      })
      .filter(p => p.prompt.length > 0);

    // Calculate summary statistics
    const totalPrompts = prompts.length;
    const averageLength = totalPrompts > 0
      ? Math.round(prompts.reduce((sum, p) => sum + p.prompt.length, 0) / totalPrompts)
      : 0;

    // Categorize prompts
    const categorized: { [key: string]: number } = {};
    prompts.forEach(p => {
      categorized[p.category] = (categorized[p.category] || 0) + 1;
    });

    // Find common keywords/patterns
    const wordFrequency = new Map<string, number>();
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'be', 'this', 'that', 'it', 'can', 'will', 'should']);
    
    prompts.forEach(p => {
      const words = p.prompt.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3 && !stopWords.has(w));
      
      words.forEach(word => {
        wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
      });
    });

    const commonPatterns = Array.from(wordFrequency.entries())
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([keyword, count]) => ({ keyword, count }));

    // Get recent prompts (with truncated text for privacy)
    const recentPrompts = prompts.slice(0, limit).map(p => ({
      ...p,
      prompt: p.prompt.substring(0, 200) + (p.prompt.length > 200 ? '...' : ''),
    }));

    return {
      summary: {
        totalPrompts,
        averageLength,
        averageWordCount: totalPrompts > 0
          ? Math.round(prompts.reduce((sum, p) => sum + p.wordCount, 0) / totalPrompts)
          : 0,
        categorized,
        timeRange: `Last ${days} days`,
      },
      recentPrompts,
      commonPatterns,
    };
  } catch (error: any) {
    if (error && typeof error === "object" && error.statusCode) throw error;
    const detailedMessage = error instanceof Error 
      ? error.message 
      : "Unknown error in prompt analytics endpoint";
    throw handleApiError(
      69,
      `Prompt analytics endpoint failed for user ${userId}. Original error: ${detailedMessage}`,
      "Failed to retrieve prompt analytics."
    );
  }
});
