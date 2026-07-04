import { NextFunction, Response } from "express";
import createHttpError from "http-errors";

import aiService from "./aiServices";
import { AuthRequest } from "../user/authTypes";
import {
  ensureAIUsageAvailable,
  getAIUsageSummary,
  recordAIUsage,
} from "./usage/aiUsageService";
import { createAIHistory, getUserAIHistory } from "./history/aiHistoryService";
import {
  isMeaningfulProgrammingQuestion,
  validateQuestionIntent,
} from "./validators/intentValidator";
import { validateCodeIntent } from "./validators/codeValidator";

const generateAnswer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { title, description, tags } = req.body;

    if (!title || !description) {
      return next(createHttpError(400, "Title and description are required"));
    }

    if (typeof title !== "string" || typeof description !== "string") {
      return next(
        createHttpError(400, "Title and description must be valid text"),
      );
    }

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    const validation = validateQuestionIntent(cleanDescription);

    if (!validation.valid) {
      return next(createHttpError(400, validation.message));
    }

    const userId = req.user?._id.toString();

    if (!userId) {
      return next(createHttpError(401, "Unauthorized"));
    }

    await ensureAIUsageAvailable(userId);

    const result = await aiService.generateAnswer({
      title: cleanTitle,
      description: cleanDescription,
      tags: Array.isArray(tags) ? tags : [],
    });

    if (!result.fromCache) {
      await recordAIUsage(userId, "answer");
    }

    await createAIHistory({
      userId,
      feature: "answer",
      inputPreview: `${cleanTitle}: ${cleanDescription}`,
      fromCache: result.fromCache,
    });

    const usage = await getAIUsageSummary(userId);

    return res.status(200).json({
      success: true,
      answer: result.data,
      fromCache: result.fromCache,
      usage,
      generatedBy: "Groq",
      model: "llama-3.3-70b-versatile",
    });
  } catch (error) {
    console.error("Generate answer error:", error);

    if (createHttpError.isHttpError(error)) {
      return next(error);
    }

    return next(createHttpError(500, "Failed to generate AI answer"));
  }
};

const improveQuestion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { title, description } = req.body;

    if (!description || typeof description !== "string") {
      return next(createHttpError(400, "Description is required"));
    }

    const cleanDescription = description.trim();

    if (!isMeaningfulProgrammingQuestion(cleanDescription)) {
      return next(
        createHttpError(
          400,
          "Please provide a meaningful programming question with more details.",
        ),
      );
    }

    const validation = validateQuestionIntent(cleanDescription);

    if (!validation.valid) {
      return next(createHttpError(400, validation.message));
    }

    const userId = req.user?._id.toString();

    if (!userId) {
      return next(createHttpError(401, "Unauthorized"));
    }

    const cleanTitle = typeof title === "string" ? title.trim() : "";

    await ensureAIUsageAvailable(userId);

    const result = await aiService.improveQuestion({
      title: cleanTitle,
      description: cleanDescription,
    });

    if (!result.fromCache) {
      await recordAIUsage(userId, "improve-question");
    }

    await createAIHistory({
      userId,
      feature: "improve-question",
      inputPreview: `${cleanTitle || "Untitled question"}: ${cleanDescription}`,
      fromCache: result.fromCache,
    });

    const usage = await getAIUsageSummary(userId);

    return res.status(200).json({
      success: true,
      data: result.data,
      fromCache: result.fromCache,
      usage,
    });
  } catch (error) {
    console.error("Improve question error:", error);

    if (createHttpError.isHttpError(error)) {
      return next(error);
    }

    return next(createHttpError(500, "Failed to improve question"));
  }
};

const explainCode = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { code } = req.body;

    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return next(createHttpError(400, "Code is required"));
    }

    const cleanCode = code.trim();

    const validation = validateCodeIntent(cleanCode);

    if (!validation.valid) {
      return next(createHttpError(400, validation.message));
    }

    const userId = req.user?._id.toString();

    if (!userId) {
      return next(createHttpError(401, "Unauthorized"));
    }

    await ensureAIUsageAvailable(userId);

    const result = await aiService.explainCode(cleanCode);

    if (!result.fromCache) {
      await recordAIUsage(userId, "explain-code");
    }

    await createAIHistory({
      userId,
      feature: "explain-code",
      inputPreview: cleanCode,
      fromCache: result.fromCache,
    });

    const usage = await getAIUsageSummary(userId);

    return res.status(200).json({
      success: true,
      explanation: result.data,
      fromCache: result.fromCache,
      usage,
      generatedBy: "Groq",
      model: "llama-3.3-70b-versatile",
    });
  } catch (error) {
    console.error("Explain code error:", error);

    if (createHttpError.isHttpError(error)) {
      return next(error);
    }

    return next(createHttpError(500, "Failed to explain code"));
  }
};

const getAIUsage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?._id.toString();

    if (!userId) {
      return next(createHttpError(401, "Unauthorized"));
    }

    const usage = await getAIUsageSummary(userId);

    return res.status(200).json({
      success: true,
      usage,
    });
  } catch (error) {
    console.error("Get AI usage error:", error);

    return next(createHttpError(500, "Failed to fetch AI usage"));
  }
};

const getAIHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?._id.toString();

    if (!userId) {
      return next(createHttpError(401, "Unauthorized"));
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const result = await getUserAIHistory(userId, page, limit);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return next(error);
  }
};

export {
  generateAnswer,
  improveQuestion,
  explainCode,
  getAIUsage,
  getAIHistory,
};
