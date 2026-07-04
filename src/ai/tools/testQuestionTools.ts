import mongoose from "mongoose";
import connectDB from "../../config/db";
import { searchSimilarQuestions } from "./questionTools";

const testTool = async (): Promise<void> => {
  try {
    await connectDB();

    const results = await searchSimilarQuestions({
      query: "How does useState work in React?",
      tags: ["react", "javascript"],
    });

    console.log("\n========== SIMILAR QUESTIONS ==========\n");
    console.log(JSON.stringify(results, null, 2));
    console.log("\n=======================================\n");
  } catch (error) {
    console.error("Tool test failed:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

void testTool();
