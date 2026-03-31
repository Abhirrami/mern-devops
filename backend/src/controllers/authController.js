const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Name, email, and password are required.");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error("Email already registered.");
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "patient",
    });

    res.status(201).json({
      message: "Patient account created successfully.",
      token: generateToken(user._id, user.role),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required.");
    }

    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      res.status(401);
      throw new Error("Invalid email or password.");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid email or password.");
    }

    res.json({
      message: "Login successful.",
      token: generateToken(user._id, user.role),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        specialization: user.specialization,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res) => {
  res.json(req.user);
};

module.exports = {
  register,
  login,
  getProfile,
};
