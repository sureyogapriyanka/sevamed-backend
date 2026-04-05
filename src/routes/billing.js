const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const { auth, authorize } = require('../middleware/auth');

// Apply JWT auth to all billing routes
router.use(auth);

// ─── Helper: calculate all financial totals ───────────────────────────────────
function calcTotals(items, taxPercent = 0, discountPercent = 0) {
    const itemsWithTotal = items.map((item) => ({
        ...item,
        total: Number(((item.quantity || 1) * item.unitPrice).toFixed(2))
    }));

    const subtotal = Number(itemsWithTotal.reduce((sum, i) => sum + i.total, 0).toFixed(2));
    const taxAmount = Number(((subtotal * taxPercent) / 100).toFixed(2));
    const discountAmount = Number(((subtotal * discountPercent) / 100).toFixed(2));
    const grandTotal = Number((subtotal + taxAmount - discountAmount).toFixed(2));

    return { itemsWithTotal, subtotal, taxAmount, discountAmount, grandTotal };
}

// ─── ROUTE 1: POST / — Create Bill ───────────────────────────────────────────
router.post('/', authorize('admin', 'receptionist'), async (req, res) => {
    try {
        const {
            patientId, patientName, appointmentId,
            items = [], taxPercent = 0, discountPercent = 0, notes = '',
            status = 'pending', paymentMethod,
            insuranceProvider = '', insurancePolicyNumber = '', insuranceCoverage = 0
        } = req.body;

        if (!patientId || !patientName) {
            return res.status(400).json({ message: 'patientId and patientName are required' });
        }
        if (!items.length) {
            return res.status(400).json({ message: 'At least one bill item is required' });
        }

        const { itemsWithTotal, subtotal, taxAmount, discountAmount, grandTotal } =
            calcTotals(items, taxPercent, discountPercent);

        const bill = new Bill({
            patientId, patientName,
            appointmentId: appointmentId || null,
            items: itemsWithTotal,
            subtotal, taxPercent, taxAmount,
            discountPercent, discountAmount, grandTotal,
            balanceDue: grandTotal,
            status, notes,
            paymentMethod: paymentMethod || null,
            insuranceProvider, insurancePolicyNumber, insuranceCoverage,
            createdBy: req.user.id
        });

        await bill.save();
        res.status(201).json(bill);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ─── ROUTE 2: GET / — Get All Bills (with filters) ───────────────────────────
router.get('/', authorize('admin', 'receptionist'), async (req, res) => {
    try {
        const { status, patientId, startDate, endDate } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (patientId) filter.patientId = patientId;
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
        }

        const bills = await Bill.find(filter)
            .populate('patientId', 'name')
            .sort({ createdAt: -1 });

        res.json(bills);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ─── ROUTE 7: GET /stats/summary — Dashboard stats (must be before /:id) ─────
router.get('/stats/summary', authorize('admin', 'receptionist'), async (req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const [allBills, paidBills, pendingBills, todayPaid, statusCounts] = await Promise.all([
            Bill.countDocuments(),
            Bill.aggregate([
                { $match: { status: 'paid' } },
                { $group: { _id: null, total: { $sum: '$grandTotal' } } }
            ]),
            Bill.aggregate([
                { $match: { status: { $in: ['pending', 'partially_paid'] } } },
                { $group: { _id: null, total: { $sum: '$balanceDue' } } }
            ]),
            Bill.aggregate([
                { $match: { status: 'paid', paidAt: { $gte: todayStart, $lte: todayEnd } } },
                { $group: { _id: null, total: { $sum: '$grandTotal' } } }
            ]),
            Bill.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ])
        ]);

        res.json({
            totalBills: allBills,
            totalRevenue: paidBills[0]?.total ?? 0,
            pendingAmount: pendingBills[0]?.total ?? 0,
            todayRevenue: todayPaid[0]?.total ?? 0,
            billsByStatus: Object.fromEntries(statusCounts.map((s) => [s._id, s.count]))
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ─── ROUTE 8: GET /patient/:patientId — All bills for a patient ───────────────
router.get('/patient/:patientId', authorize('admin', 'receptionist', 'doctor'), async (req, res) => {
    try {
        const bills = await Bill.find({ patientId: req.params.patientId }).sort({ createdAt: -1 });
        res.json(bills);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ─── ROUTE 3: GET /:id — Get Single Bill ─────────────────────────────────────
router.get('/:id', authorize('admin', 'receptionist', 'doctor'), async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id)
            .populate('patientId')
            .populate('appointmentId');

        if (!bill) return res.status(404).json({ message: 'Bill not found' });
        res.json(bill);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ─── ROUTE 4: PUT /:id — Update Bill ─────────────────────────────────────────
router.put('/:id', authorize('admin', 'receptionist'), async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id);
        if (!bill) return res.status(404).json({ message: 'Bill not found' });
        if (bill.status === 'paid') {
            return res.status(400).json({ message: 'Cannot edit a paid bill' });
        }

        const {
            items = bill.items,
            taxPercent = bill.taxPercent,
            discountPercent = bill.discountPercent,
            notes = bill.notes
        } = req.body;

        const { itemsWithTotal, subtotal, taxAmount, discountAmount, grandTotal } =
            calcTotals(items, taxPercent, discountPercent);

        Object.assign(bill, {
            items: itemsWithTotal, subtotal, taxPercent, taxAmount,
            discountPercent, discountAmount, grandTotal,
            balanceDue: grandTotal - bill.amountPaid,
            notes
        });

        await bill.save();
        res.json(bill);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ─── ROUTE 5: PUT /:id/pay — Mark Bill as Paid ───────────────────────────────
router.put('/:id/pay', authorize('admin', 'receptionist'), async (req, res) => {
    try {
        const { paymentMethod, amountPaid } = req.body;
        const bill = await Bill.findById(req.params.id);
        if (!bill) return res.status(404).json({ message: 'Bill not found' });

        const paid = Number(amountPaid) || 0;
        bill.amountPaid = paid;
        bill.paymentMethod = paymentMethod || bill.paymentMethod;

        if (paid >= bill.grandTotal) {
            bill.status = 'paid';
            bill.balanceDue = 0;
            bill.paidAt = new Date();
        } else {
            bill.status = 'partially_paid';
            bill.balanceDue = Number((bill.grandTotal - paid).toFixed(2));
        }

        await bill.save();
        res.json(bill);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ─── ROUTE 6: PUT /:id/cancel — Cancel Bill ──────────────────────────────────
router.put('/:id/cancel', authorize('admin'), async (req, res) => {
    try {
        const bill = await Bill.findByIdAndUpdate(
            req.params.id,
            { status: 'cancelled' },
            { new: true }
        );
        if (!bill) return res.status(404).json({ message: 'Bill not found' });
        res.json(bill);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
