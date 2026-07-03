export interface ValidationResult {
  valid: boolean;
  message?: string;
}

const codePatterns = [
  /```[\s\S]*```/,
  /function\s+\w+/,
  /class\s+\w+/,
  /import\s.+from/,
  /export\s+/,
  /console\.log/,
  /#include/,
  /public static void main/,
  /<html/i,
  /SELECT\s.+FROM/i,
];

export function validateQuestionIntent(text: string): ValidationResult {
  for (const pattern of codePatterns) {
    if (pattern.test(text)) {
      return {
        valid: false,
        message:
          "It looks like you've pasted code. Please use AI Explain Code instead.",
      };
    }
  }

  return {
    valid: true,
  };
}

export const isMeaningfulProgrammingQuestion = (text: string): boolean => {
  const cleanedText = text.trim();

  // Too short to be a useful question
  if (cleanedText.length < 15) {
    return false;
  }

  const programmingKeywords = [
    "html",
    "css",
    "javascript",
    "typescript",
    "react",
    "node",
    "express",
    "mongodb",
    "mongoose",
    "python",
    "java",
    "php",
    "mysql",
    "api",
    "database",
    "error",
    "bug",
    "function",
    "component",
    "code",
    "frontend",
    "backend",
    "server",
    "programming",
    "website",
    "web",
    "app",
    "application",
  ];

  const lowerText = cleanedText.toLowerCase();

  return programmingKeywords.some((keyword) =>
    lowerText.includes(keyword),
  );
};
