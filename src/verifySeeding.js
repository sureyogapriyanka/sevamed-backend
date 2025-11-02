const mongoose = require('mongoose');
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

// Verify seeded data
const verifySeeding = async () => {
    try {
        // Connect to database
        await connectDB();

        console.log('\n=== DATABASE SEEDING VERIFICATION ===\n');

        // Count users by role
        const totalUsers = await User.countDocuments();
        const patientCount = await User.countDocuments({ role: 'patient' });
        const doctorCount = await User.countDocuments({ role: 'doctor' });
        const receptionCount = await User.countDocuments({ role: 'reception' });
        const adminCount = await User.countDocuments({ role: 'admin' });

        console.log(`Total Users: ${totalUsers}`);
        console.log(`  - Patients: ${patientCount}`);
        console.log(`  - Doctors: ${doctorCount}`);
        console.log(`  - Reception: ${receptionCount}`);
        console.log(`  - Admins: ${adminCount}`);

        // Show sample users
        console.log('\n--- Sample Users ---');
        const sampleUsers = await User.find().limit(5);
        sampleUsers.forEach(user => {
            console.log(`  ${user.username} (${user.role}) - ${user.name}`);
        });

        // Count other collections
        const patientRecords = await Patient.countDocuments();
        const appointments = await Appointment.countDocuments();
        const activityLogs = await ActivityLog.countDocuments();
        const knowledgeArticles = await KnowledgeArticle.countDocuments();

        console.log(`\nPatient Records: ${patientRecords}`);
        console.log(`Appointments: ${appointments}`);
        console.log(`Activity Logs: ${activityLogs}`);
        console.log(`Knowledge Articles: ${knowledgeArticles}`);

        // Show sample appointments
        console.log('\n--- Sample Appointments ---');
        const sampleAppointments = await Appointment.find().populate('patientId').populate('doctorId').limit(3);
        sampleAppointments.forEach(appt => {
            console.log(`  Patient: ${appt.patientId?.name || 'N/A'} -> Doctor: ${appt.doctorId?.name || 'N/A'} (${appt.status})`);
        });

        // Show sample knowledge articles
        console.log('\n--- Sample Knowledge Articles ---');
        const sampleArticles = await KnowledgeArticle.find().limit(3);
        sampleArticles.forEach(article => {
            console.log(`  "${article.title}" by ${article.author}`);
        });

        // Show specific important users
        console.log('\n--- Important Users ---');
        const yogaUser = await User.findOne({ username: 'ADM001' });
        if (yogaUser) {
            console.log(`  Yoga Priyanka (ADM001): ${yogaUser.name} - ${yogaUser.role}`);
        }

        const manasaUser = await User.findOne({ username: 'ADM002' });
        if (manasaUser) {
            console.log(`  Bhetapudi Manasa (ADM002): ${manasaUser.name} - ${manasaUser.role}`);
        }

        const bhavanaUser = await User.findOne({ username: 'ADM003' });
        if (bhavanaUser) {
            console.log(`  Bhimavarapu Bhavana (ADM003): ${bhavanaUser.name} - ${bhavanaUser.role}`);
        }

        console.log('\n=== VERIFICATION COMPLETE ===\n');
        process.exit(0);
    } catch (error) {
        console.error('Error verifying database seeding:', error);
        process.exit(1);
    }
};

// Run the verification function
if (require.main === module) {
    verifySeeding();
}