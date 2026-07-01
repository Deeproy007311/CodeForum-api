export interface ValidationResult {
  valid: boolean;
  message?: string;
}

const codePatterns = [
  /```[\s\S]*```/,                // Markdown code block
  /function\s+\w+/,               // JavaScript
  /const\s+\w+\s*=/,
  /let\s+\w+\s*=/,
  /var\s+\w+\s*=/,
  /=>/,                           // Arrow function
  /class\s+\w+/,
  /import\s.+from/,
  /export\s+/,
  /console\.log/,
  /#include/,
  /public\s+static\s+void\s+main/,
  /System\.out\.println/,
  /print\(/,
  /def\s+\w+/,
  /if\s*\(/,
  /for\s*\(/,
  /while\s*\(/,
  /try\s*{/,
  /catch\s*\(/,
  /<html/i,
  /<body/i,
  /<div/i,
  /SELECT\s.+FROM/i,
  /INSERT\s+INTO/i,
  /UPDATE\s+/i,
  /DELETE\s+FROM/i,
];

export function validateCodeIntent(
  code: string,
): ValidationResult {

  const text = code.trim();

  if (!text) {
    return {
      valid: false,
      message: "Code is required.",
    };
  }

  let score = 0;

  for (const pattern of codePatterns) {
    if (pattern.test(text)) {
      score++;
    }
  }

  // Extra indicators

  if (text.includes("{")) score++;
  if (text.includes("}")) score++;
  if (text.includes(";")) score++;
  if (text.includes("(")) score++;
  if (text.includes(")")) score++;
  if (text.includes("=")) score++;

  // If it looks like code, allow it

  if (score >= 2) {
    return {
      valid: true,
    };
  }

  return {
    valid: false,
    message:
      "This doesn't appear to be source code. Please use AI Answer for programming questions.",
  };
}