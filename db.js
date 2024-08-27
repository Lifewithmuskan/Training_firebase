require('dotenv').config();
const mongoose = require('mongoose');

const mongo_URL = process.env.MONGO_URI;

mongoose.connect(mongo_URL, {
    serverSelectionTimeoutMS: 30000, // Set timeout to 30 seconds
}).catch(error => {
    console.error('Error connecting to MongoDB:', error.message);
});

mongoose.set('debug', true);

const db = mongoose.connection;

// Define listeners for database connection events
db.on('connected', () => {
    console.log("Successfully connected to MongoDB database");
});

db.on('disconnected', () => {
    console.log("Disconnected from MongoDB database");
});

db.on('error', (error) => {
    console.error("MongoDB connection error:", error.message);
});

// Handle process termination gracefully to close MongoDB connection
process.on('SIGINT', async () => {
    await mongoose.disconnect();
    console.log("MongoDB connection closed due to app termination");
    process.exit(0);
});

module.exports = {
    db: db
};
