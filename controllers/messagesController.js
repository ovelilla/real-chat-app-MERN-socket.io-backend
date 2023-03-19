import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

export const readByChat = async (req, res) => {
    const { user } = req;
    const { chat } = req.params;

    try {
        await Message.updateMany({ chat, sender: { $ne: user._id } }, { read: true });
        const messages = await Message.find({ chat }).populate(["sender", "receiver"]);

        res.json(messages);
    } catch (error) {
        console.log(error);
    }
};

export const createMessage = async (req, res) => {
    const { user } = req;
    const { chat, contact, message } = req.body;

    try {
        const savedChat = chat ? chat : await Chat.create({ users: [user._id, contact._id] });

        const savedMessage = await Message.create({
            chat: savedChat._id,
            sender: user._id,
            receiver: contact._id,
            message,
        });

        const populatedMessage = await savedMessage.populate(["sender", "receiver"]);

        const chatsWithUnreadCount = await Chat.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(savedChat._id) } },
            {
                $lookup: {
                    from: "users",
                    localField: "users",
                    foreignField: "_id",
                    as: "users",
                },
            },
            {
                $lookup: {
                    from: "messages",
                    localField: "_id",
                    foreignField: "chat",
                    as: "messages",
                },
            },
            {
                $project: {
                    _id: 1,
                    users: 1,
                    unreadCount: {
                        $size: {
                            $filter: {
                                input: "$messages",
                                as: "message",
                                cond: {
                                    $and: [
                                        { $ne: ["$$message.sender", contact._id] },
                                        { $eq: ["$$message.read", false] },
                                    ],
                                },
                            },
                        },
                    },
                    lastMessage: { $last: "$messages" },
                },
            },
        ]);

        res.json({ chat: chatsWithUnreadCount[0], message: populatedMessage });
    } catch (error) {
        console.log(error);
    }
};

export const updateMessage = async (req, res) => {};

export const updateMessages = async (req, res) => {
    const { user } = req.body;
    const { chat } = req.params;

    try {
        await Message.updateMany({ chat, sender: { $ne: user._id } }, { read: true });

        res.json({ message: "Messages updated" });
    } catch (error) {
        console.log(error);
    }
};

export const deleteMessage = async (req, res) => {};
