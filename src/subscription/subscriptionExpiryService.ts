import subscriptionModel from "./subscriptionModel";
import userModel from "../user/userModel";

const expireEndedSubscriptions = async (): Promise<void> => {
  const now = new Date();

  const expiredSubscriptions = await subscriptionModel.find({
    status: "active",
    plan: "pro",
    endDate: {
      $ne: null,
      $lte: now,
    },
  });

  for (const subscription of expiredSubscriptions) {
    subscription.status = "expired";
    await subscription.save();

    await userModel.findByIdAndUpdate(subscription.user, {
      plan: "free",
    });
  }
};

export default expireEndedSubscriptions;
