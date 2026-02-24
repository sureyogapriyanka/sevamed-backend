const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { registerUser, loginUser, getUserProfile, updateUserProfile, getUserByUsername, getAllUsers, getUsersByRole, updateUserById } = require('../controllers/userController');
const { auth, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/username/:username', getUserByUsername); // New endpoint for getting user by username

// Protected routes
router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, updateUserProfile);

// Admin routes
router.get('/role/all', auth, authorize('admin', 'receptionist'), getAllUsers);
router.get('/role/:role', auth, authorize('admin', 'receptionist', 'doctor', 'nurse'), getUsersByRole);
router.put('/:id', auth, authorize('admin'), updateUserById);

// ─── Staff Management Routes (Admin only) ────────────────────────────────────

// ROUTE 1 — GET /staff/all — List all non-doctor / non-patient staff
router.get('/staff/all', auth, authorize('admin'), async (req, res) => {
    try {
        const staffRoles = ['nurse', 'receptionist', 'pharmacist'];
        const staff = await User.find({ role: { $in: staffRoles } }).select('-password');
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ROUTE 2 — POST /staff/add — Create a new staff member
router.post('/staff/add', auth, authorize('admin'), async (req, res) => {
    try {
        const { name, username, password, role, department, phone, email } = req.body;

        const validStaffRoles = ['nurse', 'receptionist', 'pharmacist'];
        if (!validStaffRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid staff role' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newStaff = new User({
            name,
            username,
            password: hashedPassword,
            role,
            department: department || '',
            phone: phone || '',
            email: email || ''
        });

        await newStaff.save();

        const staffResponse = newStaff.toObject();
        delete staffResponse.password;

        res.status(201).json(staffResponse);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ROUTE 3 — PUT /staff/:id — Update a staff member (no role or password changes)
router.put('/staff/:id', auth, authorize('admin'), async (req, res) => {
    try {
        const { name, department, phone, email, isActive } = req.body;

        const updatedStaff = await User.findByIdAndUpdate(
            req.params.id,
            { name, department, phone, email, isActive },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedStaff) {
            return res.status(404).json({ message: 'Staff member not found' });
        }

        res.json(updatedStaff);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ROUTE 4 — DELETE /staff/:id — Permanently remove a staff member
router.delete('/staff/:id', auth, authorize('admin'), async (req, res) => {
    try {
        const deletedStaff = await User.findByIdAndDelete(req.params.id);

        if (!deletedStaff) {
            return res.status(404).json({ message: 'Staff member not found' });
        }

        res.json({ message: 'Staff member removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;