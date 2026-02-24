const express = require('express');
const router = express.Router();
const Vitals = require('../models/Vitals');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/vitals
// @desc    Record new vitals
// @access  Nurse, Doctor, Admin
router.post('/', protect, authorize('nurse', 'doctor', 'admin'), async (req, res) => {
    try {
        const {
            patientId,
            patientName,
            wardId,
            bedNumber,
            bloodPressure,
            temperature,
            pulse,
            spO2,
            respiratoryRate,
            weight,
            height,
            notes
        } = req.body;

        // Fetch nurse info
        const nurse = await User.findById(req.user.id);

        const vitals = new Vitals({
            patientId,
            patientName,
            recordedBy: req.user.id,
            nurseName: nurse ? nurse.name : 'Unknown Nurse',
            wardId,
            bedNumber,
            bloodPressure,
            temperature,
            pulse,
            spO2,
            respiratoryRate,
            weight,
            height,
            notes
        });

        await vitals.save();

        // Emit WebSocket alert if any vital is critical/high
        if (vitals.hasAlert && req.wsServer) {
            const alertPayload = {
                type: 'vitals_alert',
                vitals: vitals
            };

            // Broadcast to all nurses and doctors
            req.wsServer.broadcastToRole('nurse', alertPayload);
            req.wsServer.broadcastToRole('doctor', alertPayload);
        }

        res.status(201).json(vitals);
    } catch (error) {
        console.error('Error recording vitals:', error);
        res.status(500).json({ message: 'Server error while recording vitals' });
    }
});

// @route   GET /api/vitals/patient/:patientId
// @desc    Get vitals history for a patient
// @access  Nurse, Doctor, Admin
router.get('/patient/:patientId', protect, authorize('nurse', 'doctor', 'admin'), async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const vitals = await Vitals.find({ patientId: req.params.patientId })
            .sort({ recordedAt: -1 })
            .limit(limit);

        res.json(vitals);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching vitals history' });
    }
});

// @route   GET /api/vitals/latest/:patientId
// @desc    Get latest vitals for a patient
// @access  Nurse, Doctor, Admin, Patient
router.get('/latest/:patientId', protect, authorize('nurse', 'doctor', 'admin', 'patient'), async (req, res) => {
    try {
        const vitals = await Vitals.findOne({ patientId: req.params.patientId })
            .sort({ recordedAt: -1 });

        res.json(vitals);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching latest vitals' });
    }
});

// @route   GET /api/vitals/alerts
// @desc    Get all active alerts (last 24h)
// @access  Nurse, Doctor, Admin
router.get('/alerts', protect, authorize('nurse', 'doctor', 'admin'), async (req, res) => {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const alerts = await Vitals.find({
            hasAlert: true,
            recordedAt: { $gte: twentyFourHoursAgo }
        })
            .sort({ alertLevel: 1, recordedAt: -1 }); // critical first then by time

        // Custom sort to ensure 'critical' is truly first (if enum index isn't enough)
        alerts.sort((a, b) => {
            if (a.alertLevel === 'critical' && b.alertLevel !== 'critical') return -1;
            if (a.alertLevel !== 'critical' && b.alertLevel === 'critical') return 1;
            return 0;
        });

        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching vitals alerts' });
    }
});

// @route   GET /api/vitals/ward/:wardId
// @desc    Get today's vitals for a ward
// @access  Nurse, Admin
router.get('/ward/:wardId', protect, authorize('nurse', 'admin'), async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const vitals = await Vitals.find({
            wardId: req.params.wardId,
            recordedAt: { $gte: startOfDay }
        }).sort({ recordedAt: -1 });

        res.json(vitals);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching ward vitals' });
    }
});

module.exports = router;
