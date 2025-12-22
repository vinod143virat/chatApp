const { ObjectId } = require("mongodb");
const database = require("../config/database");

class User {
  static async create(userData) {
    const db = database.getDb();
    const now = new Date();

    const user = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      isOnline: false,
      lastSeen: now,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection("users").insertOne(user);
    return { ...user, _id: result.insertedId };
  }

  static async findByEmail(email) {
    const db = database.getDb();
    return await db.collection("users").findOne({ email });
  }

  static async findByUsername(username) {
    const db = database.getDb();
    return await db.collection("users").findOne({ username });
  }

  static async findById(id) {
    const db = database.getDb();
    return await db.collection("users").findOne({ _id: new ObjectId(id) });
  }

  static async findAll(excludeId = null) {
    const db = database.getDb();
    const query = excludeId ? { _id: { $ne: new ObjectId(excludeId) } } : {};

    return await db
      .collection("users")
      .find(query)
      .project({ password: 0 })
      .sort({ username: 1 })
      .toArray();
  }

  static async updateOnlineStatus(userId, isOnline) {
    const db = database.getDb();
    return await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          isOnline,
          lastSeen: new Date(),
          updatedAt: new Date(),
        },
      }
    );
  }

  static async updateLastSeen(userId) {
    const db = database.getDb();
    return await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          lastSeen: new Date(),
          updatedAt: new Date(),
        },
      }
    );
  }
}

module.exports = User;
