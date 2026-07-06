import mongoose from "mongoose";
import { config } from "./config";

const connectDB = async () => {
  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected successfully");
  });

  mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error);
  });

  await mongoose.connect(config.databaseUrl);
};

export default connectDB;
