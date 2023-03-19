import User from "../models/User.js";
import validator from "validator";
import generateToken from "../helpers/generateToken.js";
import generateJWT from "../helpers/generateJWT.js";
import confirmEmail from "../helpers/confirmEmail.js";
import recoverEmail from "../helpers/recoverEmail.js";

export const readAll = async (req, res) => {
    try {
        const users = await User.find();

        res.json(users);
    } catch (error) {
        console.log(error);
    }
};

export const register = async (req, res) => {
    const { email, password } = req.body;

    const errors = {};

    if (!email) {
        const error = new Error("El email es obligatorio");
        errors.email = error.message;
    } else if (!validator.isEmail(email)) {
        const error = new Error("El email no es válido");
        errors.email = error.message;
    }

    if (!password) {
        const error = new Error("El password es obligatorio");
        errors.password = error.message;
    } else if (password.length < 6) {
        const error = new Error("El password debe contener al menos 6 caracteres");
        errors.password = error.message;
    }

    if (Object.keys(errors).length) {
        return res.status(400).json({ errors });
    }

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            const error = new Error("Usuario ya registrado");
            errors.email = error.message;
            return res.status(400).json({ errors });
        }

        const newUser = new User(req.body);
        newUser.token = generateToken();

        const savedUser = await newUser.save();

        confirmEmail({ name: savedUser.name, email: savedUser.email, token: savedUser.token });

        res.status(200).json({
            message: "Usuario creado correctamente, revisa tu email",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const confirm = async (req, res) => {
    const { token } = req.params;

    try {
        const user = await User.findOne({ token });

        if (!user) {
            const error = new Error("Token no válido");
            return res.status(403).json({ message: error.message });
        }

        user.token = "";
        user.confirmed = true;

        await user.save();

        res.status(200).json({ message: "Usuario confirmado correctamente" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    const errors = {};

    if (!email) {
        const error = new Error("El email es obligatorio");
        errors.email = error.message;
    } else if (!validator.isEmail(email)) {
        const error = new Error("El email no es válido");
        errors.email = error.message;
    }

    if (!password) {
        const error = new Error("El password es obligatorio");
        errors.password = error.message;
    } else if (password.length < 6) {
        const error = new Error("El password debe contener al menos 6 caracteres");
        errors.password = error.message;
    }

    if (Object.keys(errors).length) {
        return res.status(400).json({ errors });
    }

    try {
        const findUser = await User.findOne({ email });

        if (!findUser) {
            const error = new Error("El usuario no existe");
            errors.email = error.message;
            return res.status(404).json({ errors });
        }

        if (!findUser.confirmed) {
            const error = new Error("Tu cuenta no ha sido confirmada");
            errors.email = error.message;
            return res.status(404).json({ errors });
        }

        if (!(await findUser.comparePassword(password))) {
            const error = new Error("El password es incorrecto");
            errors.password = error.message;
            return res.status(404).json({ errors });
        }

        const updatedUser = await User.findByIdAndUpdate(
            findUser._id,
            { lastConnection: Date.now(), isConnected: true },
            { new: true }
        );

        const token = generateJWT(updatedUser.id);

        res.cookie("access_token", token, {
            expires: new Date(Date.now() + 24 * 3600000),
            sameSite: "none",
            secure: true,
            httpOnly: true,
        });

        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isConnected: updatedUser.isConnected,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { isConnected: false });

        res.clearCookie("access_token", {
            expires: new Date(Date.now() - 1),
            sameSite: "none",
            secure: true,
            httpOnly: true,
        });

        res.status(200).json({ message: "Sesión cerrada correctamente" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const recover = async (req, res) => {
    const { email } = req.body;

    const errors = {};

    if (!email) {
        const error = new Error("El email es obligatorio");
        errors.email = error.message;
    } else if (!validator.isEmail(email)) {
        const error = new Error("El email no es válido");
        errors.email = error.message;
    }

    if (Object.keys(errors).length) {
        return res.status(400).json({ errors });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            const error = new Error("El usuario no existe");
            errors.email = error.message;
            return res.status(400).json({ errors });
        }

        user.token = generateToken();

        await user.save();

        recoverEmail({ name: user.name, email: user.email, token: user.token });

        res.status(200).json({ message: "Hemos enviado un email con las instrucciones" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const checkToken = async (req, res) => {
    const { token } = req.params;

    const user = await User.findOne({ token });

    if (!user) {
        const error = new Error("Token no válido");
        return res.status(403).json({ message: error.message });
    }

    res.status(200).json({ message: "Introduce tu nuevo password" });
};

export const restore = async (req, res) => {
    const { password, confirmPassword, token } = req.body;

    const errors = {};

    if (!password) {
        const error = new Error("El password es obligatorio");
        errors.password = error.message;
    } else if (password.length < 6) {
        const error = new Error("El password debe contener al menos 6 caracteres");
        errors.password = error.message;
    }

    if (!confirmPassword) {
        const error = new Error("El password de confirmación es obligatorio");
        errors.confirmPassword = error.message;
    }

    if (password && confirmPassword && password !== confirmPassword) {
        const error = new Error("Los passwords no coinciden");
        errors.confirmPassword = error.message;
    }

    if (Object.keys(errors).length) {
        return res.status(400).json({ errors });
    }

    try {
        const user = await User.findOne({ token });

        if (!user) {
            const error = new Error("Token no válido");
            return res.status(400).json({ message: error.message });
        }

        user.token = "";
        user.password = password;

        await user.save();

        res.status(200).json({ message: "La contraseña se ha cambiado correctamente" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const auth = async (req, res) => {
    const { user } = req;
    user.isConnected = true;
    res.status(200).json(user);
};
