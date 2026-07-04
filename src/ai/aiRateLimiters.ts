import rateLimit from "express-rate-limit";

const createAILimiter = (message: string) =>
  rateLimit({
    windowMs: 60 * 1000,
    limit: 5,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
  });

export const answerRateLimiter = createAILimiter(
  "Too many AI Answer requests. Please wait one minute and try again.",
);

export const improveQuestionRateLimiter = createAILimiter(
  "Too many Improve Question requests. Please wait one minute and try again.",
);

export const explainCodeRateLimiter = createAILimiter(
  "Too many Explain Code requests. Please wait one minute and try again.",
);