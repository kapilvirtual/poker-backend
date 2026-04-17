const mongoose = require("mongoose");

const tablePlayerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seatNumber: {
      type: Number,
      required: true,
    },
    chipsOnTable: {
      type: Number,
      default: 0,
    },
    isDealer: {
      type: Boolean,
      default: false,
    },
    isFolded: {
      type: Boolean,
      default: false,
    },
    isAllIn: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const gameTableSchema = new mongoose.Schema(
  {
    tableName: {
      type: String,
      required: true,
      trim: true,
    },
    gameType: {
      type: String,
      enum: ["7/27", "55 Little Red", "357"],
      required: true,
    },
    status: {
      type: String,
      enum: ["waiting", "active", "paused", "closed"],
      default: "waiting",
    },
    maxPlayers: {
      type: Number,
      default: 6,
      min: 2,
      max: 10,
    },
    ante: {
      type: Number,
      default: 0,
    },
    smallBlind: {
      type: Number,
      default: 0,
    },
    bigBlind: {
      type: Number,
      default: 0,
    },
    currentPot: {
      type: Number,
      default: 0,
    },
    currentTurnSeat: {
      type: Number,
      default: null,
    },
    players: [tablePlayerSchema],
    createdByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("GameTable", gameTableSchema);