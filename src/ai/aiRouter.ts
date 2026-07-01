import express from "express";

import { explainCode, generateAnswer, improveQuestion } from "./aiController";

const aiRouter = express.Router();

aiRouter.post("/answer", generateAnswer);
aiRouter.post("/improve-question", improveQuestion);
aiRouter.post("/explain-code", explainCode);

export default aiRouter;