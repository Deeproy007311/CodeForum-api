import express from "express";

import authenticate from "../middleware/authMiddleware";
import {
  createQuestion,
  getAllQuestions,
  getSingleQuestion,
} from "./questionController";

const questionRouter = express.Router();

questionRouter.post("/", authenticate, createQuestion);
questionRouter.get("/", getAllQuestions);
questionRouter.get("/:id", getSingleQuestion);

export default questionRouter;
