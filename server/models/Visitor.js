const mongoose = require("mongoose")

const visitorSchema = new mongoose.Schema(
  {
    visitorName: {
      type: String,
      required: true,
    },

    phoneNumber: {
      type: String,
      required: true,
    },

    address: {
      type: String,
    },

    purpose: {
      type: String,
      required: true,
    },

    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    visitDate: {
      type: Date,
      required: true,
    },

    expectedArrivalTime: {
      type: String,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Rejected",
        "CheckedIn",
        "CheckedOut",
        "Cancelled",
      ],
      default: "Pending",
    },

    remarks: {
      type: String,
    },

    checkInTime: {
      type: Date,
    },

    checkOutTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model("Visitor", visitorSchema)