import { config } from "./src/config/config";
import app from "./src/app";
import connectDB from "./src/config/db";
import expireEndedSubscriptions from "./src/subscription/subscriptionExpiryService";

const startServer = async () => {
  try {
    if (!config.port) {
      throw new Error("PORT is missing");
    }

    await connectDB();

    await expireEndedSubscriptions();

    setInterval(async () => {
      try {
        await expireEndedSubscriptions();
      } catch (error) {
        console.error("Subscription expiry check failed:", error);
      }
    }, 60 * 60 * 1000);

    app.listen(Number(config.port), "0.0.0.0", () => {
      console.log(`Listening on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:");
    console.error(error);
    process.exit(1);
  }
};

startServer();