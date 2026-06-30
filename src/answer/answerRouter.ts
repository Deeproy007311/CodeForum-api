import express from "express";

import authenticate from "../middleware/authMiddleware";
import {
  acceptAnswer,
  createAnswer,
  editAnswer,
  getAnswersByQuestion,
} from "./answerController";

const answerRouter = express.Router();

// Create Answer
answerRouter.post("/:questionId/answers", authenticate, createAnswer);

// Get all answers of a question
answerRouter.get("/:questionId/answers", getAnswersByQuestion);

// Accept Answer (Question Owner Only)
answerRouter.patch("/answers/:answerId/accept", authenticate, acceptAnswer);

// Edit Answer
answerRouter.patch("/answers/:answerId", authenticate, editAnswer);

export default answerRouter;
