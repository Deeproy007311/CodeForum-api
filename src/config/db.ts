import mongoose from "mongoose";
import { config } from "./config";

const connectDB = async () => {
  if (!config.databaseUrl) {
    throw new Error("MONGO_CONNECTION_STRING is missing");
  }

  try {
    await mongoose.connect(config.databaseUrl);

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error(error);

    throw error;
  }
};

export default connectDB;