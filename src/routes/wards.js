const express = require('express');
const router = express.Router();
const Ward = require('../models/Ward');
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/wards
// @desc    Get all wards
// @access  Nurse, Doctor, Admin, Reception
router.get('/', auth, authorize('nurse', 'doctor', 'admin', 'reception'), async (req, res) => {
    try {
        const wards = await Ward.find({ isActive: true });
        res.json(wards);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching wards' });
    }
});

// @route   POST /api/wards
// @desc    Create a new ward
// @access  Admin only
router.post('/', auth, authorize('admin'), async (req, res) => {
    try {
        const { wardName, wardCode, floor, totalBeds } = req.body;

        // Auto-generate beds
        const beds = [];
        for (let i = 1; i <= totalBeds; i++) {
            const bedNumber = `B-${String(i).padStart(2, '0')}`;
            beds.push({
                bedNumber,
                status: 'available'
            });
        }

        const ward = new Ward({
            wardName,
            wardCode,
            floor,
            totalBeds,
            availableBeds: totalBeds,
            beds
        });

        await ward.save();
        res.status(201).json(ward);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Ward code must be unique' });
        }
        res.status(500).json({ message: 'Server error creating ward' });
    }
});

// @route   PUT /api/wards/:wardId/bed/:bedNumber/assign
// @desc    Assign patient to a specific bed
// @access  Nurse, Admin, Reception
router.put('/:wardId/bed/:bedNumber/assign', auth, authorize('nurse', 'admin', 'reception'), async (req, res) => {
    try {
        const { patientId, patientName, assignedNurse, assignedNurseName } = req.body;
        const { wardId, bedNumber } = req.params;

        const ward = await Ward.findById(wardId);
        if (!ward) return res.status(404).json({ message: 'Ward not found' });

        const bed = ward.beds.find(b => b.bedNumber === bedNumber);
        if (!bed) return res.status(404).json({ message: 'Bed not found' });

        if (bed.status === 'occupied') {
            return res.status(400).json({ message: 'Bed is already occupied' });
        }

        bed.status = 'occupied';
        bed.patientId = patientId;
        bed.patientName = patientName;
        bed.admittedAt = new Date();
        bed.assignedNurse = assignedNurse;
        bed.assignedNurseName = assignedNurseName;

        await ward.save();
        res.json(ward);
    } catch (error) {
        console.error('Error assigning bed:', error);
        res.status(500).json({ message: 'Server error during bed assignment' });
    }
});

// @route   PUT /api/wards/:wardId/bed/:bedNumber/discharge
// @desc    Discharge patient from bed
// @access  Nurse, Admin, Reception
router.put('/:wardId/bed/:bedNumber/discharge', auth, authorize('nurse', 'admin', 'reception'), async (req, res) => {
    try {
        const { wardId, bedNumber } = req.params;

        const ward = await Ward.findById(wardId);
        if (!ward) return res.status(404).json({ message: 'Ward not found' });

        const bed = ward.beds.find(b => b.bedNumber === bedNumber);
        if (!bed) return res.status(404).json({ message: 'Bed not found' });

        bed.status = 'available';
        bed.patientId = null;
        bed.patientName = '';
        bed.admittedAt = null;
        bed.assignedNurse = null;
        bed.assignedNurseName = '';

        await ward.save();
        res.json(ward);
    } catch (error) {
        res.status(500).json({ message: 'Server error during discharge' });
    }
});

module.exports = router;
