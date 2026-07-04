import { searchSimilarQuestions } from "./questionTools";

interface ToolArguments {
  query?: unknown;
  tags?: unknown;
}

const parseToolArguments = (rawArguments: string): ToolArguments => {
  try {
    const parsed = JSON.parse(rawArguments) as ToolArguments;

    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return parsed;
  } catch {
    return {};
  }
};

const normalizeTags = (tags: unknown): string[] => {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 5);
};

export const runTool = async (
  toolName: string,
  rawArguments: string,
): Promise<unknown> => {
  const args = parseToolArguments(rawArguments);

  switch (toolName) {
    case "search_similar_questions": {
      if (typeof args.query !== "string" || args.query.trim().length < 3) {
        return {
          success: false,
          message: "A valid search query of at least 3 characters is required.",
          results: [],
        };
      }

      const results = await searchSimilarQuestions({
        query: args.query.trim(),
        tags: normalizeTags(args.tags),
      });

      return {
        success: true,
        count: results.length,
        results,
      };
    }

    default:
      return {
        success: false,
        message: `Unknown AI tool: ${toolName}`,
      };
  }
};
