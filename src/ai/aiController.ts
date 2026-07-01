import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

import aiService from "./aiServices";

const generateAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { title, description, tags } = req.body;

    // Validation
    if (!title || !description) {
      return next(createHttpError(400, "Title and description are required"));
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

    if (!description) {
      return next(createHttpError(400, "Description is required"));
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
export { generateAnswer, improveQuestion };
