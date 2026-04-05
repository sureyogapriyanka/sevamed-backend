const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');

const seedStaff = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sevaonline';
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB for seeding...');

        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const staffToSeed = [
            // 3 Admins
            { username: 'admin1', password: hashedPassword, role: 'admin', name: 'James Wilson (Admin)', email: 'admin1@sevamed.com' },
            { username: 'admin2', password: hashedPassword, role: 'admin', name: 'Sarah Miller (Admin)', email: 'admin2@sevamed.com' },
            { username: 'admin3', password: hashedPassword, role: 'admin', name: 'Robert Chen (Admin)', email: 'admin3@sevamed.com' },

            // 3 Nurses
            { username: 'nurse1', password: hashedPassword, role: 'nurse', name: 'Emma Thompson (Nurse)', email: 'nurse1@sevamed.com', department: 'General Ward' },
            { username: 'nurse2', password: hashedPassword, role: 'nurse', name: 'Liam Davies (Nurse)', email: 'nurse2@sevamed.com', department: 'ICU' },
            { username: 'nurse3', password: hashedPassword, role: 'nurse', name: 'Chloe Lewis (Nurse)', email: 'nurse3@sevamed.com', department: 'Emergency' },

            // 3 Pharmacists
            { username: 'pharmacist1', password: hashedPassword, role: 'pharmacist', name: 'Oliver Wright (Pharmacist)', email: 'pharmacist1@sevamed.com' },
            { username: 'pharmacist2', password: hashedPassword, role: 'pharmacist', name: 'Sophie Taylor (Pharmacist)', email: 'pharmacist2@sevamed.com' },
            { username: 'pharmacist3', password: hashedPassword, role: 'pharmacist', name: 'Lucas Brown (Pharmacist)', email: 'pharmacist3@sevamed.com' }
        ];

        for (const staff of staffToSeed) {
            const existing = await User.findOne({ username: staff.username });
            if (!existing) {
                await User.create(staff);
                console.log(`Created staff: ${staff.username} (${staff.role})`);
            } else {
                console.log(`Staff already exists: ${staff.username}`);
            }
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding staff:', error);
        process.exit(1);
    }
};

seedStaff();
