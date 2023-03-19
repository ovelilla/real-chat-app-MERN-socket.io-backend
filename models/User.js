import mongoose from "mongoose";
import bcrypt from "bcrypt";
import argon2 from "argon2";

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minlength: 6,
            maxlength: 128,
        },
        token: {
            type: String,
        },
        confirmed: {
            type: Boolean,
            default: false,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        isConnected: {
            type: Boolean,
            default: false,
        },
        lastConnection: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (next) {
    try {
        if (!this.isModified("password")) {
            return next();
        }

        this.password = await argon2.hash(this.password);
    } catch (error) {
        return next(error);
    }
});

userSchema.methods.comparePassword = async function (password) {
    return await argon2.verify(this.password, password);
};

const User = mongoose.model("User", userSchema);

export default User;
