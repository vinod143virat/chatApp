const express = require("express");
const authRoutes = require("./authRoutes");
const chatRoutes = require("./chatRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/chat", chatRoutes);

// Health check
router.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

module.exports = router;
