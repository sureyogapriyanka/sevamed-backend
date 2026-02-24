const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const StockTransaction = require('../models/StockTransaction');
const Appointment = require('../models/Appointment');
const Bill = require('../models/Bill');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

// Helper for bill calculation (replicated from billing.js for consistency)
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

// ROUTE 1 — GET / (Get All Medicines)
router.get('/', authorize('pharmacist', 'admin', 'doctor'), async (req, res) => {
    try {
        const { search, category, stockStatus, expiryStatus } = req.query;
        let query = { isActive: true };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { genericName: { $regex: search, $options: 'i' } },
                { barcode: search }
            ];
        }

        if (category) query.category = category;
        if (stockStatus) query.stockStatus = stockStatus;
        if (expiryStatus) query.expiryStatus = expiryStatus;

        const medicines = await Medicine.find(query).sort({ name: 1 });
        res.json(medicines);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ROUTE 2 — GET /search (Quick search for dispensing)
router.get('/search', authorize('pharmacist', 'admin'), async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);

        const medicines = await Medicine.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { genericName: { $regex: q, $options: 'i' } }
            ],
            isActive: true
        })
            .select('_id name genericName category sellingPrice currentStock unit stockStatus expiryStatus')
            .limit(10);

        res.json(medicines);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ROUTE 3 — GET /barcode/:barcode (Scan barcode)
