// utils/notificationService.js
export const sendNotification = async (email, product) => {
  console.log(
    `📢 Sent price drop notification to ${email} for ${product.name}`
  );
  // I'mma plug in Nodemailer or an SMS API here later.
};
