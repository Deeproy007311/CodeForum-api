import Razorpay from "razorpay";
import { config } from "../config/config";

if (!config.razorpayKeyId || !config.razorpayKeySecret) {
  throw new Error("Razorpay API keys are missing in .env");
}

const razorpay = new Razorpay({
  key_id: config.razorpayKeyId,
  key_secret: config.razorpayKeySecret,
});

export default razorpay;