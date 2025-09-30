import sendEmail from "../utils/email.js";

export const notifyUser = async ({ userEmail, subject, text, html }) => {
  if (!userEmail) return;
  try {
    await sendEmail({ to: userEmail, subject, text, html });
  } catch (err) {
    console.error("Failed to send email:", err);
  }
};