require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const app = require("./app");
const { setIO } = require("./config/socket");
const Appointment = require("./models/Appointment");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await Appointment.syncIndexes();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  setIO(io);

  io.on("connection", (socket) => {
    socket.on("queue:join", ({ doctorId, date }) => {
      socket.join(`queue:${doctorId}:${date}`);
    });

    socket.on("queue:leave", ({ doctorId, date }) => {
      socket.leave(`queue:${doctorId}:${date}`);
    });
  });

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
