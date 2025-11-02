const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');

// Get all queue entries
router.get('/', queueController.getAllQueueEntries);

// Get queue entries by doctor ID
router.get('/doctor/:doctorId', queueController.getQueueByDoctorId);

// Get queue entry by ID
router.get('/:id', queueController.getQueueEntryById);

// Create new queue entry
router.post('/', queueController.createQueueEntry);

// Update queue entry
router.put('/:id', queueController.updateQueueEntry);

// Delete queue entry
router.delete('/:id', queueController.deleteQueueEntry);

module.exports = router;