import express from "express";

import authenticate from "../middleware/authMiddleware";
import {
  getMySubscription,
  testUpgradePlan,
} from "./subscriptionController";

const subscriptionRouter = express.Router();

subscriptionRouter.get("/me", authenticate, getMySubscription);

// Temporary testing route — remove or protect with admin/payment verification later.
subscriptionRouter.patch(
  "/test-upgrade",
  authenticate,
  testUpgradePlan,
);

export default subscriptionRouter;