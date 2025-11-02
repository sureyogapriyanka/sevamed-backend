const AIInsight = require('../models/AIInsight');
const Patient = require('../models/Patient');
const User = require('../models/User');

// Get AI insights by user ID
const getAIInsightsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const insights = await AIInsight.find({ userId })
            .sort({ createdAt: -1 }); // Sort by creation date descending (newest first)

        res.json(insights);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create a new AI insight
const createAIInsight = async (req, res) => {
    try {
        const { userId, type, content, priority, isActive } = req.body;

        // Validate user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create AI insight
        const insight = new AIInsight({
            userId,
            type,
            content,
            priority,
            isActive
        });

        await insight.save();

        res.status(201).json(insight);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Generate health suggestions (mock implementation)
const generateHealthSuggestions = async (req, res) => {
    try {
        const { patientData, userId } = req.body;

        // Validate user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Mock health suggestions based on patient data
        const suggestions = [];

        // Add suggestions based on age
        if (patientData.age && patientData.age > 60) {
            suggestions.push({
                userId,
                type: 'health_tip',
                content: 'As you age, regular checkups become more important. Consider scheduling a comprehensive health screening.',
                priority: 'high',
                isActive: true
            });
        }

        // Add suggestions based on vitals
        if (patientData.vitals) {
            if (patientData.vitals.heartRate && patientData.vitals.heartRate > 100) {
                suggestions.push({
                    userId,
                    type: 'health_tip',
                    content: 'Your recent heart rate readings are elevated. Consider stress reduction techniques and consult your doctor if this persists.',
                    priority: 'medium',
                    isActive: true
                });
            }

            if (patientData.vitals.bloodPressure) {
                // Simple check for high blood pressure
                const bpParts = patientData.vitals.bloodPressure.split('/');
                if (bpParts.length === 2) {
                    const systolic = parseInt(bpParts[0]);
                    if (systolic > 140) {
                        suggestions.push({
                            userId,
                            type: 'health_tip',
                            content: 'Your blood pressure readings are elevated. Consider reducing sodium intake and increasing physical activity.',
                            priority: 'high',
                            isActive: true
                        });
                    }
                }
            }
        }

        // Add a general suggestion
        suggestions.push({
            userId,
            type: 'health_tip',
            content: 'Stay hydrated and maintain a balanced diet for optimal health.',
            priority: 'low',
            isActive: true
        });

        // Save all suggestions
        const savedSuggestions = [];
        for (const suggestion of suggestions) {
            const insight = new AIInsight(suggestion);
            await insight.save();
            savedSuggestions.push(insight);
        }

        res.status(201).json(savedSuggestions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Generate workflow suggestions (mock implementation)
const generateWorkflowSuggestions = async (req, res) => {
    try {
        const { userId } = req.body;

        // Validate user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Mock workflow suggestions
        const suggestions = [
            {
                userId,
                type: 'workflow_suggestion',
                content: 'Consider scheduling routine checkups to stay ahead of potential health issues.',
                priority: 'medium',
                isActive: true
            },
            {
                userId,
                type: 'workflow_suggestion',
                content: 'Review your medication schedule to ensure optimal timing and effectiveness.',
                priority: 'low',
                isActive: true
            }
        ];

        // Save all suggestions
        const savedSuggestions = [];
        for (const suggestion of suggestions) {
            const insight = new AIInsight(suggestion);
            await insight.save();
            savedSuggestions.push(insight);
        }

        res.status(201).json(savedSuggestions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update AI insight
const updateAIInsight = async (req, res) => {
    try {
        const { type, content, priority, isActive } = req.body;

        const insight = await AIInsight.findById(req.params.id);
        if (!insight) {
            return res.status(404).json({ message: 'AI insight not found' });
        }

        // Update fields
        insight.type = type || insight.type;
        insight.content = content || insight.content;
        insight.priority = priority || insight.priority;
        insight.isActive = isActive !== undefined ? isActive : insight.isActive;

        await insight.save();

        res.json(insight);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete AI insight
const deleteAIInsight = async (req, res) => {
    try {
        const insight = await AIInsight.findById(req.params.id);
        if (!insight) {
            return res.status(404).json({ message: 'AI insight not found' });
        }

        await insight.remove();

        res.json({ message: 'AI insight removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getAIInsightsByUserId,
    createAIInsight,
    generateHealthSuggestions,
    generateWorkflowSuggestions,
    updateAIInsight,
    deleteAIInsight
};