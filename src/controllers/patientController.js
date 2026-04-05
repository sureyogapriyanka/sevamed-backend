const Patient = require('../models/Patient');
const User = require('../models/User');

// Create a new patient
const createPatient = async (req, res) => {
    try {
        const { userId, medicalHistory, allergies, medications, emergencyContact, bloodType, height, weight, bmi, lastVisit } = req.body;

        // Validate user exists and is a patient
        const user = await User.findById(userId);
        if (!user || user.role !== 'patient') {
            return res.status(404).json({ message: 'Patient user not found' });
        }

        // Check if patient record already exists
        const existingPatient = await Patient.findOne({ userId });
        if (existingPatient) {
            return res.status(400).json({ message: 'Patient record already exists' });
        }

        // Calculate BMI if height and weight are provided
        let calculatedBmi = bmi;
        if (height && weight) {
            calculatedBmi = (weight / Math.pow(height / 100, 2)).toFixed(1);
        }

        // Create patient
        const patient = new Patient({
            userId,
            medicalHistory,
            allergies,
            medications,
            emergencyContact,
            bloodType,
            height,
            weight,
            bmi: calculatedBmi,
            lastVisit
        });

        await patient.save();

        res.status(201).json(patient);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all patients (with optional search)
const getPatients = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            // Search in User model for name/phone, then map back to patients
            const users = await User.find({
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } },
                    { username: { $regex: search, $options: 'i' } }
                ],
                role: 'patient'
            }).select('_id');
            
            const userIds = users.map(u => u._id);
            query = { userId: { $in: userIds } };
        }

        const patients = await Patient.find(query).populate('userId', 'name username email age gender phone address bloodGroup');
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get patient by ID
const getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id).populate('userId', 'name username email age gender phone address bloodGroup');

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get patient by user ID
const getPatientByUserId = async (req, res) => {
    try {
        const patient = await Patient.findOne({ userId: req.params.userId }).populate('userId', 'name username email age gender phone address bloodGroup');

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update patient
const updatePatient = async (req, res) => {
    try {
        const { medicalHistory, allergies, medications, emergencyContact, bloodType, height, weight, bmi, lastVisit } = req.body;

        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Calculate BMI if height and weight are provided
        let calculatedBmi = bmi;
        if (height && weight) {
            calculatedBmi = (weight / Math.pow(height / 100, 2)).toFixed(1);
        }

        // Update fields
        patient.medicalHistory = medicalHistory || patient.medicalHistory;
        patient.allergies = allergies || patient.allergies;
        patient.medications = medications || patient.medications;
        patient.emergencyContact = emergencyContact || patient.emergencyContact;
        patient.bloodType = bloodType || patient.bloodType;
        patient.height = height || patient.height;
        patient.weight = weight || patient.weight;
        patient.bmi = calculatedBmi || patient.bmi;
        patient.lastVisit = lastVisit || patient.lastVisit;

        await patient.save();

        // Also update user information if provided
        const user = await User.findById(patient.userId);
        if (user) {
            // Populate user data with patient-specific fields
            res.json({
                ...patient.toObject(),
                userId: {
                    ...user.toObject(),
                    age: user.age,
                    gender: user.gender,
                    phone: user.phone,
                    address: user.address,
                    bloodGroup: user.bloodGroup
                }
            });
        } else {
            res.json(patient);
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete patient
const deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        await patient.remove();

        res.json({ message: 'Patient record removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createPatient,
    getPatients,
    getPatientById,
    getPatientByUserId,
    updatePatient,
    deletePatient
};