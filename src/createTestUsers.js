const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
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
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Create test users
const createTestUsers = async () => {
    try {
        // Connect to database
        await connectDB();

        // Clear existing users
        await User.deleteMany({});
        console.log('Cleared existing users');

        // Create test users with different roles including the doctor users expected by the frontend
        const testUsers = [
            {
                username: 'patient1',
                password: 'patient123',
                role: 'patient',
                name: 'John Doe',
                email: 'john.doe@example.com'
            },
            {
                username: 'patient2',
                password: 'patient123',
                role: 'patient',
                name: 'Jane Smith',
                email: 'jane.smith@example.com'
            },
            // Doctor users with DOC format
            {
                username: 'DOC001',
                password: 'CARDIO2024',
                role: 'doctor',
                name: 'Dr. Sure Yoga Priyanka',
                email: 'yoga.priyanka@example.com',
                department: 'Cardiology',
                specialization: 'Cardiologist'
            },
            {
                username: 'DOC002',
                password: 'NEURO2024',
                role: 'doctor',
                name: 'Dr. Bhetapudi Manasa',
                email: 'bhetapudi.manasa@example.com',
                department: 'Neurology',
                specialization: 'Neurologist'
            },
            {
                username: 'DOC003',
                password: 'EMERGENCY2024',
                role: 'doctor',
                name: 'Dr. Bhimavarapu Bhavana',
                email: 'bhimavarapu.bhavana@example.com',
                department: 'Emergency Medicine',
                specialization: 'Emergency Physician'
            },
            // Additional doctor users
            {
                username: 'DOC004',
                password: 'doctor123',
                role: 'doctor',
                name: 'Dr. Sarah Johnson',
                email: 'sarah.johnson@example.com',
                department: 'Orthopedics',
                specialization: 'Orthopedic Surgeon'
            },
            {
                username: 'DOC005',
                password: 'doctor123',
                role: 'doctor',
                name: 'Dr. Michael Chen',
                email: 'michael.chen@example.com',
                department: 'Pediatrics',
                specialization: 'Pediatrician'
            },
            {
                username: 'reception1',
                password: 'reception123',
                role: 'reception',
                name: 'Reception Staff',
                email: 'reception@example.com'
            },
            // Add reception users that match the frontend IDs
            {
                username: 'REC001',
                password: 'RECEPTION2024',
                role: 'reception',
                name: 'Priya Sharma',
                email: 'priya.sharma@example.com'
            },
            {
                username: 'REC002',
                password: 'PAT2024',
                role: 'reception',
                name: 'Anjali Patel',
                email: 'anjali.patel@example.com'
            },
            {
                username: 'REC003',
                password: 'REDDY2024',
                role: 'reception',
                name: 'Sneha Reddy',
                email: 'sneha.reddy@example.com'
            },
            {
                username: 'admin1',
                password: 'admin123',
                role: 'admin',
                name: 'System Administrator',
                email: 'admin@example.com'
            },
            // Add the specific admin users expected by the frontend
            {
                username: 'ADM001',
                password: 'YOGA2024',
                role: 'admin',
                name: 'Sure Yoga Priyanka',
                email: 'yoga.priyanka@example.com'
            },
            {
                username: 'ADM002',
                password: 'MANASA2024',
                role: 'admin',
                name: 'Bhetapudi Manasa',
                email: 'bhetapudi.manasa@example.com'
            },
            {
                username: 'ADM003',
                password: 'BHAVANA2024',
                role: 'admin',
                name: 'Bhimavarapu Bhavana',
                email: 'bhimavarapu.bhavana@example.com'
            }
        ];

        // Hash passwords and save users
        for (const userData of testUsers) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password, salt);

            const user = new User({
                ...userData,
                password: hashedPassword
            });

            await user.save();
            console.log(`Created user: ${user.username} (${user.role})`);
        }

        console.log('Test users created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error creating test users:', error);
        process.exit(1);
    }
};

createTestUsers();