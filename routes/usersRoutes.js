import express from "express";
import {
    readAll,
    register,
    confirm,
    login,
    logout,
    recover,
    checkToken,
    restore,
    auth,
} from "../controllers/usersController.js";
import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();

router.get("/", readAll);
router.post("/register", register);
router.post("/login", login);
router.get("/logout", checkAuth, logout);
router.get("/confirm/:token", confirm);
router.post("/recover", recover);
router.get("/check-token/:token", checkToken);
router.post("/restore", restore);
router.get("/auth", checkAuth, auth);

export default router;
