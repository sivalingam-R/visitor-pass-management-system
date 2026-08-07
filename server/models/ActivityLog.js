const mongoose = require("mongoose")

const activityLogSchema = new mongoose.Schema(
  {
    visitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visitor",
      required: true,
    },

    action: {
      type: String,
      required: true,
    },

    performedBy: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "User",
       required: false,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model(
  "ActivityLog",
  activityLogSchema,
)