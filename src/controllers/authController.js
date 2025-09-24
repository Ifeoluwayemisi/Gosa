import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import { generateToken } from "../utils/generateToken.js";
import jwt from "jsonwebtoken";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);

//Register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) return res.status(400).json({ message: "User exists" });

    const hashedPassword = await bcrypt.hash(password, 7);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: "CUSTOMER" },
    });

    const token = generateToken(user);
    res.json({
      message: "Registration successful. Welcome onboard",
      token,
      user,
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
    if (!user) {
      return res.status(401).json({ error: "Invalid Login Details" });
    }

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user);

    // to remove sensitive fields
    const { password: _, ...safeUser } = user;

    res.json({
      message: `Welcome back ${user.name}`,
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
};


// GOOGLE AUTH
export const googleLogin = async (req, res) => {
  const url = client.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"],
  });
  res.redirect(url);
};

// callback
// export const googleCallback = async (req, res) => {
//   try {
//     const { code } = req.query;

//     const { tokens } = await client.getToken(code);
//     client.setCredentials(tokens);

//     // verify id token
//     const ticket = await client.verifyIdToken({
//       idToken: tokens.id_token,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayLoad();
//     const { sub: googleId, email, name, picture } = payload;

//     // check if user exists
//     let user = await prisma.user.findUnique({ where: { email } });

//     if (!user) {
//       user = await prisma.user.create({
//         data: {
//           email,
//           name,
//           googleId,
//           avatar: picture,
//           profileComplete: false,
//         },
//       });
//     }


//     // to generate app token
//     const appToken = jwt.sign(
//       { id: user.id, email: user.email },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     if (!user.profileComplete) {
//       return res.redirect(
//         `http://localhost:3000/complete-profile?token=${token}`
//       );
//     }

//     // redirect to frontend with the token
//     res.redirect(`http://localhost:3000/dashboard?token=${appToken}`);
//   } catch (err) {
//     console.error("Google auth error:", err);
//     res.status(500).json({ err: "Authentication failed" });
//   }
// };

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);

export const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res
        .status(400)
        .json({ status: "error", message: "Missing Google code" });
    }

    // Exchange code for tokens
    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);

    // Verify ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          googleId,
          avatar: picture,
          role: "CUSTOMER",
        },
      });
    }

    // Check profile completeness
    const isProfileComplete = user.name && user.phone && user.address;

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      status: "success",
      message: "Google authentication successful",
      token,
      user,
      needsProfile: !isProfileComplete,
    });
  } catch (error) {
    console.error("Google auth error:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Google authentication failed",
    });
  }
};
