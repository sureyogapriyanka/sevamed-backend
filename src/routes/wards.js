const express = require('express');
const router = express.Router();
const Ward = require('../models/Ward');
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/wards
// @desc    Get all wards
router.get('/', auth, authorize('nurse', 'doctor', 'admin', 'reception', 'receptionist'), async (req, res) => {
    try {
        const wards = await Ward.find({ isActive: true });
        res.json(wards);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching wards' });
    }
});

// @route   GET /api/wards/stats
// @desc    Get aggregated ward statistics
router.get('/stats', auth, authorize('nurse', 'doctor', 'admin', 'reception', 'receptionist'), async (req, res) => {
    try {
        const wards = await Ward.find({ isActive: true });
        let totalBeds = 0, available = 0, occupied = 0, maintenance = 0;
        const wardSummary = wards.map(w => {
            let wOcc = w.beds.filter(b => b.status === 'occupied').length;
            let wAvail = w.beds.filter(b => b.status === 'available').length;
            let wMaint = w.beds.filter(b => b.status === 'maintenance').length;
            totalBeds += w.totalBeds;
            available += wAvail;
            occupied += wOcc;
            maintenance += wMaint;
            return {
                id: w._id,
                wardName: w.wardName,
                wardCode: w.wardCode,
                floor: w.floor,
                totalBeds: w.totalBeds,
                available: wAvail,
                occupied: wOcc,
                maintenance: wMaint,
                occupancyRate: Math.round((wOcc / w.totalBeds) * 100)
            };
        });
        res.json({ totalBeds, available, occupied, maintenance, wards: wardSummary });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching stats' });
    }
});

// @route   POST /api/wards
// @desc    Create a new ward
// @access  Admin only
router.post('/', auth, authorize('admin'), async (req, res) => {
    try {
        const { wardName, wardCode, floor, totalBeds, wardType, nurseInCharge } = req.body;
        const beds = [];
        for (let i = 1; i <= totalBeds; i++) {
            const bedNumber = `${wardCode}-${String(i).padStart(2, '0')}`;
            beds.push({ bedNumber, status: 'available' });
        }
        const ward = new Ward({
            wardName, wardCode, floor, totalBeds,
            availableBeds: totalBeds, beds,
            wardType: wardType || 'general',
            nurseInCharge: nurseInCharge || ''
        });
        await ward.save();
        res.status(201).json(ward);
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ message: 'Ward code must be unique' });
        res.status(500).json({ message: 'Server error creating ward' });
    }
});

// @route   PUT /api/wards/:wardId
// @desc    Update ward details
// @access  Admin, Nurse
router.put('/:wardId', auth, authorize('admin', 'nurse'), async (req, res) => {
    try {
        const { wardName, floor, nurseInCharge, wardType, notes } = req.body;
        const ward = await Ward.findById(req.params.wardId);
        if (!ward) return res.status(404).json({ message: 'Ward not found' });
        if (wardName) ward.wardName = wardName;
        if (floor !== undefined) ward.floor = floor;
        if (nurseInCharge !== undefined) ward.nurseInCharge = nurseInCharge;
        if (wardType) ward.wardType = wardType;
        if (notes !== undefined) ward.notes = notes;
        await ward.save();
        res.json(ward);
    } catch (error) {
        res.status(500).json({ message: 'Server error updating ward' });
    }
});

// @route   DELETE /api/wards/:wardId
// @desc    Soft-delete (deactivate) a ward
// @access  Admin only
router.delete('/:wardId', auth, authorize('admin'), async (req, res) => {
    try {
        const ward = await Ward.findById(req.params.wardId);
        if (!ward) return res.status(404).json({ message: 'Ward not found' });
        ward.isActive = false;
        await ward.save();
        res.json({ message: 'Ward deactivated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deactivating ward' });
    }
});

// @route   PUT /api/wards/:wardId/bed/:bedNumber/assign
// @desc    Assign patient to a specific bed
router.put('/:wardId/bed/:bedNumber/assign', auth, authorize('nurse', 'admin', 'reception', 'receptionist'), async (req, res) => {
    try {
        const { patientId, patientName, assignedNurse, assignedNurseName, admissionNotes, diagnosisOnAdmission } = req.body;
        const { wardId, bedNumber } = req.params;
        const ward = await Ward.findById(wardId);
        if (!ward) return res.status(404).json({ message: 'Ward not found' });
        const bed = ward.beds.find(b => b.bedNumber === bedNumber);
        if (!bed) return res.status(404).json({ message: 'Bed not found' });
        if (bed.status === 'occupied') return res.status(400).json({ message: 'Bed is already occupied' });
        bed.status = 'occupied';
        bed.patientId = patientId;
        bed.patientName = patientName;
        bed.admittedAt = new Date();
        bed.assignedNurse = assignedNurse;
        bed.assignedNurseName = assignedNurseName;
        bed.admissionNotes = admissionNotes || '';
        bed.diagnosisOnAdmission = diagnosisOnAdmission || '';
        ward.availableBeds = ward.beds.filter(b => b.status === 'available').length;
        await ward.save();
        res.json(ward);
    } catch (error) {
        console.error('Error assigning bed:', error);
        res.status(500).json({ message: 'Server error during bed assignment' });
    }
});

