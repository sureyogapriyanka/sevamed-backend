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
const Prescription = require('./models/Prescription');
const Attendance = require('./models/Attendance');
const FitnessData = require('./models/FitnessData');
const KnowledgeArticle = require('./models/KnowledgeArticle');
const Vitals = require('./models/Vitals');
const Bill = require('./models/Bill');

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
        await Prescription.deleteMany({});
        await Vitals.deleteMany({});
        await Bill.deleteMany({});

        console.log('Cleared existing collections');

        // Create test users with different roles
        const testUsers = [
            // 1 Explicit Demo Patient
            {
                username: 'patient1', password: 'patient123', role: 'patient', name: 'Demo Patient',
                email: 'demo.patient@example.com', age: 35, gender: 'Male', phone: '+919876543200', address: 'Demo Address, Hyderabad', bloodGroup: 'O+'
            },
            // 50 Indian Patient Profiles for testing conditions
            ...(Array.from({ length: 50 }).map((_, i) => ({
                username: `patient${i + 2}`,
                password: 'patient123',
                role: 'patient',
                name: `${['Aarav', 'Vihaan', 'Vivaan', 'Ananya', 'Diya', 'Advik', 'Kabir', 'Anaya', 'Aaradhya', 'Ojas', 'Rohan', 'Neha', 'Aditya', 'Kavya', 'Rahul', 'Divya', 'Priya', 'Vikram', 'Anjali', 'Arjun', 'Sai', 'Kartik', 'Aisha', 'Pooja', 'Sneha', 'Nisha', 'Riya', 'Kiran', 'Amit', 'Sunil', 'Ajay', 'Vijay', 'Raj', 'Sanjay', 'Mukesh', 'Ramesh', 'Suresh', 'Dinesh', 'Mahesh', 'Ashok', 'Anand', 'Ganesh', 'Kishore', 'Mohan', 'Srinivas', 'Venkatesh', 'Ravi', 'Prakash', 'Deepak', 'Arnav'][i] || 'Demo'} ${['Patel', 'Sharma', 'Singh', 'Reddy', 'Gupta', 'Desai', 'Verma', 'Iyer', 'Joshi', 'Nair', 'Kumar', 'Rao', 'Choudhury', 'Das', 'Mukherjee', 'Banerjee', 'Chatterjee', 'Bose', 'Mitra', 'Dutta', 'Ghosh', 'Sen', 'Sinha', 'Roy', 'Mehta', 'Shah', 'Modi', 'Gandhi', 'Thakkar', 'Soni', 'Chauhan', 'Rajput', 'Mishra', 'Pandey', 'Tiwari', 'Shukla', 'Dubey', 'Tripathi', 'Bhatt', 'Kaul', 'Raina', 'Kachroo', 'Tickoo', 'Zutshi', 'Mattoo', 'Qazi', 'Gowda', 'Naidu', 'Chauhan', 'Pillai'][i] || 'User'}`,
                email: `patient${i + 2}@example.com`,
                age: 20 + (i % 55),
                gender: i % 2 === 0 ? 'Male' : 'Female',
                phone: `+9198765432${String(i + 1).padStart(2, '0')}`,
                address: ['Banjara Hills', 'Jubilee Hills', 'Madhapur', 'Kondapur', 'Gachibowli'][i % 5] + ', Hyderabad',
                bloodGroup: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'][i % 8]
            }))),

            // 3 Doctors (1 default + 2 others)
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

            // 1 Receptionist
            {
                username: 'REC001',
                password: 'RECEPTION2024',
                role: 'receptionist',
                name: 'Monika',
                email: 'monika@example.com'
            },

            // 3 Admins
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
            },
            // Nurse and Pharmacist users
            {
                username: 'NUR001',
                password: 'NURSE2024',
                role: 'nurse',
                name: 'Bhetapudi Manasa',
                email: 'bhetapudi.nurse@example.com'
            },
            {
                username: 'NUR002',
                password: 'PAT2024',
                role: 'nurse',
                name: 'Rohan Gupta',
                email: 'rohan.g@example.com'
            },
            {
                username: 'PHAR001',
                password: 'PHAR2024',
                role: 'pharmacist',
                name: 'Anjali Sharma',
                email: 'anjali.s@example.com'
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
                lastVisit: new Date(),
                aadhaarNumber: String(Math.floor(100000000000 + Math.random() * 900000000000)), // 12 digit string
                mobileNumber: '+91' + String(Math.floor(6000000000 + Math.random() * 3999999999)), // 10 digit Indian number
                mobileVerified: true
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

        // Create 51 demo appointments across 3 primary doctors
        const symptomsList = [
            { s: 'Severe chest pain, shortness of breath', p: 'urgent', n: 'Needs immediate ECG' },
            { s: 'Palpitations', p: 'normal', n: 'Routine checkup' },
            { s: 'High blood pressure', p: 'normal', n: 'Follow-up for BP' },
            { s: 'Chronic migraines', p: 'normal', n: 'Assess for triggers' },
            { s: 'Dizziness and blurred vision', p: 'urgent', n: 'Neurological exam' },
            { s: 'Numbness in left arm', p: 'normal', n: 'Check nerve conduction' },
            { s: 'Memory gaps', p: 'normal', n: 'Follow up', d: 'Mild Cognitive Impairment', t: 'Cognitive exercises' },
            { s: 'Severe trauma from fall', p: 'critical', n: 'Patient requires immediate stabilization' },
            { s: 'Allergic reaction, swelling', p: 'urgent', n: 'Administer antihistamines' },
            { s: 'Asthma attack', p: 'critical', n: 'Stable now', d: 'Acute Exacerbation', t: 'Nebulization' },
            { s: 'Fever and chills', p: 'normal', n: 'Prescribe antipyretics' },
            { s: 'Stomach ache', p: 'normal', n: 'Recommend ultrasound' },
            { s: 'Joint pain', p: 'normal', n: 'Refer to Orthopedics' },
            { s: 'Skin rash', p: 'normal', n: 'Prescribe topical cream' },
            { s: 'Persistent cough', p: 'urgent', n: 'Chest X-ray needed' }
        ];

        const appointmentsData = [];
        const nurses = users.filter(user => user.role === 'nurse');

        // 1. 30 Completed Patients (10 per doctor)
        for (let i = 1; i <= 30; i++) {
            const docIndex = Math.floor((i - 1) / 10); // 0, 1, or 2
            const nurseIndex = i <= 15 ? 0 : 1; // 1-15 -> NUR001, 16-30 -> NUR002
            const symp = symptomsList[i % symptomsList.length];
            const schedTime = new Date(Date.now() - (60 * i) * 60000); // past
            appointmentsData.push({
                patientId: patients[i]?._id,
                doctorId: doctorUsers[docIndex]?._id,
                scheduledAt: schedTime, // past
                status: 'completed',
                priority: symp.p,
                symptoms: symp.s,
                notes: symp.n,
                diagnosis: symp.d || 'Routine Analysis',
                treatment: symp.t || 'Rest and medication',
                // Additional historical tracking for nurses
                vitalsRecordedBy: nurses[nurseIndex]?._id,
                vitalsRecordedAt: new Date(schedTime.getTime() - 15 * 60000),
                checkedInAt: new Date(schedTime.getTime() - 30 * 60000),
                consultationStartedAt: schedTime,
                consultationEndedAt: new Date(schedTime.getTime() + 15 * 60000),
                completedAt: new Date(schedTime.getTime() + 20 * 60000),
                opdFeePaid: true,
                opdFeeCollectedAt: new Date(schedTime.getTime() - 30 * 60000),
                opdFeePaymentMethod: ['upi', 'card', 'cash'][i % 3]
            });
        }

        // 2. 20 Active / Queued Patients (Assigning all to Doctor 1 for demo purposes)
        for (let i = 31; i <= 50; i++) {
            const docIndex = 0; // Assign all to Doc1 so they see 20 in queue
            const symp = symptomsList[i % symptomsList.length];
            // Set all to 'vitals_done' so they appear in the doctor's queue management
            const status = 'vitals_done';
            appointmentsData.push({
                patientId: patients[i]?._id,
                doctorId: doctorUsers[docIndex]?._id,
                scheduledAt: new Date(Date.now() + (15 * (i - 30)) * 60000),
                status: status,
                priority: symp.p,
                symptoms: symp.s,
                notes: symp.n
            });
        }

        // 3. Explicit Active Appointment for the Demo Patient (patient 0)
        appointmentsData.push({
            patientId: patients[0]?._id,
            doctorId: doctorUsers[0]?._id, // Assign to default doctor DOC001
            scheduledAt: new Date(Date.now() + 10 * 60000),
            status: 'vitals_done',
            priority: 'normal',
            symptoms: 'Routine Checkup and Platform Demo',
            notes: 'Demo Patient'
        });

        for (const apptData of appointmentsData) {
            const appointment = new Appointment(apptData);
            await appointment.save();
            createdAppointments.push(appointment);
            console.log(`Created appointment: Patient ${apptData.patientId} with Doctor ${apptData.doctorId}`);

            // If appointment is active (consulting or booked), add to Queue
            if (apptData.status === 'consulting' || apptData.status === 'booked') {
                const queueStatus = apptData.status === 'consulting' ? 'in-consultation' : 'waiting';
                const queueEntry = new Queue({
                    patientId: apptData.patientId,
                    doctorId: apptData.doctorId,
                    position: Math.floor(Math.random() * 5) + 1,
                    estimatedWaitTime: Math.floor(Math.random() * 30) + 5,
                    status: queueStatus,
                    priority: apptData.priority
                });
                await queueEntry.save();
                console.log(`Added patient ${apptData.patientId} to Queue for Doctor ${apptData.doctorId}`);
            }
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
                userId: users.find(u => u.username === 'ADM001')._id,
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

// Seed prescriptions
const seedPrescriptions = async (users, patients, appointments) => {
    try {
        const doctorUsers = users.filter(user => user.role === 'doctor');
        const createdPrescriptions = [];

        // Generate detailed prescriptions for completed consulting/booked cases randomly covering the 50 patients
        const prescriptionsData = appointments.map((appt, i) => {
            if (appt.status !== 'completed' && appt.status !== 'consulting') return null; // Only give rx to some patients
            const patient = patients.find(p => String(p._id) === String(appt.patientId));
            const doc = doctorUsers.find(d => String(d._id) === String(appt.doctorId));
            if (!patient || !doc) return null;

            // Look up the actual user to get the name
            const patientUser = users.find(u => String(u._id) === String(patient.userId));
            const patientName = patientUser ? patientUser.name : `Patient ${i + 1}`;

            return {
                patientId: patient._id, doctorId: doc._id, appointmentId: appt._id,
                patientName: patientName, patientAge: 30 + (i % 30), patientGender: i % 2 === 0 ? 'Male' : 'Female', patientBloodGroup: 'O+',
                doctorName: doc.name, doctorSpecialization: doc.specialization, doctorPhone: '+1234567890',
                chiefComplaint: appt.symptoms || 'General Checkup', diagnosis: appt.diagnosis || 'Routine review', notes: appt.notes || 'Follow-up prescribed',
                medicines: [
                    { name: ['Aspirin', 'Paracetamol', 'Amoxicillin', 'Ibuprofen', 'Ciprofloxacin'][i % 5], dosage: '50mg', frequency: 'Once daily', duration: '5 days', timing: 'after_meal', instructions: 'Take on time' },
                    { name: ['Vitamin C', 'B Complex', 'Calcium', 'Iron', 'Zinc'][i % 5], dosage: '1 tab', frequency: 'Once daily', duration: '15 days', timing: 'with_meal', instructions: 'Supplement' }
                ],
                // Exactly half of the completed patients (first 15) get their medication cleared ('completed'), the other half are pending ('active')
                status: i < 15 ? 'completed' : 'active'
            };
        }).filter(rx => rx !== null);

        for (const prescData of prescriptionsData) {
            const prescription = new Prescription(prescData);
            await prescription.save();
            createdPrescriptions.push(prescription);
            console.log(`Created prescription for Patient ${prescData.patientName} by Doctor ${prescData.doctorName}`);
        }

        console.log('Prescriptions seeded successfully!');
        return createdPrescriptions;
    } catch (error) {
        console.error('Error seeding prescriptions:', error);
        throw error;
    }
};

// Seed Vitals for completed appointments
const seedVitals = async (users, patients, appointments) => {
    try {
        const createdVitals = [];
        const completedAppts = appointments.filter(a => a.status === 'completed');

        for (const appt of completedAppts) {
            const patient = patients.find(p => String(p._id) === String(appt.patientId));
            const nurse = users.find(u => String(u._id) === String(appt.vitalsRecordedBy));
            if (!patient || !nurse) continue;

            const patientUser = users.find(u => String(u._id) === String(patient.userId));
            const patientName = patientUser ? patientUser.name : 'Unknown Patient';

            const vitalsData = {
                patientId: patient._id,
                patientName: patientName,
                recordedBy: nurse._id,
                nurseName: nurse.name,
                bloodPressure: {
                    systolic: Math.floor(Math.random() * (140 - 110 + 1)) + 110,
                    diastolic: Math.floor(Math.random() * (90 - 70 + 1)) + 70,
                },
                temperature: {
                    value: parseFloat((Math.random() * (37.5 - 36.1) + 36.1).toFixed(1)),
                },
                pulse: {
                    value: Math.floor(Math.random() * (95 - 65 + 1)) + 65,
                },
                spO2: {
                    value: Math.floor(Math.random() * (100 - 95 + 1)) + 95,
                },
                respiratoryRate: {
                    value: Math.floor(Math.random() * (20 - 12 + 1)) + 12,
                },
                weight: patient.weight || 70,
                height: patient.height || 170,
                notes: `Symptoms during checkup: ${appt.symptoms}`,
                recordedAt: appt.vitalsRecordedAt || Date.now()
            };

            const vitals = new Vitals(vitalsData);
            await vitals.save();
            createdVitals.push(vitals);
            console.log(`Created vitals record for patient ${patientName} by nurse ${nurse.name}`);
        }
        console.log('Vitals seeded successfully!');
        return createdVitals;
    } catch (error) {
        console.error('Error seeding vitals:', error);
        throw error;
    }
};

// Seed Bills for the paid appointments
const seedBills = async (appointments, patients) => {
    try {
        const createdBills = [];
        const completedAppts = appointments.filter(a => a.status === 'completed');

        for (const appt of completedAppts) {
            const patient = patients.find(p => String(p._id) === String(appt.patientId));
            if (!patient) continue;

            const billData = {
                patientId: patient._id,
                patientName: patient.aadhaarNumber ? `Aadhaar: ${patient.aadhaarNumber}` : `Patient ${patient._id}`,
                appointmentId: appt._id,
                items: [
                    {
                        description: 'OPD Consultation Fee',
                        category: 'consultation',
                        quantity: 1,
                        unitPrice: appt.opdFee || 300,
                        total: appt.opdFee || 300
                    }
                ],
                subtotal: appt.opdFee || 300,
                taxPercent: 0,
                taxAmount: 0,
                discountPercent: 0,
                discountAmount: 0,
                grandTotal: appt.opdFee || 300,
                status: 'paid',
                paymentMethod: appt.opdFeePaymentMethod || 'cash',
                amountPaid: appt.opdFee || 300,
                balanceDue: 0,
                paidAt: appt.opdFeeCollectedAt || new Date()
            };

            const bill = new Bill(billData);
            await bill.save();
            createdBills.push(bill);
        }

        console.log(`Successfully generated ${createdBills.length} payment bills!`);
        return createdBills;
    } catch (error) {
        console.error('Error seeding bills:', error);
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
        const appointments = await seedAppointments(users, patients);

        // Seed prescriptions
        await seedPrescriptions(users, patients, appointments);

        // Seed vitals for completed patients
        await seedVitals(users, patients, appointments);

        // Seed comprehensive billing payment history
        await seedBills(appointments, patients);

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