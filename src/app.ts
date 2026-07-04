import express from "express";

import { config } from "./config/config";
import globalErrorHandler from "./middleware/globalErrorHandler";
import userRouter from "./user/userRouter";
import questionRouter from "./question/questionRouter";
import answerRouter from "./answer/answerRouter";
import voteRouter from "./vote/voteRouter";
import aiRouter from "./ai/aiRouter";

import createHttpError from "http-errors";
import subscriptionRouter from "./subscription/subscriptionRouter";

const app = express();

// Middleware
app.use(express.json({ limit: "1mb" }));

// Basic API route
app.get("/", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "CodeForum API is running",
  });
});

// Health check route
app.get("/api/health", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "CodeForum API is healthy",
    environment: config.env,
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/users", userRouter);
app.use("/api/questions", questionRouter);
app.use("/api/questions", answerRouter);
app.use("/api/votes", voteRouter);
app.use("/api/ai", aiRouter);
app.use("/api/subscriptions", subscriptionRouter);

app.use((_req, _res, next) => {
  next(createHttpError(404, "Route not found"));
});

// Global error handler must stay last
app.use(globalErrorHandler);

export default app;