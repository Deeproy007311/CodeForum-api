import { NextFunction, Response, Request } from "express";
import createHttpError from "http-errors";
import mongoose from "mongoose";

import questionModel from "./questionModel";
import { AuthRequest } from "../user/authTypes";
import answerModel from "../answer/answerModel";
import voteModel from "../vote/voteModel";

const normalizeTags = (tags: unknown): string[] | null => {
  if (!Array.isArray(tags)) {
    return null;
  }

  const normalizedTags = [
    ...new Set(
      tags
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.length >= 2 && tag.length <= 30),
    ),
  ];

  if (normalizedTags.length < 1 || normalizedTags.length > 5) {
    return null;
  }

  return normalizedTags;
};

const validateQuestionInput = (
  title: unknown,
  description: unknown,
  tags: unknown,
) => {
  if (typeof title !== "string" || typeof description !== "string") {
    return {
      valid: false,
      message: "Title and description must be valid text",
    };
  }

  const cleanTitle = title.trim();
  const cleanDescription = description.trim();
  const cleanTags = normalizeTags(tags);

  if (cleanTitle.length < 10 || cleanTitle.length > 150) {
    return {
      valid: false,
      message: "Title must be between 10 and 150 characters",
    };
  }

  if (cleanDescription.length < 20) {
    return {
      valid: false,
      message: "Description must be at least 20 characters",
    };
  }

  if (!cleanTags) {
    return {
      valid: false,
      message:
        "Tags must contain between 1 and 5 unique tags, each between 2 and 30 characters",
    };
  }

  return {
    valid: true,
    data: {
      title: cleanTitle,
      description: cleanDescription,
      tags: cleanTags,
    },
  };
};

const createQuestion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validation = validateQuestionInput(
      req.body.title,
      req.body.description,
      req.body.tags,
    );

    if (!validation.valid) {
      return next(createHttpError(400, validation.message));
    }

    const question = await questionModel.create({
      ...validation.data,
      author: req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "Question created successfully",
      question,
    });
  } catch (error) {
    return next(createHttpError(500, "Error while creating question"));
  }
};

const getAllQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { tag, search } = req.query;
    const filter: Record<string, unknown> = {};

    if (typeof tag === "string" && tag.trim()) {
      filter.tags = tag.trim().toLowerCase();
    }

    if (typeof search === "string" && search.trim()) {
      const cleanSearch = search.trim().slice(0, 100);

      filter.$or = [
        {
          title: {
            $regex: cleanSearch,
            $options: "i",
          },
        },
        {
          description: {
            $regex: cleanSearch,
            $options: "i",
          },
        },
      ];
    }

    const questions = await questionModel
      .find(filter)
      .populate("author", "name username avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    return next(createHttpError(500, "Error while fetching questions"));
  }
};

const getSingleQuestion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const id = String(req.params.id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createHttpError(400, "Invalid question id"));
  }

  try {
    const question = await questionModel
      .findById(id)
      .populate("author", "name username avatar");

    if (!question) {
      return next(createHttpError(404, "Question not found"));
    }

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
      const votesForAnswer = answerVotes.filter(
        (vote) => vote.answer?.toString() === answer._id.toString(),
      );

      const answerUpvotes = votesForAnswer.filter(
        (vote) => vote.voteType === 1,
      ).length;

      const answerDownvotes = votesForAnswer.filter(
        (vote) => vote.voteType === -1,
      ).length;

      let answerMyVote = 0;

      if (req.user) {
        const userVote = votesForAnswer.find(
          (vote) => vote.user.toString() === req.user?._id.toString(),
        );

        if (userVote) {
          answerMyVote = userVote.voteType;
        }
      }

      return {
        ...answer.toObject(),
        upvotes: answerUpvotes,
        downvotes: answerDownvotes,
        score: answerUpvotes - answerDownvotes,
        myVote: answerMyVote,
      };
    });

    return res.status(200).json({
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
    return next(createHttpError(500, "Error while fetching question"));
  }
};

const editQuestion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const questionId = String(req.params.questionId);

  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return next(createHttpError(400, "Invalid question id"));
  }

  try {
    const validation = validateQuestionInput(
      req.body.title,
      req.body.description,
      req.body.tags,
    );

    if (!validation.valid) {
      return next(createHttpError(400, validation.message));
    }

    const question = await questionModel.findById(questionId);

    if (!question) {
      return next(createHttpError(404, "Question not found"));
    }

    if (question.author.toString() !== req.user?._id.toString()) {
      return next(
        createHttpError(403, "Only the question owner can edit this question"),
      );
    }

    question.title = validation.data.title;
    question.description = validation.data.description;
    question.tags = validation.data.tags;

    await question.save();

    return res.status(200).json({
      success: true,
      message: "Question updated successfully",
      question,
    });
  } catch (error) {
    return next(createHttpError(500, "Error while updating question"));
  }
};

const deleteQuestion = async (
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

    if (question.author.toString() !== req.user?._id.toString()) {
      return next(
        createHttpError(
          403,
          "Only the question owner can delete this question",
        ),
      );
    }

    await answerModel.deleteMany({
      question: question._id,
    });

    await voteModel.deleteMany({
      question: question._id,
    });

    await question.deleteOne();

    return res.status(200).json({
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
