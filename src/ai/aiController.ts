import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

import aiService from "./aiServices";
import { validateQuestionIntent } from "./validators/intentValidator";
import { validateCodeIntent } from "./validators/codeValidator";

const generateAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { title, description, tags } = req.body;

    // Basic Validation
    if (!title || !description) {
      return next(createHttpError(400, "Title and description are required"));
    }

    // AI Intent Validation
    const validation = validateQuestionIntent(description);

    if (!validation.valid) {
      return next(createHttpError(400, validation.message));
    }

    const answer = await aiService.generateAnswer({
      title,
      description,
      tags: tags ?? [],
    });

    console.log("\n================ AI RESPONSE ================\n");
    console.log(answer);
    console.log("\n=============================================\n");

    return res.status(200).json({
      success: true,
      answer,
      generatedBy: "Groq",
      model: "llama-3.3-70b-versatile",
    });
  } catch (error) {
    console.error(error);
    return next(createHttpError(500, "Failed to generate AI answer"));
  }
};

const improveQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { title, description } = req.body;

    // Basic Validation
    if (!description) {
      return next(createHttpError(400, "Description is required"));
    }

    // AI Intent Validation
    const validation = validateQuestionIntent(description);

    if (!validation.valid) {
      return next(createHttpError(400, validation.message));
    }

    const result = await aiService.improveQuestion({
      title,
      description,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(error);

    return next(createHttpError(500, "Failed to improve question"));
  }
};

const explainCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.body;

    // Basic Validation
    if (!code || code.trim().length === 0) {
      return next(createHttpError(400, "Code is required"));
    }

    
    const validation = validateCodeIntent(code);

    if (!validation.valid) {
      return next(createHttpError(400, validation.message));
    }
    

    const explanation = await aiService.explainCode(code);

    console.log("\n============= AI CODE EXPLANATION =============\n");
    console.log(explanation);
    console.log("\n===============================================\n");

    return res.status(200).json({
      success: true,
      explanation,
      generatedBy: "Groq",
      model: "llama-3.3-70b-versatile",
    });
  } catch (error) {
    console.error(error);

    return next(createHttpError(500, "Failed to explain code"));
  }
};

export { generateAnswer, improveQuestion, explainCode };
