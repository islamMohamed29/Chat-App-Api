import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messagesRoutes.js";
import * as httpStatusText from "./utils/httpStatusText.js";
import { Server } from "socket.io";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth/", userRoutes);
app.use("/api/messages/", messageRoutes);

app.all("*", (req, res) => {
  res
    .status(404)
    .json({ message: `can't find this route: ${req.originalUrl} on server` });
});

// global error handling middleware
app.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    status: error.statusText || httpStatusText.ERROR,
    message: error.message,
    code: error.statusCode || 500,
    data: null,
  });
});

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("connected DB Success");
  })
  .catch((err) => console.log(`Fail to ConnectDB ${err}`));

const server = app.listen(process.env.PORT, () =>
  console.log(`server running on port >>>> ${process.env.PORT}`)
);

const io = new Server(server, {
  cors: "*",
  credentials: true,
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.message);
    }
  });
});
