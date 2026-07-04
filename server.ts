import { config } from "./src/config/config";
import app from "./src/app";
import connectDB from "./src/config/db";
import expireEndedSubscriptions from "./src/subscription/subscriptionExpiryService";

const startServer = async () => {
  try {
    await connectDB();

    // Check expired Pro subscriptions once when server starts
    await expireEndedSubscriptions();

    // Check again every 1 hour
    setInterval(async () => {
      try {
        await expireEndedSubscriptions();
      } catch (error) {
        console.error("Subscription expiry check failed:", error);
      }
    }, 60 * 60 * 1000);

    app.listen(config.port, () => {
      console.log(`Listening on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();