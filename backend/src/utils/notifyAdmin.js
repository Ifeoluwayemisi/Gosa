import prisma from "../config/prisma.js";
import sendEmail from "./email.js";

export const notifyAdmin = async ({ subject, text, html }) => {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", isDeleted: false },
  });

  for (let admin of admins) {
    await sendEmail({
      to: admin.email,
      subject,
      text,
      html,
    });
  }
};
