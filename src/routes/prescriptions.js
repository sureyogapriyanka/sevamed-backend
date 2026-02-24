const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

// Apply auth to all routes
router.use(auth);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/prescriptions  — Create Prescription (doctor only)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', authorize('doctor'), async (req, res) => {
    try {
        const {
            patientId, patientName, patientAge, patientGender, patientBloodGroup,
            appointmentId,
            chiefComplaint, diagnosis, notes = '',
            medicines = [], labTests = [],
            followUpDate, followUpNotes = '',
        } = req.body;

        if (!patientId || !patientName) return res.status(400).json({ message: 'patientId and patientName are required' });
        if (!chiefComplaint) return res.status(400).json({ message: 'chiefComplaint is required' });
        if (!diagnosis) return res.status(400).json({ message: 'diagnosis is required' });
        if (!medicines.length) return res.status(400).json({ message: 'At least one medicine is required' });

        // Fetch doctor info to store in document
        const doctor = await User.findById(req.user._id).select('name specialization phone').lean();

        const prescription = new Prescription({
            patientId,
            patientName,
            patientAge: patientAge || null,
            patientGender: patientGender || '',
            patientBloodGroup: patientBloodGroup || '',
            doctorId: req.user._id,
            doctorName: doctor?.name || '',
            doctorSpecialization: doctor?.specialization || '',
            doctorPhone: doctor?.phone || '',
            appointmentId: appointmentId || null,
            chiefComplaint,
            diagnosis,
            notes,
            medicines,
            labTests,
            followUpDate: followUpDate || null,
            followUpNotes,
        });

        await prescription.save();
        res.status(201).json(prescription);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/prescriptions  — Get All (admin=all; doctor=own)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', authorize('admin', 'doctor'), async (req, res) => {
    try {
        const filter = {};
        if (req.user.role === 'doctor') filter.doctorId = req.user._id;
        if (req.query.patientId) filter.patientId = req.query.patientId;

        const prescriptions = await Prescription.find(filter)
            .populate('patientId', 'name')
            .sort({ issuedAt: -1 })
            .lean();

        res.json(prescriptions);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/prescriptions/patient/:patientId  (before /:id to avoid clash)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/patient/:patientId', authorize('admin', 'doctor', 'patient', 'pharmacist'), async (req, res) => {
    try {
        const prescriptions = await Prescription.find({ patientId: req.params.patientId })
            .sort({ issuedAt: -1 })
            .lean();
        res.json(prescriptions);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/prescriptions/appointment/:appointmentId
// ─────────────────────────────────────────────────────────────────────────────
router.get('/appointment/:appointmentId', authorize('admin', 'doctor', 'patient'), async (req, res) => {
    try {
        const prescription = await Prescription.findOne({ appointmentId: req.params.appointmentId })
            .populate('patientId', 'name')
            .populate('doctorId', 'name specialization')
            .lean();

        if (!prescription) return res.status(404).json({ message: 'Prescription not found for this appointment' });
        res.json(prescription);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/prescriptions/:id  — Single prescription
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', authorize('admin', 'doctor', 'patient', 'pharmacist'), async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id)
            .populate('patientId', 'name age gender bloodGroup phone')
            .populate('doctorId', 'name specialization phone')
            .lean();

        if (!prescription) return res.status(404).json({ message: 'Prescription not found' });
        res.json(prescription);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/prescriptions/:id  — Update (doctor, own, status=active)
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id', authorize('doctor'), async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id);
        if (!prescription) return res.status(404).json({ message: 'Prescription not found' });
        if (String(prescription.doctorId) !== String(req.user._id)) return res.status(403).json({ message: 'Access denied' });
        if (prescription.status !== 'active') return res.status(400).json({ message: 'Only active prescriptions can be updated' });

        const { diagnosis, notes, medicines, labTests, followUpDate, followUpNotes } = req.body;

        if (diagnosis !== undefined) prescription.diagnosis = diagnosis;
        if (notes !== undefined) prescription.notes = notes;
        if (medicines !== undefined) prescription.medicines = medicines;
        if (labTests !== undefined) prescription.labTests = labTests;
        if (followUpDate !== undefined) prescription.followUpDate = followUpDate;
        if (followUpNotes !== undefined) prescription.followUpNotes = followUpNotes;

        await prescription.save();
        res.json(prescription);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/prescriptions/:id  — Soft cancel
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', authorize('admin', 'doctor'), async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id);
        if (!prescription) return res.status(404).json({ message: 'Prescription not found' });

        prescription.status = 'cancelled';
        await prescription.save();
        res.json(prescription);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
