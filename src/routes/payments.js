const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const Patient = require('../models/Patient');
const { auth, authorize } = require('../middleware/auth');

// Apply JWT auth to all payment routes
router.use(auth);

// ─── ROUTE 1: POST /upi/generate-qr ──────────────────────────────────────────
router.post('/upi/generate-qr', authorize('reception', 'admin'), async (req, res) => {
    try {
        const { billId, amount, patientName } = req.body;
        const upiId = process.env.HOSPITAL_UPI_ID || 'sevaonline@paytm';
        const hospitalName = process.env.HOSPITAL_NAME || 'SevaOnline Hospital';

        // Format: upi://pay?pa={UPI_ID}&pn={HOSPITAL_NAME}&am={amount}&cu=INR&tn=Bill-{billId}
        const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(hospitalName)}&am=${amount}&cu=INR&tn=Bill-${billId}`;

        res.json({
            upiString,
            qrData: upiString,
            amount,
            billId
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ─── ROUTE 2: POST /cash/collect ─────────────────────────────────────────────
router.post('/cash/collect', authorize('reception', 'admin'), async (req, res) => {
    try {
        const { billId, amountReceived, amountTendered } = req.body;
        const bill = await Bill.findById(billId);

        if (!bill) return res.status(404).json({ message: 'Bill not found' });

        const change = Number(amountTendered) - Number(amountReceived);

        bill.status = 'paid';
        bill.paymentMethod = 'cash';
        bill.amountPaid = amountReceived;
        bill.balanceDue = 0;
        bill.paidAt = new Date();

        await bill.save();

        res.json({
            bill,
            change,
            receiptNumber: `RCP-${Date.now()}`
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ─── ROUTE 3: POST /upi/confirm ──────────────────────────────────────────────
router.post('/upi/confirm', authorize('reception', 'admin'), async (req, res) => {
    try {
        const { billId, upiTransactionId, amount } = req.body;

        if (!upiTransactionId) {
            return res.status(400).json({ message: 'UPI Transaction ID is required' });
        }

        const bill = await Bill.findById(billId);
        if (!bill) return res.status(404).json({ message: 'Bill not found' });

        bill.status = 'paid';
        bill.paymentMethod = 'upi';
        bill.upiTransactionId = upiTransactionId;
        bill.amountPaid = amount;
        bill.balanceDue = 0;
        bill.paidAt = new Date();

        await bill.save();
        res.json(bill);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ─── ROUTE 4: POST /card/collect ─────────────────────────────────────────────
router.post('/card/collect', authorize('reception', 'admin'), async (req, res) => {
    try {
        const { billId, amount, last4Digits, cardType } = req.body;

        const bill = await Bill.findById(billId);
        if (!bill) return res.status(404).json({ message: 'Bill not found' });

        bill.status = 'paid';
        bill.paymentMethod = 'card';
        bill.amountPaid = amount;
        bill.balanceDue = 0;
        bill.paidAt = new Date();
        bill.notes = `${bill.notes}\nCard: ${cardType.toUpperCase()} (xxxx-${last4Digits})`.trim();

        await bill.save();
        res.json(bill);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ─── ROUTE 5: POST /insurance/process ────────────────────────────────────────
router.post('/insurance/process', authorize('reception', 'admin'), async (req, res) => {
    try {
        const { billId, patientId, insuranceProvider, policyNumber, ayushmanCardNumber, coverageAmount } = req.body;

        const [bill, patient] = await Promise.all([
            Bill.findById(billId),
            Patient.findOne({ userId: patientId })
        ]);

        if (!bill) return res.status(404).json({ message: 'Bill not found' });

        if (ayushmanCardNumber && patient) {
            patient.isAyushmanBeneficiary = true;
            patient.ayushmanCardNumber = ayushmanCardNumber;
            await patient.save();
        }

        const coverage = Number(coverageAmount);
        bill.amountPaid = coverage;
        bill.paymentMethod = 'insurance';
        bill.insuranceProvider = insuranceProvider;
        bill.insurancePolicyNumber = policyNumber;
        bill.insuranceCoverage = coverage;

        if (coverage >= bill.grandTotal) {
            bill.status = 'paid';
            bill.balanceDue = 0;
            bill.paidAt = new Date();
        } else {
            bill.status = 'partially_paid';
            bill.balanceDue = bill.grandTotal - coverage;
        }

        await bill.save();
        res.json({ bill, balanceRemaining: bill.balanceDue });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ─── ROUTE 6: GET /receipt/:billId ───────────────────────────────────────────
router.get('/receipt/:billId', async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.billId).populate('patientId');
        if (!bill) return res.status(404).json({ message: 'Bill not found' });

        res.json({
            receiptNumber: `RCP-${bill._id.toString().slice(-6).toUpperCase()}`,
            hospitalName: process.env.HOSPITAL_NAME || 'SevaOnline Hospital',
            bill,
            printDate: new Date()
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
