const mongoose = require("mongoose");

const handHistorySchema = new mongoose.Schema(
  {
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GameTable",
      required: true,
    },
    gameType: {
      type: String,
      required: true,
    },
    players: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        result: String,
        chipsWon: {
          type: Number,
          default: 0,
        },
      },
    ],
    totalPot: {
      type: Number,
      default: 0,
    },
    winnerText: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HandHistory", handHistorySchema);