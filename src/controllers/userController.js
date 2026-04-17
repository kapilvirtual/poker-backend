const User = require("../models/User");

const createTestUser = async (req, res) => {
  try {
    const testUser = await User.create({
      name: "Kapil Test User",
      email: `kapil${Date.now()}@example.com`,
      password: "123456",
      chips: 1000,
      walletBalance: 0,
    });

    res.status(201).json({
      message: "Test user created successfully",
      user: testUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating test user",
      error: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      message: "Users fetched successfully",
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching users",
      error: error.message,
    });
  }
};

module.exports = {
  createTestUser,
  getAllUsers,
};