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

export { generateAnswer };
