import { Role } from "@prisma/client";
import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user || user.isDeleted) {
        return res.status(401).json({ error: "User not found or deleted" });
      }

      req.user = user;
      next();
    } catch (err) {
      console.error(err);
      res.status(401).json({ error: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ error: "No token provided" });
  }
};

// Role check middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "Forbidden: insufficient permissions" });
    }
    next();
  };
};