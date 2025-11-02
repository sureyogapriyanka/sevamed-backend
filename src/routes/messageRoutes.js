const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { auth } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(auth);

// Get messages between two users
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        // Find messages between the current user and the specified user
        const messages = await Message.find({
            $or: [
                { senderId: currentUserId, receiverId: userId },
                { senderId: userId, receiverId: currentUserId }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all messages for a user
router.get('/user', async (req, res) => {
    try {
        const currentUserId = req.user.id;

        // Find all messages where the user is either sender or receiver
        const messages = await Message.find({
            $or: [
                { senderId: currentUserId },
                { receiverId: currentUserId }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;