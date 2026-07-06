import express from "express";

import {
  deleteMyAccount,
  getCurrentUser,
  loginUser,
  registerUser,
} from "./userController";
import authenticate from "../middleware/authMiddleware";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

userRouter.get("/me", authenticate, getCurrentUser);

// Deletes only the logged-in user's account
userRouter.delete("/me", authenticate, deleteMyAccount);

export default userRouter;
