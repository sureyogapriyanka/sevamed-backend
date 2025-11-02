const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },
    action: {
        type: String,
        required: true,
        enum: [
            'login',
            'logout',
            'dashboard_visit',
            'view_appointment',
            'book_appointment',
            'chat_message',
            'view_medical_record',
            'update_profile',
            'view_prescription',
            'generate_ai_insight',
            'fitness_data_entry',
            'knowledge_article_view'
        ]
    },
    details: {
        type: String
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for better query performance
activityLogSchema.index({ userId: 1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);