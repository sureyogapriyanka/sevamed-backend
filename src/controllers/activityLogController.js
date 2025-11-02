const ActivityLog = require('../models/ActivityLog');

// Get activity logs with optional filtering
const getActivityLogs = async (req, res) => {
    try {
        const { userId, action, range } = req.query;
        const filter = {};

        // Apply user filter
        if (userId) {
            filter.userId = userId;
        }

        // Apply action filter
        if (action) {
            filter.action = action;
        }

        // Apply date range filter
        if (range) {
            const now = new Date();
            let startDate;

            switch (range) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                    break;
                default:
                    startDate = new Date(0);
            }

            filter.timestamp = { $gte: startDate };
        }

        const activityLogs = await ActivityLog.find(filter)
            .sort({ timestamp: -1 })
            .limit(100); // Limit to prevent excessive data

        res.json(activityLogs);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create a new activity log
const createActivityLog = async (req, res) => {
    try {
        const { userId, action, details } = req.body;

        // Validate required fields
        if (!userId || !action) {
            return res.status(400).json({ message: 'userId and action are required' });
        }

        const activityLog = new ActivityLog({
            userId,
            action,
            details,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        await activityLog.save();

        res.status(201).json(activityLog);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete all activity logs (useful for testing)
const deleteActivityLogs = async (req, res) => {
    try {
        await ActivityLog.deleteMany({});
        res.json({ message: 'All activity logs deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getActivityLogs,
    createActivityLog,
    deleteActivityLogs
};