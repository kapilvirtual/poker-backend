const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
} = require("../controllers/authController");

const { protectUser } = require("../middleware/auth");
const {
  validateRequest,
  validateRequestWithAuth,
} = require("../middleware/validateRequest");

const {
  registerUserRules,
  loginUserRules,
} = require("../validators/authValidators");

router.post("/register", ...validateRequest(registerUserRules), registerUser);
router.post("/login", ...validateRequest(loginUserRules), loginUser);
router.get("/me", ...validateRequestWithAuth(protectUser), getMe);
router.post("/logout", ...validateRequestWithAuth(protectUser), logoutUser);

module.exports = router;