router.get('/barcode/:barcode', authorize('pharmacist', 'admin'), async (req, res) => {
    try {
        const medicine = await Medicine.findOne({ barcode: req.params.barcode, isActive: true });
        if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
        res.json(medicine);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ROUTE 4 — GET /alerts (Get stock and expiry alerts)
router.get('/alerts', authorize('pharmacist', 'admin'), async (req, res) => {
    try {
        const [lowStock, outOfStock, expiringSoon, expired] = await Promise.all([
            Medicine.find({ stockStatus: 'low_stock', isActive: true }),
            Medicine.find({ stockStatus: 'out_of_stock', isActive: true }),
            Medicine.find({ expiryStatus: 'expiring_soon', isActive: true }),
            Medicine.find({ expiryStatus: 'expired', isActive: true })
        ]);

        res.json({
            lowStock,
            outOfStock,
            expiringSoon,
            expired,
            totalAlerts: lowStock.length + outOfStock.length + expiringSoon.length + expired.length
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ROUTE 5 — POST / (Add New Medicine)
router.post('/', authorize('pharmacist', 'admin'), async (req, res) => {
    try {
        const medicine = new Medicine({
            ...req.body,
            addedBy: req.user.id
        });

        await medicine.save();

        if (medicine.currentStock > 0) {
            await StockTransaction.create({
                medicineId: medicine._id,
                medicineName: medicine.name,
                transactionType: 'purchase',
                quantity: medicine.currentStock,
                balanceAfter: medicine.currentStock,
                notes: 'Initial stock on creation',
                performedBy: req.user.id
            });
        }

        res.status(201).json(medicine);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ROUTE 6 — PUT /:id (Update Medicine)
router.put('/:id', authorize('pharmacist', 'admin'), async (req, res) => {
    try {
        const oldMedicine = await Medicine.findById(req.params.id);
        if (!oldMedicine) return res.status(404).json({ message: 'Medicine not found' });

        const { currentStock } = req.body;
        const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        if (currentStock !== undefined && currentStock !== oldMedicine.currentStock) {
            await StockTransaction.create({
                medicineId: medicine._id,
                medicineName: medicine.name,
                transactionType: 'adjustment',
                quantity: currentStock - oldMedicine.currentStock,
                balanceAfter: currentStock,
                notes: 'Manual stock adjustment',
                performedBy: req.user.id
            });
        }

        res.json(medicine);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ROUTE 7 — POST /:id/restock (Restock Medicine)
router.post('/:id/restock', authorize('pharmacist', 'admin'), async (req, res) => {
    try {
        const { quantity, purchasePrice, batchNumber, expiryDate, supplier } = req.body;
        const medicine = await Medicine.findById(req.params.id);
        if (!medicine) return res.status(404).json({ message: 'Medicine not found' });

        medicine.currentStock += Number(quantity);
        if (purchasePrice) medicine.purchasePrice = purchasePrice;
        if (batchNumber) medicine.batchNumber = batchNumber;
        if (expiryDate) medicine.expiryDate = expiryDate;
        if (supplier) medicine.supplier = { ...medicine.supplier, ...supplier };

        medicine.lastRestockedAt = Date.now();
        medicine.lastRestockedBy = req.user.id;

        await medicine.save();

        await StockTransaction.create({
            medicineId: medicine._id,
            medicineName: medicine.name,
            transactionType: 'purchase',
            quantity: Number(quantity),
            balanceAfter: medicine.currentStock,
            notes: 'Restock transaction',
            performedBy: req.user.id
        });

        res.json(medicine);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ROUTE 8 — POST /dispense (Dispense medicines from prescription)
router.post('/dispense', authorize('pharmacist', 'admin'), async (req, res) => {
    const session = await Medicine.startSession();
    session.startTransaction();
    try {
        const { prescriptionId, appointmentId, items } = req.body;

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) throw new Error('Appointment not found');
        if (!appointment.finalBillId) throw new Error('Final bill was not generated for this appointment. Please generate bill first at reception.');

        const bill = await Bill.findById(appointment.finalBillId);
        if (!bill) throw new Error('Final bill not found');
        if (bill.status === 'paid') throw new Error('Cannot add items to a paid bill');

        let dispensedItems = [];

        for (const item of items) {
            const medicine = await Medicine.findById(item.medicineId).session(session);
            if (!medicine) throw new Error(`Medicine ${item.medicineName} not found`);
            if (medicine.currentStock < item.quantity) {
                throw new Error(`Insufficient stock for ${medicine.name}. Available: ${medicine.currentStock}`);
            }

            // Deduct stock
            medicine.currentStock -= item.quantity;
            await medicine.save({ session });

            // Create transaction
            await StockTransaction.create([{
                medicineId: medicine._id,
                medicineName: medicine.name,
                transactionType: 'dispense',
                quantity: -item.quantity,
                balanceAfter: medicine.currentStock,
                referenceId: appointment.finalBillId,
                performedBy: req.user.id
            }], { session });

            // Add to bill items
            bill.items.push({
                description: medicine.name,
                category: 'medicine',
                quantity: item.quantity,
                unitPrice: medicine.sellingPrice,
                total: item.quantity * medicine.sellingPrice
            });

            dispensedItems.push({
                medicineId: medicine._id,
                medicineName: medicine.name,
                quantity: item.quantity,
                sellingPrice: medicine.sellingPrice
            });
        }

        // Recalculate bill totals
        const { itemsWithTotal, subtotal, taxAmount, discountAmount, grandTotal } =
            calcTotals(bill.items, bill.taxPercent, bill.discountPercent);

        bill.items = itemsWithTotal;
        bill.subtotal = subtotal;
        bill.taxAmount = taxAmount;
        bill.discountAmount = discountAmount;
        bill.grandTotal = grandTotal;
        bill.balanceDue = grandTotal - bill.amountPaid;

        await bill.save({ session });
        await session.commitTransaction();

        res.json({ success: true, dispensed: dispensedItems, billUpdated: true });
    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ message: err.message });
    } finally {
        session.endSession();
    }
});

// ROUTE 9 — GET /transactions/:medicineId (Stock history)
router.get('/transactions/:medicineId', authorize('pharmacist', 'admin'), async (req, res) => {
    try {
        const transactions = await StockTransaction.find({ medicineId: req.params.medicineId })
            .sort({ createdAt: -1 })
            .populate('performedBy', 'name');
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
