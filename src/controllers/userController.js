import prisma from "../config/prisma.js";

export const completeProfile = async (req, res) => {
  try {
    const { phone, address } = req.body;
    const userId = req.user.id;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { phone, address, profileComplete: true },
    });

    res.json({ message: "Profile completed!", user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};
