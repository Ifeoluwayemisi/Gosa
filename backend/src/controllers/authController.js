import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import { generateToken } from "../utils/generateToken.js";
import jwt from "jsonwebtoken";
import { sendTemplateEmail } from "../utils/sendTemplate.js";
import { notifyAdmin } from "../utils/notifyAdmin.js";
import { logActivity } from "../utils/activityLogger.js";
import crypto from "crypto";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) return res.status(400).json({ message: "User exists" });

    const hashedPassword = await bcrypt.hash(password, 7);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: "CUSTOMER" },
    });

    // Send welcome email (HTML template)
    await sendTemplateEmail({
      to: user.email,
      subject: "Welcome to GOSA! 🎉",
      templateName: "welcome.html",
      variables: {
        name: user.name,
        loginUrl: "https://gosa.com/login", // update to your frontend
      },
    });

    // Notify admin
    await notifyAdmin({
      subject: "New User Registered",
      text: `User ${user.name} (${user.email}) has just registered.`,
    });

    const token = generateToken(user);
    res.json({
      message: "Registration successful. Welcome onboard",
      token,
      user: { ...user, password: undefined },
    });
    await logActivity(user.id, "REGISTER", { ip: req.ip });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed" });
  }

};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid login details" });

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = generateToken(user);

    res.json({
      message: `Welcome back ${user.name}`,
      token,
      user: { ...user, password: undefined },
    });
    await logActivity(user.id, "LOGIN", { ip: req.ip });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
};

// google auth
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);

// Step 1: Redirect user to Google login
export const googleLogin = (req, res) => {
  const url = googleClient.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"],
  });
  res.redirect(url);
};

// Step 2: Handle callback from Google
export const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ message: "Missing Google code" });

    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: { email, name, googleId, avatar: picture, role: "CUSTOMER" },
      });

      // Send welcome email
      await sendTemplateEmail({
        to: user.email,
        subject: "Welcome to GOSA! 🎉",
        templateName: "welcome.html",
        variables: { name: user.name, loginUrl: "https://gosa.com/login" },
      });

      // Notify admin
      await notifyAdmin({
        subject: "New Google User Registered",
        text: `User ${user.name} (${user.email}) registered via Google.`,
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const isProfileComplete = user.name && user.phone && user.address;

    if (!isProfileComplete) {
      return res.redirect(
        `http://localhost:3000/complete-profile?token=${token}`
      );
    }

    return res.redirect(`http://localhost:3000/dashboard?token=${token}`);
  } catch (error) {
    console.error("Google auth error:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Google authentication failed",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const resetEntry = await prisma.passwordReset.findUnique({
      where: { token },
    });
    if (!resetEntry || resetEntry.used)
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });

    if (resetEntry.expiresAt < new Date())
      return res
        .status(400)
        .json({ success: false, message: "Reset token expired" });

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: resetEntry.userId },
      data: { password: hashed },
    });

    await prisma.passwordReset.update({
      where: { id: resetEntry.id },
      data: { used: true },
    });

    await logActivity(resetEntry.userId, "RESET_PASSWORD", { ip: req.ip });

    res.json({
      success: true,
      message: "Password reset successfully. You may now log in.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Password reset failed" });
  }
};

// Get Login Activity
export const getLoginActivity = async (req, res) => {
  try {
    const logs = await prisma.activity.findMany({
      where: { userId: req.user.id, type: "LOGIN" },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    res.json({ success: true, logs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch login activity" });
  }
};

// Logout All Devices
export const logoutAllDevices = async (req, res) => {
  try {
    // Invalidate by rotating a secret field (optional strategy)
    const newTokenVersion = Date.now().toString();
    await prisma.user.update({
      where: { id: req.user.id },
      data: { tokenVersion: newTokenVersion },
    });

    await logActivity(req.user.id, "LOGOUT_ALL", { ip: req.ip });
    res.json({ success: true, message: "Logged out from all devices" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to log out all devices" });
  }
};


export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "No account found with that email" });

    // generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await prisma.passwordReset.create({
      data: { userId: user.id, token, expiresAt },
    });

    const resetUrl = `https://gosa.com/reset-password?token=${token}`;

    await sendTemplateEmail({
      to: email,
      subject: "Password Reset Request 🔒",
      templateName: "reset.html",
      variables: { name: user.name, resetUrl },
    });

    await logActivity(user.id, "FORGOT_PASSWORD", { ip: req.ip });

    res.json({ success: true, message: "Reset link sent to your email" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to send reset link" });
  }
};
