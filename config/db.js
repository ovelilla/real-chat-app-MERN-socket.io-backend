import mongoose from "mongoose";

const connectDB = async (retryCount = 5, delay = 2000) => {
    let success = false;
    let retries = 0;

    mongoose.set("strictQuery", true);

    while (!success && retries < retryCount) {
        try {
            const conn = await mongoose.connect(process.env.MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                auth: {
                    username: process.env.MONGO_USER,
                    password: process.env.MONGO_PASS,
                },
            });

            const url = `${conn.connection.host}:${conn.connection.port}`;
            console.log(`MongoDB connected on: ${url}`);
            success = true;
        } catch (error) {
            retries++;
            console.log(`Error: ${error.message}. Retrying in ${delay / 1000}seconds...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    if (!success) {
        console.log(
            `Error: Could not connect to MongoDB after ${retryCount} retries. Exiting process...`
        );
        process.exit(1);
    }
};

export default connectDB;
