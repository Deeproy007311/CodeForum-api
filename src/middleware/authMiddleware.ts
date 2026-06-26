import { NextFunction, Response } from "express";
import { verify } from "jsonwebtoken";
import createHttpError from "http-errors";
import { AuthRequest } from "../user/authTypes";
import { config } from "../config/config";
import userModel from "../user/userModel";


const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(createHttpError(401, "Unauthorized"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verify(token, config.jwtSecretKey as string) as {
      sub: string;
    };

    const user = await userModel.findById(decoded.sub);

    if (!user) {
      return next(createHttpError(401, "User not found"));
    }

    req.user = user;

    next();
  } catch (error) {
    return next(createHttpError(401, "Invalid or expired token"));
  }
};


export default authenticate;
