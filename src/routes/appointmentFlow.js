const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const WebSocket = require('ws');
const { generateReport } = require('../services/documentService');

// Apply auth to all flow routes
router.use(auth);

// Helper to broadcast to specific roles via req.wsServer
const broadcastToRole = (wsServer, role, data) => {
    if (!wsServer) return;
    wsServer.broadcastToRole(role, { ...data, targetRole: role });
};

// ─── ROUTE 1: POST /checkin/:id (Receptionist Check-in) ─────────────────────
router.post('/checkin/:id', authorize('receptionist', 'reception', 'admin'), async (req, res) => {
    try {
        const { opdFee, paymentMethod } = req.body;
        const appointment = await Appointment.findById(req.params.id).populate('patientId');

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        if (appointment.status !== 'booked') {
            return res.status(400).json({ message: 'Only booked appointments can be checked in' });
        }

        // Generate Token Number (T-001 format)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const countToday = await Appointment.countDocuments({
            checkedInAt: { $gte: todayStart, $lte: todayEnd }
        });
        const tokenNumber = `T-${(countToday + 1).toString().padStart(3, '0')}`;

        appointment.status = 'checked_in';
        appointment.opdFee = opdFee || 300;
        appointment.opdFeePaid = true;
        appointment.opdFeePaymentMethod = paymentMethod || 'cash';
        appointment.opdFeeCollectedAt = Date.now();
        appointment.opdFeeCollectedBy = req.user.id;
        appointment.checkedInAt = Date.now();
        appointment.checkedInBy = req.user.id;
        appointment.tokenNumber = tokenNumber;

        appointment.notifications.push({
            role: 'nurse',
            message: `New patient checked in: ${appointment.patientId.name}. Please record vitals.`
        });

        await appointment.save();

        broadcastToRole(req.wsServer, 'nurse', {
            type: 'patient_checkin',
            appointmentId: appointment._id,
            patientName: appointment.patientId.name,
            tokenNumber: tokenNumber,
            message: 'New patient checked in - vitals needed'
        });

        res.json(appointment);
    } catch (err) {
        res.status(500).json({ message: 'Check-in error', error: err.message });
    }
});

// ─── ROUTE 2: POST /vitals-done/:id (Nurse completion) ──────────────────────
router.post('/vitals-done/:id', authorize('nurse', 'admin'), async (req, res) => {
    try {
        const { vitalsId } = req.body;
        const appointment = await Appointment.findById(req.params.id).populate('patientId');
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        appointment.status = 'vitals_done';
        appointment.vitalsRecordedAt = Date.now();
        appointment.vitalsRecordedBy = req.user.id;
        appointment.vitalsId = vitalsId;

        appointment.notifications.push({
            role: 'doctor',
            message: `Vitals recorded for ${appointment.patientId.name}. Ready for consultation.`
        });

        await appointment.save();

        broadcastToRole(req.wsServer, 'doctor', {
            type: 'vitals_complete',
            appointmentId: appointment._id,
            patientName: appointment.patientId.name,
            tokenNumber: appointment.tokenNumber,
            message: 'Patient vitals done - ready for consultation'
        });

        res.json(appointment);
    } catch (err) {
        res.status(500).json({ message: 'Vitals complete error', error: err.message });
    }
});

// ─── ROUTE 3: POST /start-consultation/:id (Doctor seeing patient) ──────────
router.post('/start-consultation/:id', authorize('doctor', 'admin'), async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id).populate('patientId');
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        appointment.status = 'consulting';
        appointment.consultationStartedAt = Date.now();
        await appointment.save();

        broadcastToRole(req.wsServer, 'nurse', { type: 'consultation_started', patientName: appointment.patientId.name, tokenNumber: appointment.tokenNumber });
        broadcastToRole(req.wsServer, 'receptionist', { type: 'consultation_started', patientName: appointment.patientId.name, tokenNumber: appointment.tokenNumber });

        res.json(appointment);
    } catch (err) {
        res.status(500).json({ message: 'Consultation start error', error: err.message });
    }
});

