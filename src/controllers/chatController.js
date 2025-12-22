const chatService = require("../services/chatService");
const config = require("../config/environment");

class ChatController {
  async getUsers(req, res, next) {
    try {
      const users = await chatService.getAllUsers(req.userId);
      res.status(200).json({ users });
    } catch (error) {
      next(error);
    }
  }

  async getConversation(req, res, next) {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit) || 50;
      const messages = await chatService.getConversation(
        req.userId,
        userId,
        limit
      );
      res.status(200).json({ messages });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const { userId } = req.params;
      const result = await chatService.markMessagesAsRead(userId, req.userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req, res, next) {
    try {
      const result = await chatService.getUnreadCount(req.userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async uploadAttachment(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileUrl = `${config.baseUrl}/uploads/${req.file.filename}`;
      const fileData = {
        url: fileUrl,
        type: req.file.mimetype,
        name: req.file.originalname,
        size: req.file.size,
      };

      res.status(200).json({ attachment: fileData });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ChatController();
