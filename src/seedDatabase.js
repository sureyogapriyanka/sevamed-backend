const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('./models/User');
const Patient = require('./models/Patient');
const Appointment = require('./models/Appointment');
const ActivityLog = require('./models/ActivityLog');
const Message = require('./models/Message');
const Queue = require('./models/Queue');
const AIInsight = require('./models/AIInsight');
const Attendance = require('./models/Attendance');
const FitnessData = require('./models/FitnessData');
const KnowledgeArticle = require('./models/KnowledgeArticle');

// Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
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

// Seed users with different roles
const seedUsers = async () => {
    try {
        // Clear existing collections
        await User.deleteMany({});
        await Patient.deleteMany({});
        await Appointment.deleteMany({});
        await ActivityLog.deleteMany({});
        await Message.deleteMany({});
        await Queue.deleteMany({});
        await AIInsight.deleteMany({});
        await Attendance.deleteMany({});
        await FitnessData.deleteMany({});
        await KnowledgeArticle.deleteMany({});

        console.log('Cleared existing collections');

        // Create test users with different roles
        const testUsers = [
            // Patients
            {
                username: 'patient1',
                password: 'patient123',
                role: 'patient',
                name: 'John Doe',
                email: 'john.doe@example.com',
                age: 35,
                gender: 'Male',
                phone: '+1234567890',
                address: '123 Main St, City, State',
                bloodGroup: 'O+'
            },
            {
                username: 'patient2',
                password: 'patient123',
                role: 'patient',
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
                age: 28,
                gender: 'Female',
                phone: '+1234567891',
                address: '456 Oak Ave, City, State',
                bloodGroup: 'A-'
            },
            {
                username: 'patient3',
                password: 'patient123',
                role: 'patient',
                name: 'Robert Johnson',
                email: 'robert.johnson@example.com',
                age: 45,
                gender: 'Male',
                phone: '+1234567892',
                address: '789 Pine Rd, City, State',
                bloodGroup: 'B+'
            },

            // Doctors with DOC format
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
            {
                username: 'DOC004',
                password: 'ORTHOPEDICS2024',
                role: 'doctor',
                name: 'Dr. Sarah Johnson',
                email: 'sarah.johnson@example.com',
                department: 'Orthopedics',
                specialization: 'Orthopedic Surgeon'
            },
            {
                username: 'DOC005',
                password: 'PEDIATRICS2024',
                role: 'doctor',
                name: 'Dr. Michael Chen',
                email: 'michael.chen@example.com',
                department: 'Pediatrics',
                specialization: 'Pediatrician'
            },

            // Reception staff
            {
                username: 'reception1',
                password: 'reception123',
                role: 'reception',
                name: 'Reception Staff',
                email: 'reception@example.com'
            },
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

            // Admin users
            {
                username: 'admin1',
                password: 'admin123',
                role: 'admin',
                name: 'System Administrator',
                email: 'admin@example.com'
            },
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
        const createdUsers = [];
        for (const userData of testUsers) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password, salt);

            const user = new User({
                ...userData,
                password: hashedPassword
            });

            await user.save();
            createdUsers.push(user);
            console.log(`Created user: ${user.username} (${user.role})`);
        }

        console.log('Users seeded successfully!');
        return createdUsers;
    } catch (error) {
        console.error('Error seeding users:', error);
        throw error;
    }
};

// Seed patients based on patient users
const seedPatients = async (users) => {
    try {
        const patientUsers = users.filter(user => user.role === 'patient');
        const createdPatients = [];

        for (const user of patientUsers) {
            const patientData = {
                userId: user._id,
                medicalHistory: {
                    conditions: [],
                    surgeries: [],
                    chronicDiseases: []
                },
                allergies: [],
                medications: {},
                emergencyContact: {
                    name: '',
                    relationship: '',
                    phone: ''
                },
                bloodType: user.bloodGroup || 'Unknown',
                height: Math.floor(Math.random() * 50) + 150, // Random height between 150-200cm
                weight: Math.floor(Math.random() * 50) + 50, // Random weight between 50-100kg
                lastVisit: new Date()
            };

            const patient = new Patient(patientData);
            await patient.save();
            createdPatients.push(patient);
            console.log(`Created patient record for: ${user.username}`);
        }

        console.log('Patients seeded successfully!');
        return createdPatients;
    } catch (error) {
        console.error('Error seeding patients:', error);
        throw error;
    }
};