// ─── ROUTE 4: POST /end-consultation/:id (Doctor completion) ────────────────
router.post('/end-consultation/:id', authorize('doctor', 'admin'), async (req, res) => {
    try {
        const { prescriptionId } = req.body;
        const appointment = await Appointment.findById(req.params.id).populate('patientId doctorId');
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        appointment.status = 'consulted';
        appointment.consultationEndedAt = Date.now();
        appointment.prescriptionId = prescriptionId;

        appointment.notifications.push({
            role: 'receptionist',
            message: `Dr. ${appointment.doctorId.name} done with ${appointment.patientId.name}. Generate final bill.`
        });

        await appointment.save();

        broadcastToRole(req.wsServer, 'receptionist', {
            type: 'consultation_complete',
            appointmentId: appointment._id,
            patientName: appointment.patientId.name,
            tokenNumber: appointment.tokenNumber,
            doctorName: appointment.doctorId.name,
            message: 'Consultation done - please generate final bill'
        });

        res.json(appointment);
    } catch (err) {
        res.status(500).json({ message: 'Consultation end error', error: err.message });
    }
});

// ─── ROUTE 5: POST /generate-bill/:id (Reception generates bill) ───────────
router.post('/generate-bill/:id', authorize('receptionist', 'reception', 'admin'), async (req, res) => {
    try {
        const { billId } = req.body;
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        appointment.status = 'billing';
        appointment.finalBillGeneratedAt = Date.now();
        appointment.finalBillId = billId;
        await appointment.save();

        res.json(appointment);
    } catch (err) {
        res.status(500).json({ message: 'Bill generation error', error: err.message });
    }
});

// ─── ROUTE 6: POST /complete/:id (Payment collected) ────────────────────────
router.post('/complete/:id', authorize('receptionist', 'reception', 'admin'), async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id).populate('patientId');
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        appointment.status = 'completed';
        appointment.completedAt = Date.now();
        await appointment.save();

        broadcastToRole(req.wsServer, 'pharmacist', {
            type: 'payment_complete',
            appointmentId: appointment._id,
            patientName: appointment.patientId.name,
            message: 'Payment done - please dispense medicines'
        });

        res.json(appointment);
    } catch (err) {
        res.status(500).json({ message: 'Completion error', error: err.message });
    }
});

// ─── ROUTE 7: POST /dispensed/:id (Pharmacist dispensing) ───────────────────
router.post('/dispensed/:id', authorize('pharmacist', 'admin'), async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id).populate('patientId');
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        appointment.status = 'dispensed';
        
        appointment.notifications.push({
            role: 'patient',
            message: `Your prescription has been dispensed. You can view the digital receipt in your dashboard.`
        });

        await appointment.save();

        // Broadcast to patient
        broadcastToRole(req.wsServer, 'patient', {
            type: 'medicine_dispensed',
            appointmentId: appointment._id,
            patientName: appointment.patientId.name,
            message: 'Your medicines have been dispensed. Digital receipt is now available.'
        });

        res.json(appointment);
    } catch (err) {
        res.status(500).json({ message: 'Dispensing error', error: err.message });
    }
});

// ─── ROUTE 8: GET /flow/:id (Detailed Flow View) ────────────────────────────
router.get('/flow/:id', authorize('receptionist', 'reception', 'nurse', 'doctor', 'admin', 'pharmacist'), async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('patientId')
            .populate('doctorId', 'name specialization')
            .populate('checkedInBy', 'name')
            .populate('vitalsRecordedBy', 'name')
            .populate('vitalsId')
            .populate('prescriptionId')
            .populate('finalBillId');

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        res.json(appointment);
    } catch (err) {
        res.status(500).json({ message: 'Flow fetch error', error: err.message });
    }
});

// ─── ROUTE 9: GET /today (Live Operational List) ────────────────────────────
router.get('/today', authorize('receptionist', 'reception', 'nurse', 'doctor', 'admin', 'pharmacist'), async (req, res) => {
    try {
        // Show appointments from last 48h to now+24h (so seeded + future same-day show up)
        const windowStart = new Date(Date.now() - 48 * 60 * 60 * 1000);
        const windowEnd = new Date(Date.now() + 24 * 60 * 60 * 1000);

        let query = {
            scheduledAt: { $gte: windowStart, $lte: windowEnd }
        };

        if (req.user.role === 'nurse') {
            query.status = 'checked_in';
        } else if (req.user.role === 'doctor') {
            query.doctorId = req.user.id;
            query.status = { $in: ['vitals_done', 'consulting'] };
        } else if (req.user.role === 'pharmacist') {
            // Pharmacists see full clinical lifecycle for dispensing
            query.status = { $in: ['completed', 'dispensed', 'consulted', 'billing'] };
        }

        const appointments = await Appointment.find(query)
            .populate({
                path: 'patientId',
                populate: { path: 'userId', select: 'name phone age gender bloodGroup profileImage' }
            })
            .populate('doctorId', 'name specialization')
            .sort({ tokenNumber: 1, scheduledAt: 1 });

        // Normalise: add a top-level patientName for convenience
        const normalised = appointments.map(a => {
            const obj = a.toObject();
            obj.patientName = obj.patientId?.userId?.name ||
                obj.patientId?.name ||
                'Unknown';
            obj.patientPhone = obj.patientId?.userId?.phone ||
                obj.patientId?.mobileNumber || '';
            return obj;
        });

        res.json(normalised);
    } catch (err) {
        res.status(500).json({ message: 'Today list error', error: err.message });
    }
});

