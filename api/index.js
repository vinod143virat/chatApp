const express = require("express");
const cors = require("cors");
const path = require("path");
const routes = require("../src/routes");
const errorHandler = require("../src/middleware/errorHandler");
const database = require("../src/config/database");

const app = express();

// CORS
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "TechChat API is running",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api", routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use(errorHandler);

// Database connection middleware
let dbConnected = false;

const connectDB = async () => {
  if (!dbConnected) {
    try {
      await database.connect();
      dbConnected = true;
      console.log("Database connected");
    } catch (error) {
      console.error("Database connection error:", error);
      // Don't throw - let the app continue but log the error
    }
  }
};

// Ensure DB connection before handling requests
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Export for Vercel
module.exports = app;
