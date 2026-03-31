const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    appointmentDate: {
      type: String,
      required: true,
    },
    slotStart: {
      type: String,
      default: null,
    },
    slotEnd: {
      type: String,
      default: null,
    },
    bookingType: {
      type: String,
      enum: ["standard", "emergency"],
      default: "standard",
    },
    tokenNumber: {
      type: Number,
      required: true,
    },
    queueNumber: {
      type: Number,
      default: 0,
    },
    isEmergency: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["booked", "called", "in-progress", "completed", "cancelled"],
      default: "booked",
    },
    symptoms: {
      type: String,
      trim: true,
      default: "",
    },
    estimatedWaitMinutes: {
      type: Number,
      default: 0,
    },
    checkedInAt: {
      type: Date,
      default: Date.now,
    },
    calledAt: Date,
    startedAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

appointmentSchema.index(
  { doctor: 1, appointmentDate: 1, slotStart: 1 },
  {
    unique: true,
    partialFilterExpression: {
      slotStart: { $type: "string" },
      bookingType: "standard",
    },
  }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
