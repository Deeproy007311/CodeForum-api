import express from "express";

import authenticate from "../middleware/authMiddleware";
import {
  createQuestion,
  deleteQuestion,
  editQuestion,
  getAllQuestions,
  getSingleQuestion,
} from "./questionController";

const questionRouter = express.Router();

questionRouter.post("/", authenticate, createQuestion);
questionRouter.get("/", getAllQuestions);
questionRouter.get("/:id", authenticate, getSingleQuestion);
questionRouter.patch("/:questionId", authenticate, editQuestion);
questionRouter.delete("/:questionId", authenticate, deleteQuestion);

export default questionRouter;
