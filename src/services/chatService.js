const User = require("../models/User");
const Message = require("../models/Message");
const config = require("../config/environment");

class ChatService {
  async getAllUsers(currentUserId) {
    const users = await User.findAll(currentUserId);
    return users;
  }

  async getConversation(userId, otherUserId, limit = 50) {
    const messages = await Message.getConversation(userId, otherUserId, limit);

    // Convert relative URLs to full URLs
    const messagesWithFullUrls = messages.map((msg) => {
      if (msg.attachmentUrl && !msg.attachmentUrl.startsWith("http")) {
        return {
          ...msg,
          attachmentUrl: `${config.baseUrl}${msg.attachmentUrl}`,
        };
      }
      return msg;
    });

    // Reverse to get chronological order
    return messagesWithFullUrls.reverse();
  }

  async sendMessage(
    senderId,
    receiverId,
    content,
    attachmentUrl,
    attachmentType,
    attachmentName,
    attachmentSize
  ) {
    if ((!content || content.trim().length === 0) && !attachmentUrl) {
      throw new Error("Message must contain either content or an attachment");
    }

    const messageData = {
      senderId,
      receiverId,
      content: content ? content.trim() : "",
    };

    // Add attachment data if provided
    if (attachmentUrl) {
      messageData.attachmentUrl = attachmentUrl;
      messageData.attachmentType = attachmentType;
      messageData.attachmentName = attachmentName;
      messageData.attachmentSize = attachmentSize;
    }

    const message = await Message.create(messageData);

    return message;
  }

  async markMessagesAsRead(senderId, receiverId) {
    await Message.markConversationAsRead(senderId, receiverId);
    return { message: "Messages marked as read" };
  }

  async getUnreadCount(userId) {
    const count = await Message.getUnreadCount(userId);
    return { count };
  }
}

module.exports = new ChatService();
