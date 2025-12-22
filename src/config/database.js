const { MongoClient } = require("mongodb");

class Database {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      const uri =
        process.env.MONGODB_URI || "mongodb://localhost:27017/techchat";

      this.client = new MongoClient(uri, {
        maxPoolSize: 10,
        minPoolSize: 5,
      });

      await this.client.connect();
      this.db = this.client.db();

      console.log("✓ MongoDB connected successfully");

      // Create indexes
      await this.createIndexes();

      return this.db;
    } catch (error) {
      console.error("✗ MongoDB connection error:", error);
      process.exit(1);
    }
  }

  async createIndexes() {
    try {
      // Users collection indexes
      await this.db
        .collection("users")
        .createIndex({ email: 1 }, { unique: true });
      await this.db
        .collection("users")
        .createIndex({ username: 1 }, { unique: true });

      // Messages collection indexes
      await this.db
        .collection("messages")
        .createIndex({ senderId: 1, receiverId: 1 });
      await this.db.collection("messages").createIndex({ createdAt: -1 });

      console.log("✓ Database indexes created");
    } catch (error) {
      console.error("✗ Error creating indexes:", error);
    }
  }

  getDb() {
    if (!this.db) {
      throw new Error("Database not initialized. Call connect() first.");
    }
    return this.db;
  }

  async close() {
    if (this.client) {
      await this.client.close();
      console.log("✓ MongoDB connection closed");
    }
  }
}

module.exports = new Database();
