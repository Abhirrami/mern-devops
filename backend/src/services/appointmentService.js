const Appointment = require("../models/Appointment");
const User = require("../models/User");
const { buildQueue } = require("../utils/queue");

const getNextTokenNumber = async (doctorId, appointmentDate) => {
  const latest = await Appointment.findOne({ doctor: doctorId, appointmentDate }).sort({ tokenNumber: -1 });
  return latest ? latest.tokenNumber + 1 : 1;
};

const validateDoctor = async (doctorId) => {
  const doctor = await User.findOne({ _id: doctorId, role: "doctor", isActive: true });

  if (!doctor) {
    throw new Error("Doctor not found.");
  }

  return doctor;
};

const validateDoctorSlot = async (doctorId, slotStart) => {
  const doctor = await validateDoctor(doctorId);

  if (!doctor.availability.includes(slotStart)) {
    throw new Error("Selected slot is outside doctor availability.");
  }

  return doctor;
};

const createAppointment = async ({
  patientId,
  doctorId,
  appointmentDate,
  slotStart,
  slotEnd,
  symptoms,
  isEmergency,
}) => {
  const emergencyBooking = Boolean(isEmergency);

  if (emergencyBooking) {
    await validateDoctor(doctorId);
  } else {
    if (!slotStart || !slotEnd) {
      throw new Error("A standard appointment must include a time slot.");
    }

    await validateDoctorSlot(doctorId, slotStart);

    const existingSlot = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate,
      slotStart,
      status: { $ne: "cancelled" },
      bookingType: "standard",
    });

    if (existingSlot) {
      throw new Error("This slot is already booked.");
    }
  }

  const duplicateActiveAppointment = await Appointment.findOne({
    patient: patientId,
    doctor: doctorId,
    appointmentDate,
    status: { $in: ["booked", "in-progress"] },
  });

  if (duplicateActiveAppointment) {
    throw new Error("You already have an active appointment with this doctor for the selected date.");
  }

  const tokenNumber = await getNextTokenNumber(doctorId, appointmentDate);

  const appointment = await Appointment.create({
    patient: patientId,
    doctor: doctorId,
    appointmentDate,
    slotStart: emergencyBooking ? null : slotStart,
    slotEnd: emergencyBooking ? null : slotEnd,
    bookingType: emergencyBooking ? "emergency" : "standard",
    tokenNumber,
    isEmergency: emergencyBooking,
    symptoms,
  });

  await buildQueue(doctorId, appointmentDate);

  return Appointment.findById(appointment._id).populate("patient", "name email").populate("doctor", "name specialization");
};

module.exports = {
  createAppointment,
};
