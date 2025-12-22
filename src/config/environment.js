const path = require("path");

// Load environment variables from .env file
const loadEnv = () => {
  try {
    const envPath = path.join(__dirname, "../../.env");
    const fs = require("fs");

    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      const lines = envContent.split("\n");

      lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith("#")) {
          const [key, ...valueParts] = trimmedLine.split("=");
          const value = valueParts.join("=").trim();
          if (key && value) {
            process.env[key.trim()] = value;
          }
        }
      });
    }
  } catch (error) {
    console.warn("Warning: Could not load .env file:", error.message);
  }
};

loadEnv();

const config = {
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/techchat",
  jwtSecret: process.env.JWT_SECRET || "default_secret_change_in_production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  nodeEnv: process.env.NODE_ENV || "development",
  baseUrl: process.env.BASE_URL || "http://10.0.2.2:3000",
};

module.exports = config;
