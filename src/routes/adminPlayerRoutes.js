const express = require("express");
const router = express.Router();

const adminPlayerController = require("../controllers/adminPlayerController");
const { protectAdmin } = require("../middleware/adminAuth");

router.get("/", protectAdmin, adminPlayerController.getPlayers);
router.get("/:id", protectAdmin, adminPlayerController.getPlayerById);
router.patch("/:id/status", protectAdmin, adminPlayerController.updatePlayerStatus);
router.patch("/:id/chips", protectAdmin, adminPlayerController.updatePlayerChips);
router.get("/:id/hands", protectAdmin, adminPlayerController.getPlayerHands);
router.get("/:id/transactions", protectAdmin, adminPlayerController.getPlayerTransactions);

module.exports = router;