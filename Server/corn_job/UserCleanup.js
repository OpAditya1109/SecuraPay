const cron = require("node-cron");
const User = require("../models/User"); 
const mongoose = require("mongoose");




cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Running cleanup cron job for unverified users...");

    const timeLimit = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    // Find users who have been created more than 24 hours ago and are not verified
    const expiredUsers = await User.deleteMany({
      isVerified: false,
      createdAt: { $lt: new Date(Date.now() - timeLimit) }, // 24 hours before now
    });

    console.log(`Deleted ${expiredUsers.deletedCount} unverified users.`);
  } catch (error) {
    console.error("Error during cron job:", error);
  }
});
