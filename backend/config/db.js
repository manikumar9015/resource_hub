// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Mongoose's connect method returns a promise, so we use await
        const conn = await mongoose.connect(process.env.MONGO_URI);

        // If the connection is successful, log it to the console
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        // If there's an error connecting, log the error and exit the process
        console.error(`Error: ${error.message}`);
        process.exit(1); // Exit with a non-zero status code to indicate an error
    }
};

module.exports = connectDB;