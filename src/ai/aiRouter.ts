import express from "express";

import { generateAnswer } from "./aiController";

const aiRouter = express.Router();

aiRouter.post("/answer", generateAnswer);

export default aiRouter;