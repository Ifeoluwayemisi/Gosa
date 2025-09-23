import prisma from "../config/prisma";
import bcrypt from "bcrypt";
import { OAuth2Client, OAuth2Client } from "google-auth-library";
import { generateToken } from "../utils/generateToken";

const OAuth2Client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

//Register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ message: "User exists" });

    const hash = await bcrypt.hash(password, 7);
    const user = await prisma.user.create({
      data: { name, email, password: hash, role: "CUSTOMER" },
    });

    const token = generateToken(user);
    res.json({
      message: "Registration successful. Welcome onboard",
      token,
      user,
    });
  } catch (err) {
    console.error(error, "invalid registration");
    res.status(500).json({ message: err.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalig Login details" });

    const token = generateToken(user);
    res.json({ message: "Welcome back `${name}`", token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { tokenId } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idtoken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, name } = ticket.getPayLoad();

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { name, email, password: "", role: "CUSTOMER" },
      });
    }

    const token = generateToken(user);
    res.json({ message: "Login Successful", token, user });
  } catch (err) {
    res.status(500).json({ message: "Google Login Failed", err, message });
  }
};
