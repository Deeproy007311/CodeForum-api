import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import { sign } from "jsonwebtoken";

import userModel from "./userModel";
import { config } from "../config/config";
import { AuthRequest } from "./authTypes";

import questionModel from "../question/questionModel";
import answerModel from "../answer/answerModel";
import voteModel from "../vote/voteModel";

import aiUsageModel from "../ai/usage/aiUsageModel";
import aiHistoryModel from "../ai/history/aiHistoryModel";

import subscriptionModel from "../subscription/subscriptionModel";

// Register User
const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name, username, email, password, avatar, bio, skills } = req.body;

  if (!name || !username || !email || !password) {
    return next(createHttpError(400, "All required fields are required"));
  }

  try {
    const existingEmail = await userModel.findOne({ email });

    if (existingEmail) {
      return next(createHttpError(400, "Email already exists"));
    }

    const existingUsername = await userModel.findOne({ username });

    if (existingUsername) {
      return next(createHttpError(400, "Username already exists"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      name,
      username,
      email,
      password: hashedPassword,
      avatar,
      bio,
      skills,
    });

    const token = sign({ sub: newUser._id }, config.jwtSecretKey as string, {
      expiresIn: "7d",
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      accessToken: token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar,
        bio: newUser.bio,
        skills: newUser.skills,
        emailVerified: newUser.emailVerified,
        plan: newUser.plan,
      },
    });
  } catch (error) {
    return next(createHttpError(500, "Error while creating user"));
  }
};

// Login User
const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(createHttpError(400, "All fields are required"));
  }

  try {
    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return next(createHttpError(404, "User not found"));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(createHttpError(401, "Invalid email or password"));
    }

    const token = sign({ sub: user._id }, config.jwtSecretKey as string, {
      expiresIn: "7d",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken: token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        skills: user.skills,
        emailVerified: user.emailVerified,
        plan: user.plan,
      },
    });
  } catch (error) {
    return next(createHttpError(500, "Error while logging in"));
  }
};

const getCurrentUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    return next(createHttpError(500, "Error while fetching user"));
  }
};

const deleteMyAccount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user?._id) {
    return next(createHttpError(401, "Unauthorized"));
  }

  const userId = req.user._id.toString();

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(createHttpError(401, "Invalid authenticated user"));
  }

  try {
    // Find all questions created by this user
    const userQuestions = await questionModel
      .find({ author: userId })
      .select("_id");

    const questionIds = userQuestions.map((question) => question._id);

    // Find all answers under the user's questions
    const answersOnUserQuestions = await answerModel
      .find({ question: { $in: questionIds } })
      .select("_id");

    const answerIdsOnUserQuestions = answersOnUserQuestions.map(
      (answer) => answer._id,
    );

    // Find all answers written by this user on any question
    const userAnswers = await answerModel
      .find({ author: userId })
      .select("_id");

    const allAnswerIds = [
      ...answerIdsOnUserQuestions,
      ...userAnswers.map((answer) => answer._id),
    ];

    // Delete votes made by user and votes connected to deleted content
    await voteModel.deleteMany({
      $or: [
        { user: userId },
        { question: { $in: questionIds } },
        { answer: { $in: allAnswerIds } },
      ],
    });

    // Delete answers written by user and answers under their questions
    await answerModel.deleteMany({
      $or: [{ author: userId }, { question: { $in: questionIds } }],
    });

    // Delete questions written by user
    await questionModel.deleteMany({ author: userId });

    // Delete AI usage and AI history
    await aiUsageModel.deleteMany({ user: userId });
    await aiHistoryModel.deleteMany({ user: userId });

    // Delete all subscription records
    await subscriptionModel.deleteMany({ user: userId });

    // Delete user document last
    await userModel.deleteOne({ _id: userId });

    return res.status(200).json({
      success: true,
      message: "Your account and all related data were deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return next(createHttpError(500, "Failed to delete account"));
  }
};

export { registerUser, loginUser, getCurrentUser, deleteMyAccount };