// ─── ROUTE 10: GET /latest-session/:patientId (For session intake) ───────
router.get('/latest-session/:patientId', authorize('pharmacist', 'admin', 'doctor', 'receptionist'), async (req, res) => {
    try {
        // Find most recent completed/consulted/billing/dispensing appointment
        const appointment = await Appointment.findOne({ 
            patientId: req.params.patientId,
            status: { $in: ['consulted', 'billing', 'completed', 'dispensed'] }
        })
        .sort({ scheduledAt: -1 })
        .populate('prescriptionId')
        .populate('doctorId', 'name')
        .populate({
            path: 'patientId',
            populate: { path: 'userId', select: 'name phone age gender bloodGroup' }
        });

        if (!appointment) {
            return res.json({ message: 'No doctor report detected', hasPrescription: false });
        }

        res.json({ ...appointment.toObject(), hasPrescription: !!appointment.prescriptionId });
    } catch (err) {
        res.status(500).json({ message: 'Latest session query error', error: err.message });
    }
});

// ─── ROUTE 11: GET /pharmacist-stats (Metrics for Dashboard) ───────────────
router.get('/pharmacist-stats', authorize('pharmacist', 'admin'), async (req, res) => {
    try {
        const StockTransaction = mongoose.model('StockTransaction');
        
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // 1. Total Medicines Dispensed (Units)
        const dispenseResult = await StockTransaction.aggregate([
            {
                $match: {
                    transactionType: 'dispense',
                    createdAt: { $gte: todayStart, $lte: todayEnd }
                }
            },
            {
                $group: {
                    _id: null,
                    totalUnits: { $sum: { $abs: "$quantity" } }
                }
            }
        ]);

        // 2. Active Ready-for-Dispensing (Completed but not dispensed yet)
        const readyCount = await Appointment.countDocuments({
            status: 'completed',
            scheduledAt: { $gte: todayStart, $lte: todayEnd }
        });

        // 3. Historical Fulfillment (Dispensed Today)
        const dispensedCount = await Appointment.countDocuments({
            status: 'dispensed',
            scheduledAt: { $gte: todayStart, $lte: todayEnd }
        });

        res.json({
            totalUnitsToday: dispenseResult[0]?.totalUnits || 0,
            readyCases: readyCount,
            dispensedCasesToday: dispensedCount
        });
    } catch (err) {
        res.status(500).json({ message: 'Stats calculation error', error: err.message });
    }
});

// ─── ROUTE 12: POST /report/:id (Generate Formal Report) ───────────────────
router.post('/report/:id', authorize('doctor', 'admin'), async (req, res) => {
    try {
        const { reportData } = req.body;
        const appointment = await Appointment.findById(req.params.id)
            .populate('patientId')
            .populate('doctorId', 'name');

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        const [pdfFile, docxFile] = await Promise.all([
            generateReport({
                ...reportData,
                appointmentId: appointment._id,
                patientName: appointment.patientId.userId?.name || appointment.patientId.name || 'Unknown Patient',
                doctorName: appointment.doctorId?.name || 'Dr. SevaMed',
                date: new Date().toLocaleDateString()
            }, 'pdf'),
            generateReport({
                ...reportData,
                appointmentId: appointment._id,
                patientName: appointment.patientId.userId?.name || appointment.patientId.name || 'Unknown Patient',
                doctorName: appointment.doctorId?.name || 'Dr. SevaMed',
                date: new Date().toLocaleDateString()
            }, 'docx')
        ]);

        appointment.reportUrl = `/uploads/reports/${pdfFile}`;
        appointment.reportDocxUrl = `/uploads/reports/${docxFile}`;
        await appointment.save();

        res.json({ 
            message: 'Reports generated successfully', 
            reportUrl: appointment.reportUrl,
            reportDocxUrl: appointment.reportDocxUrl 
        });
    } catch (err) {
        res.status(500).json({ message: 'Report generation error', error: err.message });
    }
});

module.exports = router;
