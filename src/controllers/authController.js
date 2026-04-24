const User = require("../models/User");
const generateUserToken = require("../utils/generateUserToken");
const {
  FirebaseAdminConfigurationError,
  FirebaseTokenVerificationError,
  verifyFirebaseIdToken,
} = require("../utils/verifyFirebaseIdToken");

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  chips: user.chips,
  walletBalance: user.walletBalance,
  status: user.status,
  isOnline: user.isOnline,
  lastLoginAt: user.lastLoginAt,
  avatar: user.avatar,
});

const sendAuthResponse = (res, statusCode, message, user) => {
  return res.status(statusCode).json({
    message,
    token: generateUserToken(user),
    user: serializeUser(user),
  });
};

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
      isOnline: true,
      lastLoginAt: new Date(),
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone?.trim() || "",
    });

    return sendAuthResponse(res, 201, "Registration successful", user);
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

    return sendAuthResponse(res, 200, "Login successful", user);
  } catch (error) {
    return res.status(500).json({
      message: "Error during login",
      error: error.message,
    });
  }
};

const authenticateWithGoogle = async (req, res) => {
  try {
    const { idToken } = req.body;
    const googleProfile = await verifyFirebaseIdToken(idToken);

    let user = await User.findOne({
      $or: [
        { firebaseUid: googleProfile.firebaseUid },
        ...(googleProfile.googleId ? [{ googleId: googleProfile.googleId }] : []),
        { email: googleProfile.email },
      ],
    });

    if (
      user &&
      user.firebaseUid &&
      user.firebaseUid !== googleProfile.firebaseUid
    ) {
      return res.status(409).json({
        message: "A different Firebase account is already linked to this email",
      });
    }

    if (
      user &&
      user.googleId &&
      googleProfile.googleId &&
      user.googleId !== googleProfile.googleId
    ) {
      return res.status(409).json({
        message: "A different Google account is already linked to this email",
      });
    }

    if (user && (user.isBlocked || user.status === "blocked")) {
      return res.status(403).json({
        message: "Your account is blocked",
      });
    }

    if (!user) {
      user = await User.create({
        avatar: googleProfile.avatar,
        email: googleProfile.email,
        firebaseUid: googleProfile.firebaseUid,
        isOnline: true,
        lastLoginAt: new Date(),
        name: googleProfile.name,
        phone: "",
        ...(googleProfile.googleId ? { googleId: googleProfile.googleId } : {}),
      });

      return sendAuthResponse(res, 201, "Google registration successful", user);
    }

    const wasAlreadyLinked = Boolean(user.firebaseUid || user.googleId);

    user.firebaseUid = user.firebaseUid || googleProfile.firebaseUid;
    user.lastLoginAt = new Date();
    user.isOnline = true;

    if (!user.googleId && googleProfile.googleId) {
      user.googleId = googleProfile.googleId;
    }

    if (!user.avatar && googleProfile.avatar) {
      user.avatar = googleProfile.avatar;
    }

    if (!user.name && googleProfile.name) {
      user.name = googleProfile.name;
    }

    await user.save();

    return sendAuthResponse(
      res,
      200,
      wasAlreadyLinked
        ? "Google login successful"
        : "Google account linked and login successful",
      user
    );
  } catch (error) {
    if (error instanceof FirebaseAdminConfigurationError) {
      return res.status(500).json({
        message: error.message,
      });
    }

    if (error instanceof FirebaseTokenVerificationError) {
      return res.status(401).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Error during Google authentication",
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
  authenticateWithGoogle,
  registerUser,
  loginUser,
  getMe,
  logoutUser,
};
