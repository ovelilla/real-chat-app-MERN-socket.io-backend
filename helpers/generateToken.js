import crypto from "crypto";

const generateToken = () => {
    return crypto.randomBytes(64).toString('hex');
}

export default generateToken;
