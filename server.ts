import { config } from "./src/config/config";
import app from "./src/app";
import connectDB from "./src/config/db";
import expireEndedSubscriptions from "./src/subscription/subscriptionExpiryService";

const startServer = async () => {
  try {
    await connectDB();

    await expireEndedSubscriptions();

    setInterval(
      () => {
        void expireEndedSubscriptions().catch((error) => {
          console.error("Subscription expiry check failed:", error);
        });
      },
      60 * 60 * 1000,
    );

    app.listen(config.port, "0.0.0.0", () => {
      console.log(`CodeForum API listening on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

void startServer();
