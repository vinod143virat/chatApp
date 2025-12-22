const express = require("express");
const { createServer } = require("http");
const cors = require("cors");
const path = require("path");
const config = require("./config/environment");
const database = require("./config/database");
const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const socketService = require("./socket/socketService");

class Server {
  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // CORS
    this.app.use(
      cors({
        origin: "*",
        credentials: true,
      })
    );

    // Body parser
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Serve static files from uploads directory
    this.app.use(
      "/uploads",
      express.static(path.join(__dirname, "../uploads"))
    );

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    this.app.use("/api", routes);

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({ error: "Route not found" });
    });
  }

  setupErrorHandling() {
    this.app.use(errorHandler);
  }

  async start() {
    try {
      // Connect to database
      await database.connect();

      // Initialize Socket.IO
      socketService.initialize(this.httpServer);

      // Start server
      this.httpServer.listen(config.port, () => {
        console.log(`
╔════════════════════════════════════════╗
║                                        ║
║     🚀 TechChat Server Running         ║
║                                        ║
║     Port: ${config.port}                        ║
║     Environment: ${config.nodeEnv}      ║
║     MongoDB: Connected                 ║
║     Socket.IO: Active                  ║
║                                        ║
╚════════════════════════════════════════╝
        `);
      });

      // Graceful shutdown
      process.on("SIGTERM", () => this.shutdown());
      process.on("SIGINT", () => this.shutdown());
    } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
  }

  async shutdown() {
    console.log("\nShutting down gracefully...");

    this.httpServer.close(async () => {
      await database.close();
      console.log("Server closed");
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error("Forcing shutdown...");
      process.exit(1);
    }, 10000);
  }
}

// Start the server
const server = new Server();
server.start();

module.exports = server;