// @route   PUT /api/wards/:wardId/bed/:bedNumber/discharge
// @desc    Discharge patient from bed
router.put('/:wardId/bed/:bedNumber/discharge', auth, authorize('nurse', 'admin', 'reception', 'receptionist'), async (req, res) => {
    try {
        const { dischargeNotes, dischargeReason } = req.body;
        const { wardId, bedNumber } = req.params;
        const ward = await Ward.findById(wardId);
        if (!ward) return res.status(404).json({ message: 'Ward not found' });
        const bed = ward.beds.find(b => b.bedNumber === bedNumber);
        if (!bed) return res.status(404).json({ message: 'Bed not found' });
        // Log discharge event
        if (!ward.dischargeLog) ward.dischargeLog = [];
        ward.dischargeLog.push({
            patientId: bed.patientId,
            patientName: bed.patientName,
            bedNumber: bed.bedNumber,
            admittedAt: bed.admittedAt,
            dischargedAt: new Date(),
            dischargeNotes: dischargeNotes || '',
            dischargeReason: dischargeReason || 'recovered',
            nurseId: bed.assignedNurse,
            nurseName: bed.assignedNurseName
        });
        bed.status = 'available';
        bed.patientId = null;
        bed.patientName = '';
        bed.admittedAt = null;
        bed.assignedNurse = null;
        bed.assignedNurseName = '';
        bed.admissionNotes = '';
        bed.diagnosisOnAdmission = '';
        ward.availableBeds = ward.beds.filter(b => b.status === 'available').length;
        await ward.save();
        res.json(ward);
    } catch (error) {
        res.status(500).json({ message: 'Server error during discharge' });
    }
});

// @route   PUT /api/wards/:wardId/bed/:bedNumber/maintenance
// @desc    Toggle bed maintenance status
router.put('/:wardId/bed/:bedNumber/maintenance', auth, authorize('nurse', 'admin'), async (req, res) => {
    try {
        const { reason } = req.body;
        const { wardId, bedNumber } = req.params;
        const ward = await Ward.findById(wardId);
        if (!ward) return res.status(404).json({ message: 'Ward not found' });
        const bed = ward.beds.find(b => b.bedNumber === bedNumber);
        if (!bed) return res.status(404).json({ message: 'Bed not found' });
        if (bed.status === 'occupied') return res.status(400).json({ message: 'Cannot set occupied bed to maintenance' });
        bed.status = bed.status === 'maintenance' ? 'available' : 'maintenance';
        bed.maintenanceReason = bed.status === 'maintenance' ? reason || 'Cleaning/Sanitization' : '';
        ward.availableBeds = ward.beds.filter(b => b.status === 'available').length;
        await ward.save();
        res.json(ward);
    } catch (error) {
        res.status(500).json({ message: 'Server error updating maintenance status' });
    }
});

// @route   PUT /api/wards/:wardId/bed/:bedNumber/transfer
// @desc    Transfer patient to another bed/ward
router.put('/:wardId/bed/:bedNumber/transfer', auth, authorize('nurse', 'admin'), async (req, res) => {
    try {
        const { targetWardId, targetBedNumber } = req.body;
        const { wardId, bedNumber } = req.params;
        const sourceWard = await Ward.findById(wardId);
        const targetWard = await Ward.findById(targetWardId);
        if (!sourceWard || !targetWard) return res.status(404).json({ message: 'Ward not found' });
        const sourceBed = sourceWard.beds.find(b => b.bedNumber === bedNumber);
        const targetBed = targetWard.beds.find(b => b.bedNumber === targetBedNumber);
        if (!sourceBed || !targetBed) return res.status(404).json({ message: 'Bed not found' });
        if (targetBed.status === 'occupied') return res.status(400).json({ message: 'Target bed is occupied' });
        // Copy patient info to target
        targetBed.status = 'occupied';
        targetBed.patientId = sourceBed.patientId;
        targetBed.patientName = sourceBed.patientName;
        targetBed.admittedAt = sourceBed.admittedAt;
        targetBed.assignedNurse = sourceBed.assignedNurse;
        targetBed.assignedNurseName = sourceBed.assignedNurseName;
        targetBed.admissionNotes = sourceBed.admissionNotes;
        targetBed.diagnosisOnAdmission = sourceBed.diagnosisOnAdmission;
        // Clear source bed
        sourceBed.status = 'available';
        sourceBed.patientId = null;
        sourceBed.patientName = '';
        sourceBed.admittedAt = null;
        sourceBed.assignedNurse = null;
        sourceBed.assignedNurseName = '';
        sourceWard.availableBeds = sourceWard.beds.filter(b => b.status === 'available').length;
        targetWard.availableBeds = targetWard.beds.filter(b => b.status === 'available').length;
        await sourceWard.save();
        await targetWard.save();
        res.json({ sourceWard, targetWard, message: 'Transfer successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during transfer' });
    }
});

// @route   GET /api/wards/:wardId/discharge-log
// @desc    Get discharge history for a ward
router.get('/:wardId/discharge-log', auth, authorize('nurse', 'admin', 'doctor'), async (req, res) => {
    try {
        const ward = await Ward.findById(req.params.wardId);
        if (!ward) return res.status(404).json({ message: 'Ward not found' });
        const log = (ward.dischargeLog || []).sort((a, b) => new Date(b.dischargedAt) - new Date(a.dischargedAt));
        res.json(log);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching discharge log' });
    }
});

// @route   POST /api/wards/:wardId/beds/add
// @desc    Add more beds to an existing ward
router.post('/:wardId/beds/add', auth, authorize('admin'), async (req, res) => {
    try {
        const { count } = req.body;
        const ward = await Ward.findById(req.params.wardId);
        if (!ward) return res.status(404).json({ message: 'Ward not found' });
        const start = ward.totalBeds + 1;
        for (let i = start; i < start + count; i++) {
            const bedNumber = `${ward.wardCode}-${String(i).padStart(2, '0')}`;
            ward.beds.push({ bedNumber, status: 'available' });
        }
        ward.totalBeds += count;
        ward.availableBeds += count;
        await ward.save();
        res.json(ward);
    } catch (error) {
        res.status(500).json({ message: 'Server error adding beds' });
    }
});

module.exports = router;
