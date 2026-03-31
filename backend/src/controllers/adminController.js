const User = require("../models/User");
const Appointment = require("../models/Appointment");

const addDoctor = async (req, res, next) => {
  try {
    const { name, email, password, specialization, consultationFee, availability } = req.body;

    if (!name || !email || !password || !specialization) {
      res.status(400);
      throw new Error("Name, email, password, and specialization are required.");
    }

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400);
      throw new Error("Doctor email already exists.");
    }

    const doctor = await User.create({
      name,
      email,
      password,
      role: "doctor",
      specialization,
      consultationFee: Number(consultationFee) || 0,
      availability:
        Array.isArray(availability) && availability.length
          ? availability
          : ["10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30", "11:45", "12:00"],
    });

    res.status(201).json({
      message: "Doctor created successfully.",
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        consultationFee: doctor.consultationFee,
      },
    });
  } catch (error) {
    next(error);
  }
};

const removeDoctor = async (req, res, next) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: "doctor" });

    if (!doctor) {
      res.status(404);
      throw new Error("Doctor not found.");
    }

    doctor.isActive = false;
    await doctor.save();

    res.json({ message: "Doctor removed successfully." });
  } catch (error) {
    next(error);
  }
};

const getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient", "name email")
      .populate("doctor", "name specialization")
      .sort({ appointmentDate: -1, slotStart: 1 });

    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const doctors = await User.find({ role: "doctor", isActive: true })
      .select("_id name email specialization consultationFee availability")
      .sort({ name: 1 });

    const totalPatientsPerDay = await Appointment.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: "$appointmentDate", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const avgWaitingTime = await Appointment.aggregate([
      { $match: { status: "completed", startedAt: { $ne: null } } },
      {
        $project: {
          waitTime: {
            $divide: [{ $subtract: ["$startedAt", "$createdAt"] }, 1000 * 60],
          },
        },
      },
      {
        $group: {
          _id: null,
          averageWaitMinutes: { $avg: "$waitTime" },
        },
      },
    ]);

    const peakHours = await Appointment.aggregate([
      {
        $group: {
          _id: "$slotStart",
          appointments: { $sum: 1 },
        },
      },
      { $sort: { appointments: -1 } },
    ]);

    const doctorPerformance = await Appointment.aggregate([
      {
        $group: {
          _id: "$doctor",
          completedAppointments: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          emergenciesHandled: {
            $sum: { $cond: [{ $eq: ["$isEmergency", true] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "doctor",
        },
      },
      { $unwind: "$doctor" },
      {
        $project: {
          _id: 1,
          name: "$doctor.name",
          specialization: "$doctor.specialization",
          completedAppointments: 1,
          emergenciesHandled: 1,
        },
      },
      { $sort: { completedAppointments: -1 } },
    ]);

    const totals = {
      doctors: await User.countDocuments({ role: "doctor", isActive: true }),
      patients: await User.countDocuments({ role: "patient", isActive: true }),
      appointments: await Appointment.countDocuments(),
    };

    res.json({
      totals,
      doctors,
      totalPatientsPerDay,
      averageWaitingTime: Number(avgWaitingTime[0]?.averageWaitMinutes || 0).toFixed(1),
      peakHours,
      doctorPerformance,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addDoctor,
  removeDoctor,
  getAllAppointments,
  getDashboardStats,
};
