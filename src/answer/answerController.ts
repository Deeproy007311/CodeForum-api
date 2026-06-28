import mongoose from "mongoose";
import { NextFunction, Response } from "express";
import createHttpError from "http-errors";

import answerModel from "./answerModel";
import questionModel from "../question/questionModel";
import { AuthRequest } from "../user/authTypes";

// Create Answer
const createAnswer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const { questionId } = req.params as { questionId: string };
  const { content } = req.body as { content: string };

  // Validation
  if (!content || !content.trim()) {
    return next(createHttpError(400, "Answer content is required"));
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return next(createHttpError(400, "Invalid question id"));
    }
    // Check if question exists
    const question = await questionModel.findById(questionId);

    if (!question) {
      return next(createHttpError(404, "Question not found"));
    }

    // Check authentication
    if (!req.user) {
      return next(createHttpError(401, "Unauthorized"));
    }

    // Create answer
    const answer = await answerModel.create({
      content: content.trim(),
      author: req.user._id,
      question: question._id,
    });

    res.status(201).json({
      success: true,
      message: "Answer posted successfully",
      answer,
    });
  } catch (error) {
    return next(createHttpError(500, "Error while posting answer"));
  }
};

// Get Answers of a Question
const getAnswersByQuestion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const { questionId } = req.params as { questionId: string };

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return next(createHttpError(400, "Invalid question id"));
  }

  try {
    // Check if question exists
    const question = await questionModel.findById(questionId);

    if (!question) {
      return next(createHttpError(404, "Question not found"));
    }

    const answers = await answerModel
      .find({ question: questionId })
      .populate("author", "name username avatar")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: answers.length,
      answers,
    });
  } catch (error) {
    return next(createHttpError(500, "Error while fetching answers"));
  }
};

// Accept Answer
const acceptAnswer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const { answerId } = req.params as { answerId: string };

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(answerId)) {
    return next(createHttpError(400, "Invalid answer id"));
  }

  try {
    // Check authentication
    if (!req.user) {
      return next(createHttpError(401, "Unauthorized"));
    }

    // Find answer
    const answer = await answerModel.findById(answerId);

    if (!answer) {
      return next(createHttpError(404, "Answer not found"));
    }

    // Find question
    const question = await questionModel.findById(answer.question);

    if (!question) {
      return next(createHttpError(404, "Question not found"));
    }

    // Only question owner can accept an answer
    if (question.author.toString() !== req.user._id.toString()) {
      return next(
        createHttpError(403, "Only the question owner can accept an answer"),
      );
    }

    // Remove previously accepted answer
    await answerModel.updateMany(
      { question: question._id },
      { isAccepted: false },
    );

    // Accept selected answer
    answer.isAccepted = true;
    await answer.save();

    // Mark question as solved
    question.isSolved = true;
    await question.save();

    res.status(200).json({
      success: true,
      message: "Answer accepted successfully",
      answer,
    });
  } catch (error) {
    return next(createHttpError(500, "Error while accepting answer"));
  }
};
export { createAnswer, getAnswersByQuestion, acceptAnswer };
