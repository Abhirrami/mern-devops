require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    await connectDB();

    const email = process.env.ADMIN_EMAIL || "admin@clinic.com";
    const existing = await User.findOne({ email });

    if (existing) {
      console.log("Admin already exists.");
      process.exit(0);
    }

    await User.create({
      name: process.env.ADMIN_NAME || "System Admin",
      email,
      password: process.env.ADMIN_PASSWORD || "Admin@123",
      role: "admin",
    });

    console.log("Admin user created successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed admin", error.message);
    process.exit(1);
  }
};

seedAdmin();
