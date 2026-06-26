import express from "express";
import { getCurrentUser, loginUser, registerUser } from "./userController";
import authenticate from "../middleware/authMiddleware";

const userRouter = express.Router();

// routes
userRouter.post("/register", registerUser);

userRouter.post("/login", loginUser);

userRouter.get("/me", authenticate, getCurrentUser)




export default userRouter;
