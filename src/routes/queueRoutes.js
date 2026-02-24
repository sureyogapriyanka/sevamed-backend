const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');
const { auth, authorize } = require('../middleware/auth');

// Apply auth to all queue routes
router.use(auth);

// Get all queue entries
router.get('/', authorize('admin', 'receptionist', 'reception', 'doctor', 'nurse'), queueController.getAllQueueEntries);

// Get queue entries by doctor ID
router.get('/doctor/:doctorId', authorize('admin', 'doctor'), queueController.getQueueByDoctorId);

// Get queue entry by ID
router.get('/:id', authorize('admin', 'receptionist', 'reception', 'doctor', 'nurse'), queueController.getQueueEntryById);

// Create new queue entry
router.post('/', authorize('admin', 'receptionist', 'reception'), queueController.createQueueEntry);

// Update queue entry
router.put('/:id', authorize('admin', 'receptionist', 'reception', 'doctor'), queueController.updateQueueEntry);

// Delete queue entry
router.delete('/:id', authorize('admin'), queueController.deleteQueueEntry);

module.exports = router;