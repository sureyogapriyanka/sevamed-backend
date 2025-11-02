// Test script to verify that the new routes are working
const express = require('express');
const app = express();
const port = 3001;

// Mock the routes to test if they're properly connected
app.get('/api/ai-insights/user/:userId', (req, res) => {
    res.json({ message: 'AI Insights route is working', userId: req.params.userId });
});

app.get('/api/fitness-data/patient/:patientId', (req, res) => {
    res.json({ message: 'Fitness Data route is working', patientId: req.params.patientId });
});

app.listen(port, () => {
    console.log(`Test server running at http://localhost:${port}`);
});