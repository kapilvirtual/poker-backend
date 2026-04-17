const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
} = require("../controllers/authController");

const { protectUser } = require("../middleware/auth");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protectUser, getMe);
router.post("/logout", protectUser, logoutUser);

module.exports = router;