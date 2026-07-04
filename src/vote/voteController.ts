import { NextFunction, Response } from "express";
import createHttpError from "http-errors";
import mongoose from "mongoose";

import voteModel from "./voteModel";
import questionModel from "../question/questionModel";
import answerModel from "../answer/answerModel";
import { AuthRequest } from "../user/authTypes";

const upvoteQuestion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const questionId = String(req.params.questionId);

  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return next(createHttpError(400, "Invalid question id"));
  }

  if (!req.user) {
    return next(createHttpError(401, "Unauthorized"));
  }

  try {
    const question = await questionModel.findById(questionId);

    if (!question) {
      return next(createHttpError(404, "Question not found"));
    }

    const existingVote = await voteModel.findOne({
      user: req.user._id,
      question: questionId,
    });

    if (!existingVote) {
      await voteModel.create({
        user: req.user._id,
        question: questionId,
        voteType: 1,
      });

      question.upvotes += 1;
      await question.save();

      return res.status(200).json({
        success: true,
        message: "Question upvoted",
      });
    }

    if (existingVote.voteType === 1) {
      await existingVote.deleteOne();

      question.upvotes = Math.max(question.upvotes - 1, 0);
      await question.save();

      return res.status(200).json({
        success: true,
        message: "Upvote removed",
      });
    }

    existingVote.voteType = 1;
    await existingVote.save();

    question.downvotes = Math.max(question.downvotes - 1, 0);
    question.upvotes += 1;
    await question.save();

    return res.status(200).json({
      success: true,
      message: "Changed to upvote",
    });
  } catch (error) {
    console.error("Upvote question error:", error);
    return next(createHttpError(500, "Error while upvoting question"));
  }
};

const downvoteQuestion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const questionId = String(req.params.questionId);

  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return next(createHttpError(400, "Invalid question id"));
  }

  if (!req.user) {
    return next(createHttpError(401, "Unauthorized"));
  }

  try {
    const question = await questionModel.findById(questionId);

    if (!question) {
      return next(createHttpError(404, "Question not found"));
    }

    const existingVote = await voteModel.findOne({
      user: req.user._id,
      question: questionId,
    });

    if (!existingVote) {
      await voteModel.create({
        user: req.user._id,
        question: questionId,
        voteType: -1,
      });

      question.downvotes += 1;
      await question.save();

      return res.status(200).json({
        success: true,
        message: "Question downvoted",
      });
    }

    if (existingVote.voteType === -1) {
      await existingVote.deleteOne();

      question.downvotes = Math.max(question.downvotes - 1, 0);
      await question.save();

      return res.status(200).json({
        success: true,
        message: "Downvote removed",
      });
    }

    existingVote.voteType = -1;
    await existingVote.save();

    question.upvotes = Math.max(question.upvotes - 1, 0);
    question.downvotes += 1;
    await question.save();

    return res.status(200).json({
      success: true,
      message: "Changed to downvote",
    });
  } catch (error) {
    console.error("Downvote question error:", error);
    return next(createHttpError(500, "Error while downvoting question"));
  }
};

const upvoteAnswer = async (
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

    const existingVote = await voteModel.findOne({
      user: req.user._id,
      answer: answerId,
    });

    if (!existingVote) {
      await voteModel.create({
        user: req.user._id,
        answer: answerId,
        voteType: 1,
      });

      answer.upvotes += 1;
      await answer.save();

      return res.status(200).json({
        success: true,
        message: "Answer upvoted",
      });
    }

    if (existingVote.voteType === 1) {
      await existingVote.deleteOne();

      answer.upvotes = Math.max(answer.upvotes - 1, 0);
      await answer.save();

      return res.status(200).json({
        success: true,
        message: "Upvote removed",
      });
    }

    existingVote.voteType = 1;
    await existingVote.save();

    answer.downvotes = Math.max(answer.downvotes - 1, 0);
    answer.upvotes += 1;
    await answer.save();

    return res.status(200).json({
      success: true,
      message: "Changed to upvote",
    });
  } catch (error) {
    console.error("Upvote answer error:", error);
    return next(createHttpError(500, "Error while upvoting answer"));
  }
};

const downvoteAnswer = async (
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

    const existingVote = await voteModel.findOne({
      user: req.user._id,
      answer: answerId,
    });

    if (!existingVote) {
      await voteModel.create({
        user: req.user._id,
        answer: answerId,
        voteType: -1,
      });

      answer.downvotes += 1;
      await answer.save();

      return res.status(200).json({
        success: true,
        message: "Answer downvoted",
      });
    }

    if (existingVote.voteType === -1) {
      await existingVote.deleteOne();

      answer.downvotes = Math.max(answer.downvotes - 1, 0);
      await answer.save();

      return res.status(200).json({
        success: true,
        message: "Downvote removed",
      });
    }

    existingVote.voteType = -1;
    await existingVote.save();

    answer.upvotes = Math.max(answer.upvotes - 1, 0);
    answer.downvotes += 1;
    await answer.save();

    return res.status(200).json({
      success: true,
      message: "Changed to downvote",
    });
  } catch (error) {
    console.error("Downvote answer error:", error);
    return next(createHttpError(500, "Error while downvoting answer"));
  }
};

export { upvoteQuestion, downvoteQuestion, upvoteAnswer, downvoteAnswer };