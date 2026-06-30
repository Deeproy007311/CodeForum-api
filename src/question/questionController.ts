import { NextFunction, Response, Request } from "express";
import createHttpError from "http-errors";

import questionModel from "./questionModel";
import { AuthRequest } from "../user/authTypes";
import answerModel from "../answer/answerModel";
import voteModel from "../vote/voteModel";
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
  req: AuthRequest,
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

    // Get votes
    const votes = await voteModel.find({
      question: question._id,
    });

    const upvotes = votes.filter((vote) => vote.voteType === 1).length;

    const downvotes = votes.filter((vote) => vote.voteType === -1).length;

    const score = upvotes - downvotes;

    let myVote = 0;

    if (req.user) {
      const userVote = votes.find(
        (vote) => vote.user.toString() === req.user?._id.toString(),
      );

      if (userVote) {
        myVote = userVote.voteType;
      }
    }

    const answers = await answerModel
      .find({
        question: question._id,
      })
      .populate("author", "name username avatar")
      .sort({ createdAt: 1 });

    const answerVotes = await voteModel.find({
      answer: {
        $in: answers.map((answer) => answer._id),
      },
    });

    const answersWithVotes = answers.map((answer) => {
      const votes = answerVotes.filter(
        (vote) => vote.answer?.toString() === answer._id.toString(),
      );

      const upvotes = votes.filter((vote) => vote.voteType === 1).length;

      const downvotes = votes.filter((vote) => vote.voteType === -1).length;

      const score = upvotes - downvotes;

      let myVote = 0;

      if (req.user) {
        const userVote = votes.find(
          (vote) => vote.user.toString() === req.user?._id.toString(),
        );

        if (userVote) {
          myVote = userVote.voteType;
        }
      }

      return {
        ...answer.toObject(),
        upvotes,
        downvotes,
        score,
        myVote,
      };
    });

    res.status(200).json({
      success: true,
      question: {
        ...question.toObject(),
        upvotes,
        downvotes,
        score,
        myVote,
      },
      answers: answersWithVotes,
    });
  } catch (error) {
    return next(createHttpError(400, "Invalid question id"));
  }
};

// Edit Question
const editQuestion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const { questionId } = req.params;
  const { title, description, tags } = req.body;

  // Validation
  if (!title || !description || !tags) {
    return next(createHttpError(400, "All fields are required"));
  }

  try {
    // Find question
    const question = await questionModel.findById(questionId);

    if (!question) {
      return next(createHttpError(404, "Question not found"));
    }

    // Check ownership
    if (question.author.toString() !== req.user?._id.toString()) {
      return next(
        createHttpError(403, "Only the question owner can edit this question"),
      );
    }

    // Update fields
    question.title = title;
    question.description = description;
    question.tags = tags;

    await question.save();

    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      question,
    });
  } catch (error) {
    return next(createHttpError(500, "Error while updating question"));
  }
};

// Delete Question
const deleteQuestion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const { questionId } = req.params;

  try {
    // Check if question exists
    const question = await questionModel.findById(questionId);

    if (!question) {
      return next(createHttpError(404, "Question not found"));
    }

    // Check ownership
    if (question.author.toString() !== req.user?._id.toString()) {
      return next(
        createHttpError(
          403,
          "Only the question owner can delete this question",
        ),
      );
    }

    // Delete all answers of this question
    await answerModel.deleteMany({
      question: question._id,
    });

    // Delete question
    await question.deleteOne();

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    return next(createHttpError(500, "Error while deleting question"));
  }
};

export {
  createQuestion,
  getAllQuestions,
  getSingleQuestion,
  editQuestion,
  deleteQuestion,
};
