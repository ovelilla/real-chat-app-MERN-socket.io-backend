import Chat from "../models/Chat.js";

export const readAll = async (req, res) => {
    const { user } = req;

    try {
        const chatsWithUnreadCount = await Chat.aggregate([
            { $match: { users: user._id } },
            { $lookup: { from: "users", localField: "users", foreignField: "_id", as: "users" } },
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
                                        { $ne: ["$$message.sender", user._id] },
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

        res.json(chatsWithUnreadCount);
    } catch (error) {
        console.log(error);
    }
};

export const createChat = async (req, res) => {};

export const updateChat = async (req, res) => {};

export const deleteChat = async (req, res) => {};
