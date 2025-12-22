const express = require("express");
const chatController = require("../controllers/chatController");
const authMiddleware = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get("/users", chatController.getUsers.bind(chatController));
router.get(
  "/conversation/:userId",
  chatController.getConversation.bind(chatController)
);
router.put(
  "/messages/:userId/read",
  chatController.markAsRead.bind(chatController)
);
router.get("/unread", chatController.getUnreadCount.bind(chatController));
router.post(
  "/upload",
  upload.single("attachment"),
  chatController.uploadAttachment.bind(chatController)
);

module.exports = router;
