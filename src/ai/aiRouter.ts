import express from "express";

import authenticate from "../middleware/authMiddleware";
import {
  explainCode,
  generateAnswer,
  getAIHistory,
  getAIUsage,
  improveQuestion,
} from "./aiController";
import {
  answerRateLimiter,
  explainCodeRateLimiter,
  improveQuestionRateLimiter,
} from "./aiRateLimiters";

const aiRouter = express.Router();

aiRouter.get("/usage", authenticate, getAIUsage);
aiRouter.get("/history", authenticate, getAIHistory);

aiRouter.post("/answer", authenticate, answerRateLimiter, generateAnswer);

aiRouter.post(
  "/improve-question",
  authenticate,
  improveQuestionRateLimiter,
  improveQuestion,
);

aiRouter.post(
  "/explain-code",
  authenticate,
  explainCodeRateLimiter,
  explainCode,
);

export default aiRouter;
