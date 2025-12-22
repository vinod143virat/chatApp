const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/register", authController.register.bind(authController));
router.post("/login", authController.login.bind(authController));
router.post(
  "/logout",
  authMiddleware,
  authController.logout.bind(authController)
);
router.get(
  "/me",
  authMiddleware,
  authController.getCurrentUser.bind(authController)
);

module.exports = router;
