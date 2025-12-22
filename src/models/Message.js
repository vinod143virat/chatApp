const { ObjectId } = require("mongodb");
const database = require("../config/database");

class Message {
  static async create(messageData) {
    const db = database.getDb();
    const now = new Date();

    const message = {
      senderId: new ObjectId(messageData.senderId),
      receiverId: new ObjectId(messageData.receiverId),
      content: messageData.content,
      isRead: false,
      createdAt: now,
      updatedAt: now,
      // Attachment fields
      attachmentUrl: messageData.attachmentUrl || null,
      attachmentType: messageData.attachmentType || null,
      attachmentName: messageData.attachmentName || null,
      attachmentSize: messageData.attachmentSize || null,
    };

    const result = await db.collection("messages").insertOne(message);
    return { ...message, _id: result.insertedId };
  }

  static async getConversation(userId1, userId2, limit = 50) {
    const db = database.getDb();

    return await db
      .collection("messages")
      .find({
        $or: [
          {
            senderId: new ObjectId(userId1),
            receiverId: new ObjectId(userId2),
          },
          {
            senderId: new ObjectId(userId2),
            receiverId: new ObjectId(userId1),
          },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }

  static async markAsRead(messageId) {
    const db = database.getDb();
    return await db.collection("messages").updateOne(
      { _id: new ObjectId(messageId) },
      {
        $set: {
          isRead: true,
          updatedAt: new Date(),
        },
      }
    );
  }

  static async markConversationAsRead(senderId, receiverId) {
    const db = database.getDb();
    return await db.collection("messages").updateMany(
      {
        senderId: new ObjectId(senderId),
        receiverId: new ObjectId(receiverId),
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          updatedAt: new Date(),
        },
      }
    );
  }

  static async getUnreadCount(userId) {
    const db = database.getDb();
    return await db.collection("messages").countDocuments({
      receiverId: new ObjectId(userId),
      isRead: false,
    });
  }
}

module.exports = Message;
