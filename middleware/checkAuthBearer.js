import jwt from "jsonwebtoken";
import User from "../models/User.js";

const checkAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        const error = new Error('Token no válido');
        return res.status(401).json({ msg: error.message });
    }

    if (!authHeader.toLowerCase().startsWith('bearer')) {
        const error = new Error('Token no válido');
        return res.status(401).json({ msg: error.message });
    }

    try {
        const token = authHeader.split(' ').pop();
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.id;
        const user = await User.findById(userId).select("__id name email");

        if (!user) {
            return res.status(401).json({ msg: "El usuario no existe" });
        }

        req.user = user;

        return next();
    } catch (error) {
        const e = new Error("Hubo un error");
        return res.status(403).json({ msg: e.message });
    }
};

export default checkAuth;
