import express from "express";

import authenticate from "../middleware/authMiddleware";
import {
  downvoteAnswer,
  downvoteQuestion,
  upvoteAnswer,
  upvoteQuestion,
} from "./voteController";

const voteRouter = express.Router();

// Question Vote
voteRouter.post("/questions/:questionId/upvote", authenticate, upvoteQuestion);

voteRouter.post(
  "/questions/:questionId/downvote",
  authenticate,
  downvoteQuestion,
);

// Answer Vote
voteRouter.post("/answers/:answerId/upvote", authenticate, upvoteAnswer);
voteRouter.post("/answers/:answerId/downvote", authenticate, downvoteAnswer);
export default voteRouter;
