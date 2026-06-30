import Groq from "groq-sdk";
import { config } from "../config/config";

const groq = new Groq({
  apiKey: config.groqApiKey,
});

export default groq;