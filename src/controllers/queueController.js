const Queue = require('../models/Queue');
const User = require('../models/User');
const Patient = require('../models/Patient');

// Get all queue entries
exports.getAllQueueEntries = async (req, res) => {
    try {
        const queueEntries = await Queue.find()
            .populate('patientId', 'name')
            .populate('doctorId', 'name department');
        res.json(queueEntries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get queue entries by doctor ID
exports.getQueueByDoctorId = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const queueEntries = await Queue.find({ doctorId })
            .populate('patientId', 'name')
            .sort({ position: 1 });
        res.json(queueEntries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get queue entry by ID
exports.getQueueEntryById = async (req, res) => {
    try {
        const { id } = req.params;
        const queueEntry = await Queue.findById(id)
            .populate('patientId', 'name')
            .populate('doctorId', 'name department');

        if (!queueEntry) {
            return res.status(404).json({ message: 'Queue entry not found' });
        }

        res.json(queueEntry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new queue entry
exports.createQueueEntry = async (req, res) => {
    try {
        const { patientId, doctorId, position, estimatedWaitTime, status, priority } = req.body;

        // Validate patient and doctor exist
        const patient = await Patient.findById(patientId);
        const doctor = await User.findById(doctorId);

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // If adding emergency patient (position 1), shift all other positions
        if (position === 1) {
            await Queue.updateMany(
                { position: { $gte: 1 } },
                { $inc: { position: 1 } }
            );
        }

        const queueEntry = new Queue({
            patientId,
            doctorId,
            position,
            estimatedWaitTime,
            status,
            priority
        });

        const savedQueueEntry = await queueEntry.save();

        // Populate references before sending response
        await savedQueueEntry.populate('patientId', 'name');
        await savedQueueEntry.populate('doctorId', 'name department');

        res.status(201).json(savedQueueEntry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update queue entry
exports.updateQueueEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, position } = req.body;

        const queueEntry = await Queue.findById(id);
        if (!queueEntry) {
            return res.status(404).json({ message: 'Queue entry not found' });
        }

        // If status is being updated to completed, adjust positions of other entries
        if (status === 'completed' && queueEntry.status !== 'completed') {
            // Move all entries behind this one up by one position
            await Queue.updateMany(
                {
                    doctorId: queueEntry.doctorId,
                    position: { $gt: queueEntry.position }
                },
                { $inc: { position: -1 } }
            );
        }

        // Update the queue entry
        Object.assign(queueEntry, req.body);
        const updatedQueueEntry = await queueEntry.save();

        // Populate references before sending response
        await updatedQueueEntry.populate('patientId', 'name');
        await updatedQueueEntry.populate('doctorId', 'name department');

        res.json(updatedQueueEntry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete queue entry
exports.deleteQueueEntry = async (req, res) => {
    try {
        const { id } = req.params;

        const queueEntry = await Queue.findById(id);
        if (!queueEntry) {
            return res.status(404).json({ message: 'Queue entry not found' });
        }

        // Move all entries behind this one up by one position
        await Queue.updateMany(
            {
                doctorId: queueEntry.doctorId,
                position: { $gt: queueEntry.position }
            },
            { $inc: { position: -1 } }
        );

        await Queue.findByIdAndDelete(id);
        res.json({ message: 'Queue entry deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};