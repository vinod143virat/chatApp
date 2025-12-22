const { Server } = require("socket.io");
const { verifyToken } = require("../utils/jwt");
const User = require("../models/User");
const chatService = require("../services/chatService");

class SocketService {
  constructor() {
    this.io = null;
    this.userSockets = new Map(); // userId -> socketId
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    this.setupMiddleware();
    this.setupEventHandlers();

    console.log("✓ Socket.IO initialized");
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          return next(new Error("Authentication token required"));
        }

        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId);

        if (!user) {
          return next(new Error("User not found"));
        }

        socket.userId = decoded.userId;
        socket.user = user;
        next();
      } catch (error) {
        next(new Error("Authentication failed"));
      }
    });
  }

  setupEventHandlers() {
    this.io.on("connection", async (socket) => {
      console.log(
        `✓ User connected: ${socket.user.username} (${socket.userId})`
      );

      // Store user socket mapping
      this.userSockets.set(socket.userId, socket.id);

      // Update user online status
      await User.updateOnlineStatus(socket.userId, true);

      // Notify all users about online status
      this.broadcastUserStatus(socket.userId, true);

      // Handle private messages
      socket.on("send_message", async (data) => {
        try {
          const {
            receiverId,
            content,
            attachmentUrl,
            attachmentType,
            attachmentName,
            attachmentSize,
          } = data;

          // Save message to database
          const message = await chatService.sendMessage(
            socket.userId,
            receiverId,
            content,
            attachmentUrl,
            attachmentType,
            attachmentName,
            attachmentSize
          );

          // Send to receiver if online
          const receiverSocketId = this.userSockets.get(receiverId);
          if (receiverSocketId) {
            this.io.to(receiverSocketId).emit("receive_message", {
              _id: message._id,
              senderId: message.senderId,
              receiverId: message.receiverId,
              content: message.content,
              isRead: message.isRead,
              createdAt: message.createdAt,
              attachmentUrl: message.attachmentUrl,
              attachmentType: message.attachmentType,
              attachmentName: message.attachmentName,
              attachmentSize: message.attachmentSize,
            });
          }

          // Confirm to sender
          socket.emit("message_sent", {
            _id: message._id,
            senderId: message.senderId,
            receiverId: message.receiverId,
            content: message.content,
            isRead: message.isRead,
            createdAt: message.createdAt,
            attachmentUrl: message.attachmentUrl,
            attachmentType: message.attachmentType,
            attachmentName: message.attachmentName,
            attachmentSize: message.attachmentSize,
          });
        } catch (error) {
          socket.emit("error", { message: error.message });
        }
      });

      // Handle typing indicator
      socket.on("typing", (data) => {
        const { receiverId, isTyping } = data;
        const receiverSocketId = this.userSockets.get(receiverId);

        if (receiverSocketId) {
          this.io.to(receiverSocketId).emit("user_typing", {
            userId: socket.userId,
            username: socket.user.username,
            isTyping,
          });
        }
      });

      // Handle disconnection
      socket.on("disconnect", async () => {
        console.log(
          `✗ User disconnected: ${socket.user.username} (${socket.userId})`
        );

        // Remove from socket mapping
        this.userSockets.delete(socket.userId);

        // Update user offline status
        await User.updateOnlineStatus(socket.userId, false);

        // Notify all users about offline status
        this.broadcastUserStatus(socket.userId, false);
      });
    });
  }

  broadcastUserStatus(userId, isOnline) {
    this.io.emit("user_status_changed", {
      userId,
      isOnline,
      timestamp: new Date(),
    });
  }

  getIO() {
    if (!this.io) {
      throw new Error("Socket.IO not initialized");
    }
    return this.io;
  }
}

module.exports = new SocketService();
