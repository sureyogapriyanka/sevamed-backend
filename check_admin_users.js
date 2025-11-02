const mongoose = require('mongoose');
const User = require('./src/models/User');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
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

// Check admin users
const checkAdminUsers = async () => {
    try {
        // Connect to database
        await connectDB();

        // Find all admin users
        const adminUsers = await User.find({ role: 'admin' });
        console.log('Admin users in database:');
        adminUsers.forEach(user => {
            console.log(`- Username: ${user.username}, Name: ${user.name}, Role: ${user.role}`);
        });

        // Check specifically for ADM001
        const yogaUser = await User.findOne({ username: 'ADM001' });
        if (yogaUser) {
            console.log('\nFound Yoga Priyanka user:');
            console.log(`- Username: ${yogaUser.username}`);
            console.log(`- Name: ${yogaUser.name}`);
            console.log(`- Role: ${yogaUser.role}`);
        } else {
            console.log('\nYoga Priyanka user (ADM001) not found in database');
        }

        // Check all users
        const allUsers = await User.find({});
        console.log('\nAll users in database:');
        allUsers.forEach(user => {
            console.log(`- Username: ${user.username}, Name: ${user.name}, Role: ${user.role}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error checking users:', error);
        process.exit(1);
    }
};

checkAdminUsers();