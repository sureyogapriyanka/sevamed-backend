const express = require('express');
const router = express.Router();
const PurchaseOrder = require('../models/PurchaseOrder');
const Medicine = require('../models/Medicine');
const StockTransaction = require('../models/StockTransaction');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

// ROUTE 1 — GET / (Get all POs)
router.get('/', authorize('pharmacist', 'admin'), async (req, res) => {
    try {
        const pos = await PurchaseOrder.find()
            .populate('orderedBy', 'name')
            .populate('receivedBy', 'name')
            .sort({ orderedAt: -1 });
        res.json(pos);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ROUTE 2 — POST / (Create PO)
router.post('/', authorize('pharmacist', 'admin'), async (req, res) => {
    try {
        const po = new PurchaseOrder({
            ...req.body,
            orderedBy: req.user.id
        });
        await po.save();
        res.status(201).json(po);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ROUTE 3 — PUT /:id/receive (Mark PO as received)
router.put('/:id/receive', authorize('pharmacist', 'admin'), async (req, res) => {
    const session = await Medicine.startSession();
    session.startTransaction();
    try {
        const { items } = req.body; // Array of received items details
        const po = await PurchaseOrder.findById(req.params.id);
        if (!po) throw new Error('Purchase Order not found');
        if (po.status === 'received') throw new Error('Purchase Order already received');

        for (const receivedItem of items) {
            const medicine = await Medicine.findById(receivedItem.medicineId).session(session);
            if (!medicine) throw new Error(`Medicine not found for ID: ${receivedItem.medicineId}`);

            // Update medicine stock and info
            medicine.currentStock += Number(receivedItem.receivedQuantity);
            if (receivedItem.batchNumber) medicine.batchNumber = receivedItem.batchNumber;
            if (receivedItem.expiryDate) medicine.expiryDate = receivedItem.expiryDate;
            if (receivedItem.manufacturingDate) medicine.manufacturingDate = receivedItem.manufacturingDate;

            medicine.lastRestockedAt = Date.now();
            medicine.lastRestockedBy = req.user.id;

            await medicine.save({ session });

            // Create stock transaction
            await StockTransaction.create([{
                medicineId: medicine._id,
                medicineName: medicine.name,
                transactionType: 'purchase',
                quantity: Number(receivedItem.receivedQuantity),
                balanceAfter: medicine.currentStock,
                referenceId: po.poNumber,
                performedBy: req.user.id
            }], { session });

            // Update PO item received quantity
            const poItem = po.items.find(item => item.medicineId.toString() === receivedItem.medicineId.toString());
            if (poItem) {
                poItem.receivedQuantity += Number(receivedItem.receivedQuantity);
                poItem.batchNumber = receivedItem.batchNumber || poItem.batchNumber;
                poItem.expiryDate = receivedItem.expiryDate || poItem.expiryDate;
            }
        }

        po.status = 'received';
        po.receivedAt = Date.now();
        po.receivedBy = req.user.id;

        await po.save({ session });
        await session.commitTransaction();

        res.json(po);
    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ message: err.message });
    } finally {
        session.endSession();
    }
});

module.exports = router;
