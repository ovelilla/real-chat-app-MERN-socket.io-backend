import nodemailer from "nodemailer";

const recoverEmail = async (user) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const { name, email, token } = user;

    const html = `
        <p>Hola ${name}, has solicitado restablecer tu password.</p>
        <p>Haz clic en siguiente enlace para que puedas generar un nuevo password</p>
        <a href="${process.env.FRONTEND_URL}/restaurar/${token}">Restablecer Password</a>
        <p>Si no has solicitado este servicio, puedes ignorar este mensaje.</p>
    `;

    const info = await transporter.sendMail({
        from: "ChatApp",
        to: email,
        subject: "Restablece tu Password",
        text: "Restablece tu Password",
        html: html,
    });

    console.log("Mensaje enviado: %s", info.messageId);
};

export default recoverEmail;
