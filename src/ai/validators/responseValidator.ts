export interface AIResponseValidationResult {
  valid: boolean;
  message?: string;
}

export function validateAIResponse(
  response: string | null | undefined,
): AIResponseValidationResult {
  if (!response || response.trim().length === 0) {
    return {
      valid: false,
      message: "AI returned an empty response.",
    };
  }

  const cleanedResponse = response.trim();

  // Very short output usually means the AI did not answer properly
  if (cleanedResponse.length < 20) {
    return {
      valid: false,
      message: "AI returned an incomplete response.",
    };
  }

  const invalidResponses = [
    "i don't know",
    "i do not know",
    "unable to help",
    "cannot help",
    "can't help",
    "no response",
    "undefined",
    "null",
  ];

  const lowerCaseResponse = cleanedResponse.toLowerCase();

  const isInvalid = invalidResponses.some((text) =>
    lowerCaseResponse === text || lowerCaseResponse.startsWith(text),
  );

  if (isInvalid) {
    return {
      valid: false,
      message: "AI could not generate a useful response.",
    };
  }

  return {
    valid: true,
  };
}