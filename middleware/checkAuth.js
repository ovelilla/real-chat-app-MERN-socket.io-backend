import jwt from "jsonwebtoken";
import User from "../models/User.js";

const checkAuth = async (req, res, next) => {
    const token = req.cookies.access_token;

    if (!token) {
        const error = new Error("Token no válido");
        return res.status(403).json({ msg: error.message });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.id;

        req.user = await User.findById(userId).select("__id name email isConnected");

        return next();
    } catch (error) {
        const e = new Error("Hubo un error");
        return res.status(403).json({ msg: e.message });
    }
};

export default checkAuth;
