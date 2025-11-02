const express = require('express');
const router = express.Router();
const {
    getAIInsightsByUserId,
    createAIInsight,
    generateHealthSuggestions,
    generateWorkflowSuggestions,
    updateAIInsight,
    deleteAIInsight
} = require('../controllers/aiInsightController');
const { auth, authorize } = require('../middleware/auth');

// All AI insight routes require authentication
router.use(auth);

// Get AI insights by user ID
router.route('/user/:userId')
    .get(authorize('admin', 'reception', 'doctor', 'patient'), getAIInsightsByUserId);

// Create a new AI insight (admin/reception only)
router.route('/')
    .post(authorize('admin', 'reception'), createAIInsight);

// Generate health suggestions
router.route('/generate/health')
    .post(authorize('admin', 'reception', 'doctor', 'patient'), generateHealthSuggestions);

// Generate workflow suggestions
router.route('/generate/workflow')
    .post(authorize('admin', 'reception', 'doctor'), generateWorkflowSuggestions);

// Individual AI insight routes
router.route('/:id')
    .put(authorize('admin', 'reception'), updateAIInsight)
    .delete(authorize('admin', 'reception'), deleteAIInsight);

module.exports = router;