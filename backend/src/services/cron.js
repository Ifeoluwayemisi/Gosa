import cron from "node-cron";
import { checkWishlistUpdates } from "./wishlistWatcher.js";

cron.schedule("0 * * * *", async () => {
  console.log("Cron job started: Checking wishlist updates...");
  try {
    await checkWishlistUpdates();
  } catch (err) {
    console.error("Error in wishlist cron job:", err);
  }
  console.log("Cron job finished.");
});
