const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');

// Create a new appointment
const createAppointment = async (req, res) => {
    try {
        const { patientId, doctorId, scheduledAt, status, priority, symptoms, diagnosis, treatment, notes } = req.body;

        // Validate patient exists
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Validate doctor exists
        const doctor = await User.findById(doctorId);
        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Create appointment
        const appointment = new Appointment({
            patientId,
            doctorId,
            scheduledAt,
            status,
            priority,
            symptoms,
            diagnosis,
            treatment,
            notes
        });

        await appointment.save();

        res.status(201).json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all appointments
const getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('patientId', 'name')
            .populate('doctorId', 'name');

        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get appointment by ID
const getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('patientId', 'name')
            .populate('doctorId', 'name');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update appointment
const updateAppointment = async (req, res) => {
    try {
        const { scheduledAt, status, priority, symptoms, diagnosis, treatment, notes } = req.body;

        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Update fields
        appointment.scheduledAt = scheduledAt || appointment.scheduledAt;
        appointment.status = status || appointment.status;
        appointment.priority = priority || appointment.priority;
        appointment.symptoms = symptoms || appointment.symptoms;
        appointment.diagnosis = diagnosis || appointment.diagnosis;
        appointment.treatment = treatment || appointment.treatment;
        appointment.notes = notes || appointment.notes;

        await appointment.save();

        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete appointment
const deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        await appointment.remove();

        res.json({ message: 'Appointment removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createAppointment,
    getAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment
};