

const mongoose = require('mongoose');

const mongo_URL = "mongodb+srv://muskansingh:tMuhcc7iK9Ecx5Iy@training-db.e5az6.mongodb.net/training-db?retryWrites=true&w=majority";

mongoose.connect(mongo_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
}).then(() => {
    console.log('Successfully connected to MongoDB database');
}).catch(error => {
    console.error('Error connecting to MongoDB:', error.message);
});

// Enable Mongoose debugging (useful during development)
mongoose.set('debug', true);

const db = mongoose.connection;

// Listen for errors after the initial connection
db.on('error', error => {
    console.error('MongoDB connection error:', error.message);
});

// Listen for disconnections
db.on('disconnected', () => {
    console.log('Disconnected from MongoDB database');
});

// Handle process termination gracefully
process.on('SIGINT', async () => {
    try {
        await mongoose.disconnect();
        console.log('MongoDB connection closed due to app termination');
        process.exit(0);
    } catch (error) {
        console.error('Error during disconnection:', error.message);
        process.exit(1);
    }
});

module.exports = {
    db
};
