import prisma from "../config/prisma.js";


export const completeProfile = async (req, res) => {
  try {
    const { phone, address } = req.body;
    const userId = req.user.id;

    // check if already completed
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user.profileComplete) {
      return res.status(400).json({ error: "Profile already completed." });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        phone,
        address,
        profileComplete: true,
      },
    });

    res.json({
      message: "Profile completed!",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        profileComplete: updatedUser.profileComplete,
      },
    });
  } catch (err) {
    console.error("Complete profile error:", err);
    res.status(500).json({ error: "Failed to complete profile" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { phone, address, name } = req.body;
    const userId = req.user.id;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(phone && { phone }),
        ...(address && { address }),
        ...(name && { name }),
      },
    });

    res.json({
      message: "Profile updated!",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        address: updatedUser.address,
        profileComplete: updatedUser.profileComplete,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Failed to update user profile" });
  }
};