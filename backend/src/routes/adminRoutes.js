const express = require("express");
const {
  addDoctor,
  removeDoctor,
  getAllAppointments,
  getDashboardStats,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect, authorize("admin"));
router.post("/doctors", addDoctor);
router.delete("/doctors/:id", removeDoctor);
router.get("/appointments", getAllAppointments);
router.get("/dashboard", getDashboardStats);

module.exports = router;
