import { Server } from "socket.io";
import { verifyToken } from "../jwt/generateToken.js";
import User from "../models/user.model.js";

let io = null;
const userSockets = new Map();

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
      methods: ["GET", "POST"],
    },
    // CRITICAL: These options ensure WebSocket works properly
    allowEIO3: true,
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      console.log("Socket auth token received:", !!token);

      if (!token) {
        return next(new Error("Authentication error: No token"));
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return next(new Error("Authentication error: Invalid token"));
      }

      const user = await User.findById(decoded.userId).select("-password");
      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.user = user;
      socket.userId = user._id.toString();
      console.log(`Socket authenticated for user: ${user.username}`);
      next();
    } catch (error) {
      console.error("Socket auth error:", error);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.username}, ID: ${socket.id}`);
    userSockets.set(socket.userId, socket.id);

    // Join project room
    socket.on("join-project", (projectId) => {
      const roomName = `project:${projectId}`;
      socket.join(roomName);
      console.log(`${socket.user.username} joined room: ${roomName}`);

      // Notify others in the room
      socket.to(roomName).emit("user-joined", {
        userId: socket.userId,
        username: socket.user.username,
        message: `${socket.user.username} joined the project`,
      });

      // Send current room members count back to client
      const room = io.sockets.adapter.rooms.get(roomName);
      const memberCount = room ? room.size : 0;
      socket.emit("room-joined", { projectId, memberCount });
    });

    socket.on("leave-project", (projectId) => {
      const roomName = `project:${projectId}`;
      socket.leave(roomName);
      console.log(`${socket.user.username} left room: ${roomName}`);
    });

    // Handle task creation
    socket.on("task-created", (data) => {
      const roomName = `project:${data.projectId}`;
      console.log(`Task created in ${roomName} by ${socket.user.username}`);

      // IMPORTANT: Send to everyone EXCEPT sender
      socket.to(roomName).emit("task-created", data.task);

      // Also send a confirmation back to sender
      socket.emit("task-created-confirm", { success: true, task: data.task });
    });

    // Handle task status change
    socket.on("task-status-changed", (data) => {
      const roomName = `project:${data.projectId}`;
      console.log(
        `Task status changed in ${roomName} by ${socket.user.username}: ${data.taskId} -> ${data.status}`,
      );

      // Broadcast to everyone EXCEPT sender
      socket.to(roomName).emit("task-status-changed", {
        taskId: data.taskId,
        status: data.status,
        updatedBy: socket.user.username,
        timestamp: new Date(),
      });
    });

    // Handle task update
    socket.on("task-updated", (data) => {
      const roomName = `project:${data.projectId}`;
      console.log(`Task updated in ${roomName} by ${socket.user.username}`);
      socket.to(roomName).emit("task-updated", data.task);
    });

    // Handle task deletion
    socket.on("task-deleted", (data) => {
      const roomName = `project:${data.projectId}`;
      console.log(`Task deleted in ${roomName} by ${socket.user.username}`);
      socket.to(roomName).emit("task-deleted", {
        taskId: data.taskId,
        deletedBy: socket.user.username,
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(
        `User disconnected: ${socket.user.username}, ID: ${socket.id}`,
      );
      userSockets.delete(socket.userId);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

export const emitToProject = (projectId, event, data) => {
  if (io) {
    io.to(`project:${projectId}`).emit(event, data);
  }
};
