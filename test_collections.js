const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sevaonline';

async function testCollections() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Get list of collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Available collections:');
        collections.forEach(collection => {
            console.log(`- ${collection.name}`);
        });

        // Check specific collections
        const requiredCollections = ['users', 'patients', 'appointments', 'fitnessdata', 'aiinsights'];
        console.log('\nRequired collections status:');
        for (const collectionName of requiredCollections) {
            const exists = collections.some(c => c.name === collectionName);
            console.log(`${collectionName}: ${exists ? 'EXISTS' : 'MISSING'}`);
        }

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Disconnected from MongoDB');
    }
}

// Run the test
testCollections();