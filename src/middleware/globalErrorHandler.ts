import { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import { config } from "../config/config";

const globalErrorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;

  // Keep full details only in your server terminal
  console.error("API Error:", {
    statusCode,
    message: err.message,
    path: req.originalUrl,
    method: req.method,
    stack: err.stack,
  });

  const response: {
    success: boolean;
    message: string;
    stack?: string;
  } = {
    success: false,
    message:
      statusCode >= 500
        ? "Something went wrong on the server"
        : err.message || "Request failed",
  };

  // Only show stack locally during development
  if (config.env === "development") {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

export default globalErrorHandler;