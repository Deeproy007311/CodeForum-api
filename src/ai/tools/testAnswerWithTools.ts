import mongoose from "mongoose";
import connectDB from "../../config/db";
import { generateAnswerWithTools } from "./answerWithTools";

const testAnswerWithTools = async (): Promise<void> => {
  try {
    await connectDB();

    const answer = await generateAnswerWithTools({
      title:
        "How can I create a Python decorator for measuring execution time?",
      description:
        "I want to write a reusable Python decorator that measures how long a function takes to execute. Please explain how decorators work and show a simple example.",
      tags: ["python", "decorators"],
    });

    console.log("\n========== AI ANSWER WITH TOOLS ==========\n");
    console.log(answer);
    console.log("\n==========================================\n");
  } catch (error) {
    console.error("AI tool-calling test failed:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

void testAnswerWithTools();
