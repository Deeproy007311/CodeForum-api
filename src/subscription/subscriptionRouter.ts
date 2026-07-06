import express from "express";

import authenticate from "../middleware/authMiddleware";
import {
  createRazorpayOrder,
  getMySubscription,
  verifyRazorpayPayment,
} from "./subscriptionController";

const subscriptionRouter = express.Router();

subscriptionRouter.get("/me", authenticate, getMySubscription);

subscriptionRouter.post(
  "/create-order",
  authenticate,
  createRazorpayOrder,
);

subscriptionRouter.post(
  "/verify-payment",
  authenticate,
  verifyRazorpayPayment,
);

export default subscriptionRouter;