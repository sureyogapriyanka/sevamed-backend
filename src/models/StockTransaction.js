const mongoose = require('mongoose');

const StockTransactionSchema = new mongoose.Schema({
    medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine',
        required: true
    },
    medicineName: {
        type: String,
        required: true
    },
    transactionType: {
        type: String,
        enum: ['purchase', 'dispense', 'return', 'expired', 'adjustment'],
        required: true
    },
    quantity: {
        type: Number,
        required: true // Positive for stock in, negative for stock out
    },
    balanceAfter: {
        type: Number
    },
    referenceId: {
        type: String // bill ID, prescription ID, or PO number
    },
    notes: {
        type: String,
        default: ''
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('StockTransaction', StockTransactionSchema);
