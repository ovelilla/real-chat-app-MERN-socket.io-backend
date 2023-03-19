import express from "express";
import {
    readByChat,
    createMessage,
    updateMessage,
    updateMessages,
    deleteMessage,
} from "../controllers/messagesController.js";
import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();

router.get("/:chat", checkAuth, readByChat);
router.post("/", checkAuth, createMessage);
router.put("/:chat", updateMessages);
router.delete("/:id", checkAuth, deleteMessage);

export default router;
