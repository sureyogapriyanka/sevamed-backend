const express = require('express');
const router = express.Router();
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
router.get('/role/all', auth, authorize('admin'), getAllUsers);
router.get('/role/:role', auth, authorize('admin'), getUsersByRole);
router.put('/:id', auth, authorize('admin'), updateUserById);

module.exports = router;