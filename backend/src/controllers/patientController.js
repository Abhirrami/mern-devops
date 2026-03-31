const dayjs = require("dayjs");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const { getIO } = require("../config/socket");
const { createAppointment } = require("../services/appointmentService");
const { buildQueue, emitQueueUpdate } = require("../utils/queue");

const getDoctors = async (req, res, next) => {
  try {
    const doctors = await User.find({ role: "doctor", isActive: true }).select("-password").sort({ name: 1 });
    res.json(doctors);
  } catch (error) {
    next(error);
  }
};

const bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, appointmentDate, slotStart, slotEnd, symptoms, isEmergency } = req.body;

    if (!doctorId || !appointmentDate) {
      res.status(400);
      throw new Error("Doctor and appointment date are required.");
    }

    if (!isEmergency && (!slotStart || !slotEnd)) {
      res.status(400);
      throw new Error("Please select a time slot for a standard appointment.");
    }

    const appointment = await createAppointment({
      patientId: req.user._id,
      doctorId,
      appointmentDate,
      slotStart,
      slotEnd,
      symptoms,
      isEmergency,
    });

    await emitQueueUpdate(getIO(), doctorId, appointmentDate);

    res.status(201).json({
      message: "Appointment booked successfully.",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

const getMyAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate("doctor", "name specialization consultationFee")
      .sort({ appointmentDate: -1, slotStart: 1 });

    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

const getQueueStatus = async (req, res, next) => {
  try {
    const { doctorId, date } = req.params;
    const queueSnapshot = await buildQueue(doctorId, date);
    const myAppointment = queueSnapshot.queue.find(
      (appointment) => appointment.patient._id.toString() === req.user._id.toString()
    );

    res.json({
      ...queueSnapshot,
      myAppointment,
      patientsAhead: myAppointment ? Math.max(myAppointment.queueNumber - 1, 0) : null,
      estimatedTurnInMinutes: myAppointment ? myAppointment.estimatedWaitMinutes : null,
    });
  } catch (error) {
    next(error);
  }
};

const getAvailableSlots = async (req, res, next) => {
  try {
    const { doctorId, date } = req.params;
    const doctor = await User.findOne({ _id: doctorId, role: "doctor", isActive: true }).select("availability");

    if (!doctor) {
      res.status(404);
      throw new Error("Doctor not found.");
    }

    const bookedSlots = await Appointment.find({
      doctor: doctorId,
      appointmentDate: date,
      status: { $ne: "cancelled" },
      bookingType: "standard",
      slotStart: { $ne: null },
    }).select("slotStart");

    const bookedSet = new Set(bookedSlots.map((appointment) => appointment.slotStart));

    const slots = doctor.availability.map((slotStart) => {
      const slotEnd = dayjs(`2025-01-01 ${slotStart}`).add(15, "minute").format("HH:mm");
      return {
        slotStart,
        slotEnd,
        isBooked: bookedSet.has(slotStart),
      };
    });

    res.json(slots);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  bookAppointment,
  getMyAppointments,
  getQueueStatus,
  getAvailableSlots,
};
