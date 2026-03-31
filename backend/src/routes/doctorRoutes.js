const express = require("express");
const {
  getDoctorAppointments,
  callNextPatient,
  startConsultation,
  completeConsultation,
} = require("../controllers/doctorController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect, authorize("doctor"));
router.get("/appointments", getDoctorAppointments);
router.post("/queue/next", callNextPatient);
router.post("/queue/start", startConsultation);
router.post("/queue/complete", completeConsultation);

module.exports = router;
