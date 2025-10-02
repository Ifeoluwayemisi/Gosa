import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import { generateToken } from "../utils/generateToken.js";
import jwt from "jsonwebtoken";
import { sendTemplateEmail } from "../utils/sendTemplate.js";
import { notifyAdmin } from "../utils/notifyAdmin.js";

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
