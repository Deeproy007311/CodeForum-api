import { config as dotenvConfig } from "dotenv";

dotenvConfig();

const requiredEnvVariables = [
  "MONGO_CONNECTION_STRING",
  "JWT_KEY",
  "GROQ_API_KEY",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
];

for (const variableName of requiredEnvVariables) {
  if (!process.env[variableName]) {
    throw new Error(`Missing required environment variable: ${variableName}`);
  }
}

const _config = {
  port: Number(process.env.PORT) || 5000,
  databaseUrl: process.env.MONGO_CONNECTION_STRING as string,
  env: process.env.NODE_ENV || "development",
  jwtSecretKey: process.env.JWT_KEY as string,
  groqApiKey: process.env.GROQ_API_KEY as string,

  razorpayKeyId: process.env.RAZORPAY_KEY_ID as string,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET as string,

  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
};

export const config = Object.freeze(_config);
