require("dotenv").config();
const mongoose = require("mongoose");

async function resetAppointments() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await mongoose.connection.collection("appointments").deleteMany({});
    console.log(`DELETED_APPOINTMENTS=${result.deletedCount}`);
    await mongoose.disconnect();
  } catch (error) {
    console.error("RESET_FAILED", error.message);
    process.exit(1);
  }
}

resetAppointments();
