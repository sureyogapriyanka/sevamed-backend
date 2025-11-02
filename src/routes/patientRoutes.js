const express = require('express');
const router = express.Router();
const {
    createPatient,
    getPatients,
    getPatientById,
    getPatientByUserId,
    updatePatient,
    deletePatient
} = require('../controllers/patientController');
const { auth, authorize } = require('../middleware/auth');

// All patient routes require authentication
router.use(auth);

// Admin and reception can perform all operations
// Doctors can view patients
// Patients can only view their own record
router.route('/')
    .post(authorize('admin', 'reception'), createPatient)
    .get(authorize('admin', 'reception', 'doctor'), getPatients);

router.route('/:id')
    .get(authorize('admin', 'reception', 'doctor'), getPatientById)
    .put(authorize('admin', 'reception'), updatePatient)
    .delete(authorize('admin', 'reception'), deletePatient);

// Get patient by user ID
router.route('/user/:userId')
    .get(authorize('admin', 'reception', 'doctor', 'patient'), getPatientByUserId);

module.exports = router;