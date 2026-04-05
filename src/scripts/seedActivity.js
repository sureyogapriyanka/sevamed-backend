const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');
const Medicine = require('../models/Medicine');
const StockTransaction = require('../models/StockTransaction');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedActivity = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB for Activity Seeding...");

        // 1. Get references
        const patients = await Patient.find().limit(10);
        const doctor = await User.findOne({ role: 'doctor' });
        const meds = await Medicine.find().limit(5);

        if (!patients.length || !doctor || !meds.length) {
            console.error("Missing base data (patients, doctors, or medicines). Run seedMedicines first.");
            process.exit(1);
        }

        const today = new Date();
        const startOfToday = new Date(today.setHours(0,0,0,0));
        const endOfToday = new Date(today.setHours(23,59,59,999));

        // 2. Clear today's activity to avoid duplicates
        await Appointment.deleteMany({ scheduledAt: { $gte: startOfToday, $lte: endOfToday } });
        await StockTransaction.deleteMany({ createdAt: { $gte: startOfToday, $lte: endOfToday } });

        console.log("Seeding new clinical activity for today...");

        // 3. Create 'Dispensed' Appointments (Fulfillment History)
        const dispensedCount = 12;
        let totalUnitsDispensed = 0;

        for (let i = 0; i < dispensedCount; i++) {
            const patient = patients[i % patients.length];
            const appt = await Appointment.create({
                patientId: patient._id,
                doctorId: doctor._id,
                scheduledAt: new Date(),
                status: 'dispensed',
                priority: ['normal', 'urgent'][i % 2],
                completedAt: new Date(Date.now() - 3600000), // 1 hour ago
                tokenNumber: `T-${(i + 1).toString().padStart(3, '0')}`
            });

            // Create transactions for each dispensed appt
            for (const med of meds.slice(0, 2)) {
                const qty = Math.floor(Math.random() * 10) + 5;
                await StockTransaction.create({
                    medicineId: med._id,
                    medicineName: med.name,
                    transactionType: 'dispense',
                    quantity: -qty,
                    balanceAfter: med.currentStock - qty,
                    referenceId: appt._id.toString(),
                    notes: 'Self-checkout fulfillment',
                    performedBy: doctor._id // Mocking pharmacist
                });
                totalUnitsDispensed += qty;
            }
        }

        // 4. Create 'Ready' Appointments (Active Queue)
        const readyCount = 8;
        for (let i = 0; i < readyCount; i++) {
            const patient = patients[(i + 5) % patients.length];
            await Appointment.create({
                patientId: patient._id,
                doctorId: doctor._id,
                scheduledAt: new Date(),
                status: 'completed', // Payment done, ready for pharmacist
                priority: i === 0 ? 'critical' : 'normal',
                completedAt: new Date(),
                tokenNumber: `T-${(dispensedCount + i + 1).toString().padStart(3, '0')}`
            });
        }

        // 5. Create some System Alerts (Stock alerts)
        // (Handled by the medicine alerts query, ensuring some low stock exists)
        await Medicine.updateMany({ name: meds[0].name }, { currentStock: 5, stockStatus: 'low_stock' });

        console.log(`Successfully seeded:`);
        console.log(`- ${dispensedCount} Dispensed sessions`);
        console.log(`- ${readyCount} Patients in queue`);
        console.log(`- ${totalUnitsDispensed} Units of medicine tracked`);

        process.exit();
    } catch (err) {
        console.error("Activity seeding failed:", err);
        process.exit(1);
    }
};

seedActivity();
