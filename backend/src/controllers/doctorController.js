const dayjs = require("dayjs");
const Appointment = require("../models/Appointment");
const { getIO } = require("../config/socket");
const { buildQueue, emitQueueUpdate } = require("../utils/queue");

const getDoctorAppointments = async (req, res, next) => {
  try {
    const date = req.query.date || dayjs().format("YYYY-MM-DD");

    const appointments = await Appointment.find({
      doctor: req.user._id,
      appointmentDate: date,
      status: { $ne: "cancelled" },
    })
      .populate("patient", "name email")
      .populate("doctor", "name specialization")
      .sort({ isEmergency: -1, slotStart: 1, createdAt: 1 });

    const queue = await buildQueue(req.user._id, date);

    res.json({
      appointments,
      queue,
    });
  } catch (error) {
    next(error);
  }
};

const callNextPatient = async (req, res, next) => {
  try {
    const appointmentDate = req.body.appointmentDate || dayjs().format("YYYY-MM-DD");

    const activePatient = await Appointment.findOne({
      doctor: req.user._id,
      appointmentDate,
      status: { $in: ["called", "in-progress"] },
    });

    if (activePatient) {
      res.status(400);
      throw new Error("Finish the current patient flow before calling the next patient.");
    }

    const nextAppointment = await Appointment.findOne({
      doctor: req.user._id,
      appointmentDate,
      status: "booked",
    }).sort({ isEmergency: -1, slotStart: 1, createdAt: 1 });

    if (!nextAppointment) {
      const queue = await buildQueue(req.user._id, appointmentDate);
      return res.json({
        message: "No patients are waiting in the queue.",
        activeAppointment: null,
        queue,
      });
    }

    nextAppointment.status = "called";
    nextAppointment.calledAt = new Date();
    await nextAppointment.save();

    const queue = await buildQueue(req.user._id, appointmentDate);
    await emitQueueUpdate(getIO(), req.user._id.toString(), appointmentDate);

    res.json({
      message: `Token ${nextAppointment.tokenNumber} is ready for consultation.`,
      activeAppointment: nextAppointment,
      queue,
    });
  } catch (error) {
    next(error);
  }
};

const startConsultation = async (req, res, next) => {
  try {
    const appointmentDate = req.body.appointmentDate || dayjs().format("YYYY-MM-DD");

    const current = await Appointment.findOne({
      doctor: req.user._id,
      appointmentDate,
      status: "in-progress",
    });

    if (current) {
      res.status(400);
      throw new Error("A patient is already being served.");
    }

    const calledPatient = await Appointment.findOne({
      doctor: req.user._id,
      appointmentDate,
      status: "called",
    }).sort({ calledAt: 1, createdAt: 1 });

    if (!calledPatient) {
      res.status(400);
      throw new Error("Please call the next patient before starting consultation.");
    }

    calledPatient.status = "in-progress";
    calledPatient.startedAt = new Date();
    await calledPatient.save();

    const queue = await buildQueue(req.user._id, appointmentDate);
    await emitQueueUpdate(getIO(), req.user._id.toString(), appointmentDate);

    res.json({
      message: `Consultation started for token ${calledPatient.tokenNumber}.`,
      activeAppointment: calledPatient,
      queue,
    });
  } catch (error) {
    next(error);
  }
};

const completeConsultation = async (req, res, next) => {
  try {
    const appointmentDate = req.body.appointmentDate || dayjs().format("YYYY-MM-DD");

    const current = await Appointment.findOne({
      doctor: req.user._id,
      appointmentDate,
      status: "in-progress",
    });

    if (!current) {
      res.status(400);
      throw new Error("No patient is currently being served.");
    }

    current.status = "completed";
    current.completedAt = new Date();
    await current.save();

    const queue = await buildQueue(req.user._id, appointmentDate);
    await emitQueueUpdate(getIO(), req.user._id.toString(), appointmentDate);

    res.json({
      message: `Token ${current.tokenNumber} marked as completed.`,
      completedAppointment: current,
      queue,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctorAppointments,
  callNextPatient,
  startConsultation,
  completeConsultation,
};
