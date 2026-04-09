import { Server } from "socket.io";
import { verifyToken } from "../jwt/generateToken.js";
import User from "../models/user.model.js";

let io = null;
const userSockets = new Map();

export const initializeSocket = async (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3001",
      credentials: true,
    },
  });


  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return next(new Error("Invalid token"));
      }

      const user = await User.findById(decoded.userId).select("-password");
      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      socket.userId = user._id;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User ${socket.user.username} connected: ${socket.id}`);
    userSockets.set(socket.userId.toString(), socket.id);

    socket.on("join-project", (projectId) => {
      socket.join(`project:${projectId}`);
      console.log(`User ${socket.user.username} joined project ${projectId}`);

      socket.to(`project:${projectId}`).emit("user-joined", {
        userId: socket.userId,
        username: socket.user.username,
      });
    });

    socket.on("member-added", (data) => {
      io.to(`project:${data.projectId}`).emit("member-added", {
        member: data.member,
        addedBy: socket.user.username,
      });
    });

    socket.on("member-removed", (data) => {
      io.to(`project:${data.projectId}`).emit("member-removed", {
        memberId: data.memberId,
        removedBy: socket.user.username,
      });
    });

    socket.on("leave-project", (projectId) => {
      socket.leave(`project:${projectId}`);
      console.log(`User ${socket.user.username} left project ${projectId}`);
    });

    socket.on("task-created", (data) => {
      io.to(`project:${data.projectId}`).emit("task-created", data.task);
    });

    socket.on("task-updated", (data) => {
      io.to(`project:${data.projectId}`).emit("task-updated", data.task);
    });

    socket.on("task-status-changed", (data) => {
      io.to(`project:${data.projectId}`).emit("task-status-changed", {
        taskId: data.taskId,
        status: data.status,
        updatedBy: socket.user.username,
      });
    });

    socket.on("task-deleted", (data) => {
      io.to(`project:${data.projectId}`).emit("task-deleted", {
        taskId: data.taskId,
        deletedBy: socket.user.username,
      });
    });

    socket.on("disconnect", () => {
      console.log(`User ${socket.user.username} disconnected: ${socket.id}`);
      userSockets.delete(socket.userId.toString());
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
