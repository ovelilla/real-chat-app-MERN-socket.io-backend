import express from "express";
import { readAll, createChat, updateChat, deleteChat } from "../controllers/chatsController.js";
import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();

router.get("/", checkAuth, readAll);
router.post("/", checkAuth, createChat);
router.put("/:id", checkAuth, updateChat);
router.delete("/:id", checkAuth, deleteChat);

export default router;
