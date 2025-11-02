// Test script to directly query the database for profile image storage
const mongoose = require('mongoose');
require('dotenv').config();

// Database connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sevaonline', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

async function testDatabaseQuery() {
    try {
        // Connect to database
        const conn = await connectDB();

        // Get the User model
        const User = require('./src/models/User');

        // Find the latest user
        const user = await User.findOne().sort({ createdAt: -1 });
        console.log('Latest user:', user.username);
        console.log('Profile image:', user.profileImage);

        if (user.profileImage) {
            console.log('✅ Profile image found in database!');
        } else {
            console.log('❌ Profile image not found in database');
        }

        // Close connection
        await conn.connection.close();
    } catch (error) {
        console.error('Error during database query test:', error);
    }
}

testDatabaseQuery();