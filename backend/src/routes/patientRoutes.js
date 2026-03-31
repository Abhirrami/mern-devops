const express = require("express");
const {
  getDoctors,
  bookAppointment,
  getMyAppointments,
  getQueueStatus,
  getAvailableSlots,
} = require("../controllers/patientController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect, authorize("patient"));
router.get("/doctors", getDoctors);
router.get("/appointments", getMyAppointments);
router.get("/queue/:doctorId/:date", getQueueStatus);
router.get("/slots/:doctorId/:date", getAvailableSlots);
router.post("/appointments", bookAppointment);

module.exports = router;
