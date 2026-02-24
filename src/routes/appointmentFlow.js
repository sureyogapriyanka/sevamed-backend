const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');
const { authorize } = require('../middleware/auth');
const WebSocket = require('ws');

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
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        appointment.status = 'dispensed';
        await appointment.save();

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
            query.status = { $in: ['completed', 'consulting'] };
        }

        const appointments = await Appointment.find(query)
            .populate({
                path: 'patientId',
                populate: { path: 'userId', select: 'name phone age gender bloodGroup' }
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

module.exports = router;
