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

      // Log connection attempt (without exposing credentials)
      const sanitizedUri = uri.replace(
        /\/\/([^:]+):([^@]+)@/,
        "//*****:*****@"
      );
      console.log(`Attempting to connect to MongoDB: ${sanitizedUri}`);

      // MongoDB connection options with TLS configuration
      const options = {
        maxPoolSize: 10,
        minPoolSize: 5,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
      };

      // Add TLS options for MongoDB Atlas connections
      if (uri.includes("mongodb.net") || uri.includes("mongodb+srv")) {
        options.tls = true;
        options.tlsAllowInvalidCertificates = false;
        options.tlsAllowInvalidHostnames = false;
        console.log("Using TLS/SSL for MongoDB Atlas connection");
      }

      this.client = new MongoClient(uri, options);

      console.log("Connecting to MongoDB...");
      await this.client.connect();

      console.log("Connection established, selecting database...");
      this.db = this.client.db();

      console.log("✓ MongoDB connected successfully");

      // Create indexes
      await this.createIndexes();

      return this.db;
    } catch (error) {
      console.error("✗ MongoDB connection error:", error.message);
      console.error("Error details:", {
        name: error.name,
        code: error.code,
        cause: error.cause?.message,
      });

      // Provide helpful error messages
      if (
        error.message.includes("ENOTFOUND") ||
        error.message.includes("ETIMEDOUT")
      ) {
        console.error(
          "Network error: Unable to reach MongoDB server. Check your connection string and network settings."
        );
      } else if (error.message.includes("Authentication failed")) {
        console.error(
          "Authentication error: Check your MongoDB username and password."
        );
      } else if (
        error.message.includes("tlsv1 alert") ||
        error.message.includes("SSL")
      ) {
        console.error(
          "TLS/SSL error: MongoDB connection requires proper TLS configuration."
        );
        console.error(
          "Ensure your MongoDB URI uses mongodb+srv:// for Atlas connections."
        );
      }

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
