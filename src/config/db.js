const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use MongoDB Atlas connection string if available, otherwise use local MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sevaonline', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.log('MongoDB connection failed. Please ensure MongoDB is running or provide a MongoDB Atlas connection string in your .env file.');
    console.log('To use MongoDB Atlas, set MONGODB_URI in your .env file.');
    console.log('To install MongoDB locally, visit: https://www.mongodb.com/try/download/community');
    // Continue running the server even if MongoDB connection fails
    // This allows the API to work for endpoints that don't require database access
  }
};

module.exports = connectDB;