import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import { Server } from "socket.io";

import usersRoutes from "./routes/usersRoutes.js";
import chatsRoutes from "./routes/chatsRoutes.js";
import messagesRoutes from "./routes/messagesRoutes.js";
import User from "./models/User.js";

const app = express();
app.use(cookieParser());
app.use(express.json());

dotenv.config();

await connectDB();

const whiteList = [process.env.FRONTEND_URL];

const corsOptions = {
    credentials: true,
    origin: function (origin, callback) {
        if (whiteList.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
};

app.use(cors(corsOptions));

app.use("/api/users", usersRoutes);
app.use("/api/chats", chatsRoutes);
app.use("/api/messages", messagesRoutes);

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true,
    },
});

const connectedUsers = {};

io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on("connect-user", async (data) => {
        console.log("Connected user", data.name);
        await User.findByIdAndUpdate(data._id, { lastConnection: Date.now(), isConnected: true });
        connectedUsers[data._id] = socket.id;
        io.emit("user-connected", data);
    });

    socket.on("join-chat", (data) => {
        console.log("Joined chat", data);
        socket.join(data);
    });

    socket.on("create-chat", (data) => {
        socket.to(connectedUsers[data.contact._id]).emit("chat-created", data.chat);
    });

    socket.on("update-chat", (data) => {
        socket.to(connectedUsers[data.contact._id]).emit("chat-updated", data.chat);
    });

    socket.on("send-message", (data) => {
        console.log("Message sended");
        socket.to(data.chat).emit("message-sended", data);
    });

    socket.on("disconnect", async () => {
        const userId = Object.keys(connectedUsers).find((key) => connectedUsers[key] === socket.id);
        console.log("Disconnected user");
        await User.findByIdAndUpdate(userId, { isConnected: false });
        io.emit("user-disconnected", userId);
    });
});
