const FitnessData = require('../models/FitnessData');
const Patient = require('../models/Patient');

// Create new fitness data entry
const createFitnessData = async (req, res) => {
    try {
        const { patientId, date, steps, waterIntake, sleepHours, exerciseMinutes, heartRate, bloodPressure, notes } = req.body;

        // Validate patient exists
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Create fitness data entry
        const fitnessData = new FitnessData({
            patientId,
            date,
            steps,
            waterIntake,
            sleepHours,
            exerciseMinutes,
            heartRate,
            bloodPressure,
            notes
        });

        await fitnessData.save();

        res.status(201).json(fitnessData);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all fitness data for a patient
const getFitnessDataByPatientId = async (req, res) => {
    try {
        const { patientId } = req.params;

        // Validate patient exists
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        const fitnessData = await FitnessData.find({ patientId })
            .sort({ date: -1 }); // Sort by date descending (newest first)

        res.json(fitnessData);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get fitness data by ID
const getFitnessDataById = async (req, res) => {
    try {
        const fitnessData = await FitnessData.findById(req.params.id);

        if (!fitnessData) {
            return res.status(404).json({ message: 'Fitness data not found' });
        }

        res.json(fitnessData);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update fitness data
const updateFitnessData = async (req, res) => {
    try {
        const { date, steps, waterIntake, sleepHours, exerciseMinutes, heartRate, bloodPressure, notes } = req.body;

        const fitnessData = await FitnessData.findById(req.params.id);
        if (!fitnessData) {
            return res.status(404).json({ message: 'Fitness data not found' });
        }

        // Update fields
        fitnessData.date = date || fitnessData.date;
        fitnessData.steps = steps !== undefined ? steps : fitnessData.steps;
        fitnessData.waterIntake = waterIntake !== undefined ? waterIntake : fitnessData.waterIntake;
        fitnessData.sleepHours = sleepHours || fitnessData.sleepHours;
        fitnessData.exerciseMinutes = exerciseMinutes !== undefined ? exerciseMinutes : fitnessData.exerciseMinutes;
        fitnessData.heartRate = heartRate !== undefined ? heartRate : fitnessData.heartRate;
        fitnessData.bloodPressure = bloodPressure || fitnessData.bloodPressure;
        fitnessData.notes = notes || fitnessData.notes;

        await fitnessData.save();

        res.json(fitnessData);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete fitness data
const deleteFitnessData = async (req, res) => {
    try {
        const fitnessData = await FitnessData.findById(req.params.id);
        if (!fitnessData) {
            return res.status(404).json({ message: 'Fitness data not found' });
        }

        await fitnessData.remove();

        res.json({ message: 'Fitness data removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createFitnessData,
    getFitnessDataByPatientId,
    getFitnessDataById,
    updateFitnessData,
    deleteFitnessData
};