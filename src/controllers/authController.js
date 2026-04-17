const User = require("../models/User");
const generateUserToken = require("../utils/generateUserToken");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists with this email",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone || "",
    });

    return res.status(201).json({
      message: "Registration successful",
      token: generateUserToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        chips: user.chips,
        walletBalance: user.walletBalance,
        status: user.status,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error during registration",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (user.isBlocked || user.status === "blocked") {
      return res.status(403).json({
        message: "Your account is blocked",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    user.lastLoginAt = new Date();
    user.isOnline = true;
    await user.save();

    return res.status(200).json({
      message: "Login successful",
      token: generateUserToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        chips: user.chips,
        walletBalance: user.walletBalance,
        status: user.status,
        isOnline: user.isOnline,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error during login",
      error: error.message,
    });
  }
};

const getMe = async (req, res) => {
  return res.status(200).json({
    user: req.user,
  });
};

const logoutUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      isOnline: false,
    });

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error during logout",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
};