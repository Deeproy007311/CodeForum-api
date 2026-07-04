import mongoose from "mongoose";
import connectDB from "../../config/db";
import { runTool } from "./toolDispatcher";

const testDispatcher = async (): Promise<void> => {
  try {
    await connectDB();

    const result = await runTool(
      "search_similar_questions",
      JSON.stringify({
        query: ""
      }),
    );

    console.log("\n========== TOOL DISPATCHER RESULT ==========\n");
    console.log(JSON.stringify(result, null, 2));
    console.log("\n============================================\n");
  } catch (error) {
    console.error("Tool dispatcher test failed:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

void testDispatcher();