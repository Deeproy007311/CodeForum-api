import { NextFunction, Response, Request } from "express";
import createHttpError from "http-errors";

import questionModel from "./questionModel";
import { AuthRequest } from "../user/authTypes";
// import { FilterQuery } from "mongoose";
import { Question } from "./questionTypes";

const createQuestion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const { title, description, tags } = req.body;

  // Validation
  if (!title || !description || !tags) {
    return next(createHttpError(400, "All fields are required"));
  }

  try {
    const question = await questionModel.create({
      title,
      description,
      tags,
      author: req.user?._id,
    });

    res.status(201).json({
      success: true,
      message: "Question created successfully",
      question,
    });
  } catch (error) {
    return next(createHttpError(500, "Error while creating question"));
  }
};

// Get All Questions
const getAllQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { tag, search } = req.query;

    const filter: Record<string, unknown> = {};

    // Filter by tag
    if (tag) {
      filter.tags = tag;
    }

    // Search in title or description
    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const questions = await questionModel
      .find(filter)
      .populate("author", "name username avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    return next(createHttpError(500, "Error while fetching questions"));
  }
};

// Get Single Question
const getSingleQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;

  try {
    const question = await questionModel
      .findById(id)
      .populate("author", "name username avatar");

    if (!question) {
      return next(createHttpError(404, "Question not found"));
    }

    res.status(200).json({
      success: true,
      question,
    });
  } catch (error) {
    return next(createHttpError(400, "Invalid question id"));
  }
};

export { createQuestion, getAllQuestions, getSingleQuestion };
