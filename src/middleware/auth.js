import User from "../models/user.model.js";
import { verifyToken } from "../jwt/generateToken.js";

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.jwt || req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ error: "Please authenticate" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    console.log("Auth error:", error.message);
    res.status(401).json({ error: "Please authenticate" });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
};