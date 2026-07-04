import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import userModel from "./userModel";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import { AuthRequest } from "./authTypes";

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
      // plan is automatically "free" from userModel default
    });

    const token = sign(
      { sub: newUser._id },
      config.jwtSecretKey as string,
      { expiresIn: "7d" },
    );

    return res.status(201).json({
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
const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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

    const token = sign(
      { sub: user._id },
      config.jwtSecretKey as string,
      { expiresIn: "7d" },
    );

    return res.status(200).json({
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

// Fetch logged-in user
const getCurrentUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    return next(createHttpError(500, "Error while fetching user"));
  }
};

export { registerUser, loginUser, getCurrentUser };