import mongoose from "mongoose";
import { NextFunction, Response } from "express";
import createHttpError from "http-errors";

import answerModel from "./answerModel";
import questionModel from "../question/questionModel";
import { AuthRequest } from "../user/authTypes";

const createAnswer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const questionId = String(req.params.questionId);
  const { content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return next(createHttpError(400, "Invalid question id"));
  }

  if (!content || typeof content !== "string" || !content.trim()) {
    return next(createHttpError(400, "Answer content is required"));
  }

  if (content.trim().length < 5 || content.trim().length > 10000) {
    return next(
      createHttpError(400, "Answer must be between 5 and 10000 characters"),
    );
  }

  if (!req.user) {
    return next(createHttpError(401, "Unauthorized"));
  }

  try {
    const question = await questionModel.findById(questionId);

    if (!question) {
      return next(createHttpError(404, "Question not found"));
    }

    const answer = await answerModel.create({
      content: content.trim(),
      author: req.user._id,
      question: question._id,
    });

    return res.status(201).json({
      success: true,
      message: "Answer posted successfully",
      answer,
    });
  } catch (error) {
    return next(createHttpError(500, "Error while posting answer"));
  }
};

const getAnswersByQuestion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const questionId = String(req.params.questionId);

  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return next(createHttpError(400, "Invalid question id"));
  }

  try {
    const question = await questionModel.findById(questionId);

    if (!question) {
      return next(createHttpError(404, "Question not found"));
    }

    const answers = await answerModel
      .find({ question: questionId })
      .populate("author", "name username avatar")
      .sort({ isAccepted: -1, createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: answers.length,
      answers,
    });
  } catch (error) {
    return next(createHttpError(500, "Error while fetching answers"));
  }
};

const acceptAnswer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const answerId = String(req.params.answerId);

  if (!mongoose.Types.ObjectId.isValid(answerId)) {
    return next(createHttpError(400, "Invalid answer id"));
  }

  if (!req.user) {
    return next(createHttpError(401, "Unauthorized"));
  }

  try {
    const answer = await answerModel.findById(answerId);

    if (!answer) {
      return next(createHttpError(404, "Answer not found"));
    }

    const question = await questionModel.findById(answer.question);

    if (!question) {
      return next(createHttpError(404, "Question not found"));
    }

    if (question.author.toString() !== req.user._id.toString()) {
      return next(
        createHttpError(403, "Only the question owner can accept an answer"),
      );
    }

    await answerModel.updateMany(
      { question: question._id },
      { isAccepted: false },
    );

    answer.isAccepted = true;
    await answer.save();

    question.isSolved = true;
    await question.save();

    return res.status(200).json({
      success: true,
      message: "Answer accepted successfully",
      answer,
    });
  } catch (error) {
    return next(createHttpError(500, "Error while accepting answer"));
  }
};

const editAnswer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const answerId = String(req.params.answerId);
  const { content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(answerId)) {
    return next(createHttpError(400, "Invalid answer id"));
  }

  if (!content || typeof content !== "string" || !content.trim()) {
    return next(createHttpError(400, "Answer content is required"));
  }

  if (content.trim().length < 5 || content.trim().length > 10000) {
    return next(
      createHttpError(400, "Answer must be between 5 and 10000 characters"),
    );
  }

  if (!req.user) {
    return next(createHttpError(401, "Unauthorized"));
  }

  try {
    const answer = await answerModel.findById(answerId);

    if (!answer) {
      return next(createHttpError(404, "Answer not found"));
    }

    if (answer.author.toString() !== req.user._id.toString()) {
      return next(
        createHttpError(403, "Only the answer owner can edit this answer"),
      );
    }

    answer.content = content.trim();
    await answer.save();

    return res.status(200).json({
      success: true,
      message: "Answer updated successfully",
      answer,
    });
  } catch (error) {
    return next(createHttpError(500, "Error while updating answer"));
  }
};

export { createAnswer, getAnswersByQuestion, acceptAnswer, editAnswer };
