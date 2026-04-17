const express = require("express");
const router = express.Router();

const {
  createTable,
  getTables,
  getTableById,
  updateTableStatus,
  updateTableConfig,
  removePlayerFromTable,
} = require("../controllers/adminTableController");

const { protectAdmin } = require("../middleware/adminAuth");

router.post("/", protectAdmin, createTable);
router.get("/", protectAdmin, getTables);
router.get("/:id", protectAdmin, getTableById);
router.patch("/:id/status", protectAdmin, updateTableStatus);
router.patch("/:id/config", protectAdmin, updateTableConfig);
router.post("/:id/remove-player", protectAdmin, removePlayerFromTable);

module.exports = router;