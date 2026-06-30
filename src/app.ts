import express from "express";
import globalErrorHandler from "./middleware/globalErrorHandler";
import userRouter from "./user/userRouter";
import questionRouter from "./question/questionRouter";
import answerRouter from "./answer/answerRouter";
import voteRouter from "./vote/voteRouter";
import aiRouter from "./ai/aiRouter";

const app = express();
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Hii",
  });
});

app.use("/api/users", userRouter);
app.use("/api/questions", questionRouter);
app.use("/api/questions", answerRouter);
app.use("/api/votes", voteRouter);
app.use("/api/ai", aiRouter);

// Global error handler
app.use(globalErrorHandler);

export default app;
