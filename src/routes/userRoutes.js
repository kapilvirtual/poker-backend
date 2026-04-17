const express = require("express");
const router = express.Router();
const { createTestUser, getAllUsers } = require("../controllers/userController");

router.post("/test-user", createTestUser);
router.get("/", getAllUsers);

module.exports = router;