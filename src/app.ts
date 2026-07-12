import cors from "cors";
import express from "express";
import createHttpError from "http-errors";

import { config } from "./config/config";
import globalErrorHandler from "./middleware/globalErrorHandler";

import userRouter from "./user/userRouter";
import questionRouter from "./question/questionRouter";
import answerRouter from "./answer/answerRouter";
import voteRouter from "./vote/voteRouter";
import aiRouter from "./ai/aiRouter";
import subscriptionRouter from "./subscription/subscriptionRouter";

const app = express();

const allowedOrigins = config.frontendUrl
  .split(",")
  .map((url) => url.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like Postman, curl, or server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "CodeForum API is running",
  });
});

app.get("/api/health", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "CodeForum API is healthy",
    environment: config.env,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/users", userRouter);
app.use("/api/questions", questionRouter);
app.use("/api/questions", answerRouter);
app.use("/api/votes", voteRouter);
app.use("/api/ai", aiRouter);
app.use("/api/subscriptions", subscriptionRouter);

app.use((_req, _res, next) => {
  next(createHttpError(404, "Route not found"));
});

app.use(globalErrorHandler);

export default app;