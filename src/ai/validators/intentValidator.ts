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

export function validateQuestionIntent(
  text: string,
): ValidationResult {
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