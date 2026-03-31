const Appointment = require("../models/Appointment");
const User = require("../models/User");

const toMinutes = (value) => {
  if (!value) {
    return Number.MAX_SAFE_INTEGER;
  }

  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

const generateServiceTimeline = (availability = [], queueLength) => {
  const sortedAvailability = [...availability].sort((a, b) => toMinutes(a) - toMinutes(b));
  const fallbackStart = sortedAvailability[0] || "10:00";
  let currentMinutes = toMinutes(fallbackStart);

  return Array.from({ length: queueLength }, (_, index) => {
    const slotStartMinutes = index < sortedAvailability.length ? toMinutes(sortedAvailability[index]) : currentMinutes;
    currentMinutes = slotStartMinutes + 15;

    const hours = String(Math.floor(slotStartMinutes / 60)).padStart(2, "0");
    const minutes = String(slotStartMinutes % 60).padStart(2, "0");
    const endHours = String(Math.floor((slotStartMinutes + 15) / 60)).padStart(2, "0");
    const endMinutes = String((slotStartMinutes + 15) % 60).padStart(2, "0");

    return {
      slotStart: `${hours}:${minutes}`,
      slotEnd: `${endHours}:${endMinutes}`,
    };
  });
};

const buildQueue = async (doctorId, appointmentDate) => {
  const doctor = await User.findById(doctorId).select("availability name");
  const appointments = await Appointment.find({
    doctor: doctorId,
    appointmentDate,
    status: { $in: ["booked", "called", "in-progress", "completed"] },
  })
    .populate("patient", "name email")
    .populate("doctor", "name specialization")
    .sort({ isEmergency: -1, slotStart: 1, createdAt: 1 });

  let pendingIndex = 0;
  const activeAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "booked" || appointment.status === "called" || appointment.status === "in-progress"
  );
  const serviceTimeline = generateServiceTimeline(doctor?.availability || [], activeAppointments.length);
  let timelineIndex = 0;

  const enrichedAppointments = appointments.map((appointment) => {
    const item = appointment.toObject();

    if (appointment.status === "booked" || appointment.status === "called" || appointment.status === "in-progress") {
      pendingIndex += 1;
      item.queueNumber = pendingIndex;
      item.estimatedWaitMinutes = Math.max((pendingIndex - 1) * 15, 0);
      item.serviceSlotStart = serviceTimeline[timelineIndex]?.slotStart || null;
      item.serviceSlotEnd = serviceTimeline[timelineIndex]?.slotEnd || null;
      timelineIndex += 1;
    } else {
      item.serviceSlotStart = item.slotStart || null;
      item.serviceSlotEnd = item.slotEnd || null;
    }

    return item;
  });

  const bulkOps = enrichedAppointments
    .filter(
      (appointment) =>
        appointment.status === "booked" || appointment.status === "called" || appointment.status === "in-progress"
    )
    .map((appointment) => ({
      updateOne: {
        filter: { _id: appointment._id },
        update: {
          queueNumber: appointment.queueNumber,
          estimatedWaitMinutes: appointment.estimatedWaitMinutes,
          slotStart:
            appointment.bookingType === "emergency" && appointment.serviceSlotStart
              ? appointment.serviceSlotStart
              : appointment.slotStart,
          slotEnd:
            appointment.bookingType === "emergency" && appointment.serviceSlotEnd
              ? appointment.serviceSlotEnd
              : appointment.slotEnd,
        },
      },
    }));

  if (bulkOps.length) {
    await Appointment.bulkWrite(bulkOps);
  }

  const activeQueue = enrichedAppointments.filter(
    (appointment) =>
      appointment.status === "booked" || appointment.status === "called" || appointment.status === "in-progress"
  );

  const nowServing = activeQueue.find((appointment) => appointment.status === "in-progress") || null;
  const calledPatient = activeQueue.find((appointment) => appointment.status === "called") || null;
  const nextPatient = activeQueue.find((appointment) => appointment.status === "booked") || null;

  return {
    nowServingToken: nowServing ? nowServing.tokenNumber : null,
    nowServingPatientName: nowServing ? nowServing.patient?.name : null,
    calledPatientToken: calledPatient ? calledPatient.tokenNumber : null,
    calledPatientName: calledPatient ? calledPatient.patient?.name : null,
    nextPatientToken: nextPatient ? nextPatient.tokenNumber : null,
    nextPatientName: nextPatient ? nextPatient.patient?.name : null,
    patientsInQueue: activeQueue.length,
    queue: activeQueue,
    totalWaiting: activeQueue.filter((appointment) => appointment.status === "booked" || appointment.status === "called").length,
  };
};

const emitQueueUpdate = async (io, doctorId, appointmentDate) => {
  if (!io) {
    return;
  }

  const payload = await buildQueue(doctorId, appointmentDate);
  io.to(`queue:${doctorId}:${appointmentDate}`).emit("queue:update", payload);
};

module.exports = {
  buildQueue,
  emitQueueUpdate,
};
