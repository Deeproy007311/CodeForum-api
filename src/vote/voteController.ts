import { NextFunction, Response } from "express";
import createHttpError from "http-errors";
import mongoose from "mongoose";

import voteModel from "./voteModel";
import questionModel from "../question/questionModel";
import { AuthRequest } from "../user/authTypes";

import answerModel from "../answer/answerModel";

// Upvote Question
const upvoteQuestion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const { questionId } = req.params as {
    questionId: string;
  };

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return next(createHttpError(400, "Invalid question id"));
  }

  try {
    // Authentication
    if (!req.user) {
      return next(createHttpError(401, "Unauthorized"));
    }

    // Check Question
    const question = await questionModel.findById(questionId);

    if (!question) {
      return next(createHttpError(404, "Question not found"));
    }

    // Existing Vote
    const existingVote = await voteModel.findOne({
      user: req.user._id,
      question: questionId,
    });

    // Case 1 - First Vote
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

    // Case 2 - Toggle Upvote
    if (existingVote.voteType === 1) {
      await existingVote.deleteOne();

      question.upvotes -= 1;
      await question.save();

      return res.status(200).json({
        success: true,
        message: "Upvote removed",
      });
    }

    // Case 3 - Downvote -> Upvote
    existingVote.voteType = 1;
    await existingVote.save();

    question.downvotes -= 1;
    question.upvotes += 1;
    await question.save();

    return res.status(200).json({
      success: true,
      message: "Changed to upvote",
    });
  } catch (error) {
    console.error(error);
    return next(createHttpError(500, "Error while upvoting question"));
  }
};

// Downvote Question
const downvoteQuestion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const { questionId } = req.params as {
    questionId: string;
  };

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return next(createHttpError(400, "Invalid question id"));
  }

  try {
    // Authentication
    if (!req.user) {
      return next(createHttpError(401, "Unauthorized"));
    }

    // Check Question
    const question = await questionModel.findById(questionId);

    if (!question) {
      return next(createHttpError(404, "Question not found"));
    }

    // Existing Vote
    const existingVote = await voteModel.findOne({
      user: req.user._id,
      question: questionId,
    });

    // Case 1 - First Vote
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

    // Case 2 - Toggle Downvote
    if (existingVote.voteType === -1) {
      await existingVote.deleteOne();

      question.downvotes -= 1;
      await question.save();

      return res.status(200).json({
        success: true,
        message: "Downvote removed",
      });
    }

    // Case 3 - Upvote -> Downvote
    existingVote.voteType = -1;
    await existingVote.save();

    question.upvotes -= 1;
    question.downvotes += 1;
    await question.save();

    return res.status(200).json({
      success: true,
      message: "Changed to downvote",
    });
  } catch (error) {
    console.error(error);
    return next(createHttpError(500, "Error while downvoting question"));
  }
};

// Upvote Answer
const upvoteAnswer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const { answerId } = req.params as {
    answerId: string;
  };

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(answerId)) {
    return next(createHttpError(400, "Invalid answer id"));
  }

  try {
    // Authentication
    if (!req.user) {
      return next(createHttpError(401, "Unauthorized"));
    }

    // Check Answer
    const answer = await answerModel.findById(answerId);

    if (!answer) {
      return next(createHttpError(404, "Answer not found"));
    }

    // Existing Vote
    const existingVote = await voteModel.findOne({
      user: req.user._id,
      answer: answerId,
    });

    // Case 1 - First Vote
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

    // Case 2 - Toggle Upvote
    if (existingVote.voteType === 1) {
      await existingVote.deleteOne();

      answer.upvotes -= 1;
      await answer.save();

      return res.status(200).json({
        success: true,
        message: "Upvote removed",
      });
    }

    // Case 3 - Downvote -> Upvote
    existingVote.voteType = 1;
    await existingVote.save();

    answer.downvotes -= 1;
    answer.upvotes += 1;
    await answer.save();

    return res.status(200).json({
      success: true,
      message: "Changed to upvote",
    });
  } catch (error) {
    console.error(error);
    return next(createHttpError(500, "Error while upvoting answer"));
  }
};

// Downvote Answer
const downvoteAnswer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const { answerId } = req.params as {
    answerId: string;
  };

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(answerId)) {
    return next(createHttpError(400, "Invalid answer id"));
  }

  try {
    // Authentication
    if (!req.user) {
      return next(createHttpError(401, "Unauthorized"));
    }

    // Check Answer
    const answer = await answerModel.findById(answerId);

    if (!answer) {
      return next(createHttpError(404, "Answer not found"));
    }

    // Existing Vote
    const existingVote = await voteModel.findOne({
      user: req.user._id,
      answer: answerId,
    });

    // Case 1 → First Vote
    if (!existingVote) {
      await voteModel.create({
        user: req.user._id,
        answer: answerId,
        voteType: -1,
      });

      return res.status(200).json({
        success: true,
        message: "Answer downvoted",
      });
    }

    // Case 2 → Toggle Downvote
    if (existingVote.voteType === -1) {
      await existingVote.deleteOne();

      return res.status(200).json({
        success: true,
        message: "Downvote removed",
      });
    }

    // Case 3 → Upvote → Downvote
    existingVote.voteType = -1;
    await existingVote.save();

    return res.status(200).json({
      success: true,
      message: "Changed to downvote",
    });
  } catch (error) {
    console.error(error);
    return next(createHttpError(500, "Error while downvoting answer"));
  }
};

export { upvoteQuestion, downvoteQuestion, upvoteAnswer, downvoteAnswer };
