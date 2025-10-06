import prisma from "../config/prisma.js";
import multer from "multer";
import fs from "fs";
import path from "path";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ---------------- Multer setup ----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    cb(null, `${req.user.id}_${Date.now()}.${ext}`);
  },
});

export const uploadProfileImage = multer({ storage }).single("profileImage");

// ---------------- Complete Profile (1-time only) ----------------
export const completeProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, addresses } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { addresses: true },
    });

    if (!user) return res.status(404).json({ error: "User not found." });

    // 🚫 Prevent completing profile twice
    if (user.profileComplete) {
      return res.status(403).json({
        error:
          "Profile already completed. Please log in and use the update route instead.",
      });
    }

    // ✅ Validate required fields
    if (!name || !phone || !addresses) {
      return res
        .status(400)
        .json({
          error: "All fields (name, phone, addresses, and image) are required.",
        });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Please upload a profile image." });
    }

    // ✅ Parse address
    let addressObj;
    try {
      addressObj =
        typeof addresses === "string" ? JSON.parse(addresses) : addresses;
    } catch {
      return res.status(400).json({ error: "Invalid address format." });
    }

    const profileImage = `/uploads/${req.file.filename}`;

    // ✅ Create the address + mark profile complete
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone,
        profileImage,
        profileComplete: true,
        addresses: {
          create: { ...addressObj },
        },
      },
      include: { addresses: true },
    });

    res.json({
      message: "Profile completed successfully!",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Complete profile error:", err);
    res.status(500).json({ error: "Failed to complete profile." });
  }
};

// ---------------- Update Profile ----------------
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { phone, name, addresses } = req.body;

    // ✅ Handle new profile image if uploaded
    let profileImage;
    if (req.file) {
      profileImage = `/uploads/${req.file.filename}`;
    }

    // ✅ Parse and merge addresses
    let parsedAddresses;
    if (addresses) {
      try {
        parsedAddresses = JSON.parse(addresses);
        if (!Array.isArray(parsedAddresses))
          return res.status(400).json({ error: "Addresses must be an array." });
      } catch {
        return res.status(400).json({ error: "Invalid address format." });
      }
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existingUser) return res.status(404).json({ error: "User not found" });

    let updatedAddresses = existingUser.addresses || [];
    if (parsedAddresses) {
      updatedAddresses = [
        ...new Set([...updatedAddresses, ...parsedAddresses]),
      ];
    }

    // ✅ Update user info
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(phone && { phone }),
        ...(name && { name }),
        ...(profileImage && { profileImage }),
        addresses: updatedAddresses,
      },
    });

    res.json({
      message: "Profile updated!",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Failed to update user profile" });
  }
};