// Seed appointments
const seedAppointments = async (users, patients) => {
    try {
        const doctorUsers = users.filter(user => user.role === 'doctor');
        const createdAppointments = [];

        // Create sample appointments
        const appointmentsData = [
            {
                patientId: patients[0]._id,
                doctorId: doctorUsers[0]._id,
                scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
                status: 'scheduled',
                priority: 'normal',
                symptoms: 'Regular checkup',
                notes: 'Annual physical examination'
            },
            {
                patientId: patients[1]._id,
                doctorId: doctorUsers[1]._id,
                scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // In 2 days
                status: 'scheduled',
                priority: 'urgent',
                symptoms: 'Headache and dizziness',
                notes: 'Patient reports persistent headaches'
            },
            {
                patientId: patients[0]._id,
                doctorId: doctorUsers[2]._id,
                scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
                status: 'completed',
                priority: 'normal',
                symptoms: 'Follow-up visit',
                diagnosis: 'Minor hypertension',
                treatment: 'Prescribed medication and lifestyle changes',
                notes: 'Patient responding well to treatment'
            }
        ];

        for (const apptData of appointmentsData) {
            const appointment = new Appointment(apptData);
            await appointment.save();
            createdAppointments.push(appointment);
            console.log(`Created appointment: Patient ${apptData.patientId} with Doctor ${apptData.doctorId}`);
        }

        console.log('Appointments seeded successfully!');
        return createdAppointments;
    } catch (error) {
        console.error('Error seeding appointments:', error);
        throw error;
    }
};

// Seed activity logs
const seedActivityLogs = async (users) => {
    try {
        const createdLogs = [];

        // Create sample activity logs
        const activities = [
            {
                userId: users.find(u => u.username === 'patient1')._id,
                action: 'login',
                details: 'User logged in to the system',
                ipAddress: '192.168.1.100'
            },
            {
                userId: users.find(u => u.username === 'DOC001')._id,
                action: 'view_appointment',
                details: 'Doctor viewed appointment details',
                ipAddress: '192.168.1.101'
            },
            {
                userId: users.find(u => u.username === 'admin1')._id,
                action: 'update_profile',
                details: 'Admin updated user profile',
                ipAddress: '192.168.1.102'
            }
        ];

        for (const activityData of activities) {
            const activity = new ActivityLog(activityData);
            await activity.save();
            createdLogs.push(activity);
            console.log(`Created activity log: ${activity.action}`);
        }

        console.log('Activity logs seeded successfully!');
        return createdLogs;
    } catch (error) {
        console.error('Error seeding activity logs:', error);
        throw error;
    }
};

// Seed knowledge articles
const seedKnowledgeArticles = async () => {
    try {
        const articles = [
            {
                title: 'Benefits of Regular Exercise',
                content: 'Regular exercise has numerous health benefits including improved cardiovascular health, stronger muscles and bones, better mental health, and reduced risk of chronic diseases.',
                category: 'Fitness',
                author: 'Dr. Sarah Johnson'
            },
            {
                title: 'Healthy Eating Habits',
                content: 'Maintaining a balanced diet with plenty of fruits, vegetables, whole grains, and lean proteins can help prevent various health conditions and improve overall wellbeing.',
                category: 'Nutrition',
                author: 'Dr. Michael Chen'
            },
            {
                title: 'Stress Management Techniques',
                content: 'Effective stress management techniques include meditation, deep breathing exercises, regular physical activity, adequate sleep, and maintaining social connections.',
                category: 'Mental Health',
                author: 'Dr. Bhetapudi Manasa'
            }
        ];

        const createdArticles = [];
        for (const articleData of articles) {
            const article = new KnowledgeArticle(articleData);
            await article.save();
            createdArticles.push(article);
            console.log(`Created knowledge article: ${article.title}`);
        }

        console.log('Knowledge articles seeded successfully!');
        return createdArticles;
    } catch (error) {
        console.error('Error seeding knowledge articles:', error);
        throw error;
    }
};

// Main seeding function
const seedDatabase = async () => {
    try {
        // Connect to database
        await connectDB();

        console.log('Starting database seeding...');

        // Seed users
        const users = await seedUsers();

        // Seed patients
        const patients = await seedPatients(users);

        // Seed appointments
        await seedAppointments(users, patients);

        // Seed activity logs
        await seedActivityLogs(users);

        // Seed knowledge articles
        await seedKnowledgeArticles();

        console.log('Database seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

// Run the seeding function
if (require.main === module) {
    seedDatabase();
}

module.exports = { seedDatabase, seedUsers, seedPatients, seedAppointments, seedActivityLogs, seedKnowledgeArticles };