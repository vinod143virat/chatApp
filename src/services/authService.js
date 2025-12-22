const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { generateToken } = require("../utils/jwt");

class AuthService {
  async register(userData) {
    const { username, email, password } = userData;

    // Validate input
    if (!username || !email || !password) {
      throw new Error("All fields are required");
    }

    // Check if user already exists
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      throw new Error("Email already registered");
    }

    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      throw new Error("Username already taken");
    }

    // Validate password strength
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Generate token
    const token = generateToken(user._id.toString());

    // Remove password from response
    delete user.password;

    return { user, token };
  }

  async login(email, password) {
    // Validate input
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // Update online status
    await User.updateOnlineStatus(user._id.toString(), true);

    // Generate token
    const token = generateToken(user._id.toString());

    // Remove password from response
    delete user.password;

    return { user, token };
  }

  async logout(userId) {
    await User.updateOnlineStatus(userId, false);
    return { message: "Logged out successfully" };
  }

  async getCurrentUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    delete user.password;
    return user;
  }
}

module.exports = new AuthService();
