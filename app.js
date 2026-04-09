import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import dotenv from "dotenv";
import connectDB from "./src/config/database.js";
import { initRedis } from "./src/config/redis.js";
import { initializeSocket } from "./src/sockets/socketManager.js";
import errorHandler from "./src/middleware/errorHandler.js";
import authRoutes from "./src/routes/auth.route.js";
import projectRoutes from "./src/routes/project.route.js";
import taskRoutes from "./src/routes/task.route.js";
import userRoutes from "./src/routes/user.route.js";
import path from "path";

dotenv.config();

const app = express();
const server = createServer(app);

const isProd = process.env.NODE_ENV === "production";

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use("/api", limiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api", userRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// Error handling
app.use(errorHandler);

// Initialize services
const startServer = async () => {
  try {
    await connectDB();
    // await initRedis();
    initializeSocket(server);

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export { app, server };
