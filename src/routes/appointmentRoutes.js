const express = require('express');
const router = express.Router();
const {
    createAppointment,
    getAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment
} = require('../controllers/appointmentController');
const { auth, authorize } = require('../middleware/auth');

// All appointment routes require authentication
router.use(auth);

// Admin and reception can perform all operations
// Doctors can view and update their appointments
// Patients can view their appointments and create new ones
router.route('/')
    .post(authorize('admin', 'reception', 'patient'), createAppointment)
    .get(authorize('admin', 'reception', 'doctor', 'patient'), getAppointments);

router.route('/:id')
    .get(authorize('admin', 'reception', 'doctor', 'patient'), getAppointmentById)
    .put(authorize('admin', 'reception', 'doctor'), updateAppointment)
    .delete(authorize('admin', 'reception'), deleteAppointment);

module.exports = router;