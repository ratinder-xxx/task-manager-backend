import User from "../models/user.model.js";
import { generateToken } from "../jwt/generateToken.js";

export const registerUser = async (userData) => {
  const existingUser = await User.findOne({ 
    $or: [{ email: userData.email }, { username: userData.username }] 
  });
  
  if (existingUser) {
    throw new Error("User already exists");
  }

  const user = new User(userData);
  await user.save();
  
  const token = generateToken(user._id);
  return { 
    user: { 
      id: user._id, 
      username: user.username, 
      email: user.email, 
      role: user.role 
    }, 
    token 
  };
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user._id);
  return { 
    user: { 
      id: user._id, 
      username: user.username, 
      email: user.email, 
      role: user.role 
    }, 
    token 
  };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};