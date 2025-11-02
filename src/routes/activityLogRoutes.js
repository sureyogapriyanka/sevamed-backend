const express = require('express');
const router = express.Router();
const { getActivityLogs, createActivityLog, deleteActivityLogs } = require('../controllers/activityLogController');
const { auth, authorize } = require('../middleware/auth');

// Public routes
router.post('/', createActivityLog);

// Protected routes
router.get('/', auth, getActivityLogs);
router.delete('/', auth, authorize('admin'), deleteActivityLogs);

module.exports = router;