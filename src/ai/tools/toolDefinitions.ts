export const AI_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "search_similar_questions",
      description:
        "Search CodeForum's existing public questions for questions similar to a programming question. Use this before answering when existing discussions may help.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "A short search query containing the important technical words from the user's question.",
          },
          tags: {
            type: "array",
            description:
              "Optional programming tags related to the question, such as react, javascript, nodejs, express, mongodb.",
            items: {
              type: "string",
            },
          },
        },
        required: ["query"],
        additionalProperties: false,
      },
    },
  },
] as const;