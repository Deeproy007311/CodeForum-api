import express from "express";

import { generateAnswer, improveQuestion } from "./aiController";

const aiRouter = express.Router();

aiRouter.post("/answer", generateAnswer);
aiRouter.post("/improve-question", improveQuestion);

export default aiRouter;