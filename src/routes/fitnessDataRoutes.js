const express = require('express');
const router = express.Router();
const {
    createFitnessData,
    getFitnessDataByPatientId,
    getFitnessDataById,
    updateFitnessData,
    deleteFitnessData
} = require('../controllers/fitnessDataController');
const { auth, authorize } = require('../middleware/auth');

// All fitness data routes require authentication
router.use(auth);

// Patients can create and view their own fitness data
// Admin and reception can perform all operations
router.route('/')
    .post(authorize('admin', 'reception', 'patient'), createFitnessData);

// Get fitness data by patient ID
router.route('/patient/:patientId')
    .get(authorize('admin', 'reception', 'patient', 'doctor'), getFitnessDataByPatientId);

// Individual fitness data entry routes
router.route('/:id')
    .get(authorize('admin', 'reception', 'patient', 'doctor'), getFitnessDataById)
    .put(authorize('admin', 'reception', 'patient'), updateFitnessData)
    .delete(authorize('admin', 'reception', 'patient'), deleteFitnessData);

module.exports = router;