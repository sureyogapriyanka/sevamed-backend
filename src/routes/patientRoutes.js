const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const {
    createPatient,
    getPatients,
    getPatientById,
    getPatientByUserId,
    updatePatient,
    deletePatient
} = require('../controllers/patientController');
const { auth, authorize } = require('../middleware/auth');

// All patient routes require authentication
router.use(auth);

// Admin and reception can perform all operations
// Doctors can view patients
// Patients can only view their own record
router.route('/')
    .post(authorize('admin', 'receptionist', 'reception'), createPatient)
    .get(authorize('admin', 'receptionist', 'reception', 'doctor', 'nurse'), getPatients);

router.route('/:id')
    .get(authorize('admin', 'receptionist', 'reception', 'doctor', 'nurse'), getPatientById)
    .put(authorize('admin', 'receptionist', 'reception', 'doctor', 'nurse'), updatePatient)
    .delete(authorize('admin', 'receptionist', 'reception'), deletePatient);

// Get patient by user ID
router.route('/user/:userId')
    .get(authorize('admin', 'receptionist', 'reception', 'doctor', 'patient'), getPatientByUserId);

// ─── POST /register — Receptionist one-shot patient registration ──────────────
// Creates a User + Patient record in a single call
router.post('/register', authorize('admin', 'receptionist', 'reception'), async (req, res) => {
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');
    try {
        const {
            name, age, gender, bloodGroup, mobileNumber,
            aadhaarNumber, abhaId, address, state, district, city, pincode,
            insuranceProvider, policyNumber
        } = req.body;

        if (!name || !mobileNumber) {
            return res.status(400).json({ message: 'Name and mobile number are required' });
        }

        const username = `pat_${mobileNumber}`;
        const existing = await User.findOne({ username });
        if (existing) {
            return res.status(409).json({ message: `Patient with mobile ${mobileNumber} already exists (username: ${username})` });
        }

        const defaultPassword = `P#${mobileNumber.slice(-4)}`;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);

        const user = new User({
            username,
            password: hashedPassword,
            role: 'patient',
            name,
            age: parseInt(age) || 0,
            gender: gender || 'other',
            bloodGroup: bloodGroup || '',
            phone: mobileNumber,
            address: address || `${city || ''}, ${district || ''}, ${state || ''} - ${pincode || ''}`
        });
        await user.save();

        const patient = new Patient({
            userId: user._id,
            mobileNumber,
            aadhaarNumber: aadhaarNumber || '',
            abhaId: abhaId || '',
            state: state || '',
            district: district || '',
            city: city || '',
            pincode: pincode || '',
            insuranceProvider: insuranceProvider || '',
            policyNumber: policyNumber || '',
        });
        await patient.save();

        res.status(201).json({
            message: 'Patient registered successfully',
            username,
            defaultPassword,
            patient,
            user: { _id: user._id, name: user.name, username: user.username }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


// POST /send-otp (Send Mobile OTP)
router.post('/send-otp', authorize('admin', 'reception'), async (req, res) => {
    try {
        const { mobileNumber } = req.body;
        const patient = await Patient.findOne({ mobileNumber });

        if (!patient) {
            return res.status(404).json({ message: 'Patient with this mobile number not found' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60000); // 10 minutes

        patient.mobileOtp = otp;
        patient.mobileOtpExpiry = expiry;
        await patient.save();

        console.log(`[OTP] Sent to ${mobileNumber}: ${otp}`);

        res.json({
            message: 'OTP sent successfully',
            otp: otp // Included for testing as requested
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /verify-otp (Verify Mobile OTP)
router.post('/verify-otp', authorize('admin', 'reception', 'patient'), async (req, res) => {
    try {
        const { mobileNumber, otp } = req.body;
        const patient = await Patient.findOne({ mobileNumber });

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        if (patient.mobileOtp !== otp || new Date() > patient.mobileOtpExpiry) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        patient.mobileVerified = true;
        patient.mobileOtp = null;
        patient.mobileOtpExpiry = null;
        await patient.save();

        res.json({ verified: true, patient });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;