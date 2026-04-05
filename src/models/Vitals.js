const mongoose = require('mongoose');

const VitalsSchema = new mongoose.Schema({
    // REFERENCES
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true,
        index: true
    },
    patientName: {
        type: String,
        required: true
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    nurseName: {
        type: String,
        required: true
    },
    wardId: {
        type: String,
        default: ''
    },
    bedNumber: {
        type: String,
        default: ''
    },

    // VITAL SIGNS
    bloodPressure: {
        systolic: { type: Number, required: true },
        diastolic: { type: Number, required: true },
        status: {
            type: String,
            enum: ['normal', 'high', 'low', 'critical'],
            default: 'normal'
        }
    },
    temperature: {
        value: { type: Number, required: true },
        unit: { type: String, default: 'C' },
        status: {
            type: String,
            enum: ['normal', 'fever', 'high_fever', 'hypothermia'],
            default: 'normal'
        }
    },
    pulse: {
        value: { type: Number, required: true },
        status: {
            type: String,
            enum: ['normal', 'high', 'low'],
            default: 'normal'
        }
    },
    spO2: {
        value: { type: Number, required: true },
        status: {
            type: String,
            enum: ['normal', 'low', 'critical'],
            default: 'normal'
        }
    },
    respiratoryRate: {
        value: { type: Number },
        status: {
            type: String,
            enum: ['normal', 'high', 'low'],
            default: 'normal'
        }
    },
    weight: { type: Number, default: null },
    height: { type: Number, default: null },
    bmi: { type: Number, default: null },

    // ALERTS
    hasAlert: { type: Boolean, default: false },
    alertMessage: { type: String, default: '' },
    alertLevel: {
        type: String,
        enum: ['none', 'warning', 'critical'],
        default: 'none'
    },

    // NOTES
    notes: { type: String, default: '' },
    recordedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// PRE-SAVE HOOK for auto-calculations
VitalsSchema.pre('save', function (next) {
    const vitals = this;
    const abnormalVitals = [];

    // 1. BMI Calculation
    if (vitals.weight && vitals.height) {
        vitals.bmi = parseFloat((vitals.weight / Math.pow(vitals.height / 100, 2)).toFixed(2));
    }

    // 2. Blood Pressure Status
    const sys = vitals.bloodPressure.systolic;
    const dia = vitals.bloodPressure.diastolic;
    if (sys > 180 || dia > 120) {
        vitals.bloodPressure.status = 'critical';
        abnormalVitals.push('Critical BP');
    } else if (sys > 140 || dia > 90) {
        vitals.bloodPressure.status = 'high';
        abnormalVitals.push('High BP');
    } else if (sys < 90 || dia < 60) {
        vitals.bloodPressure.status = 'low';
        abnormalVitals.push('Low BP');
    } else {
        vitals.bloodPressure.status = 'normal';
    }

    // 3. Temperature Status
    const temp = vitals.temperature.value;
    if (temp > 39.5) {
        vitals.temperature.status = 'high_fever';
        abnormalVitals.push('High Fever');
    } else if (temp > 37.5) {
        vitals.temperature.status = 'fever';
        abnormalVitals.push('Fever');
    } else if (temp < 35) {
        vitals.temperature.status = 'hypothermia';
        abnormalVitals.push('Hypothermia');
    } else {
        vitals.temperature.status = 'normal';
    }

    // 4. SpO2 Status
    const oxygen = vitals.spO2.value;
    if (oxygen < 90) {
        vitals.spO2.status = 'critical';
        abnormalVitals.push('Critical SpO2');
    } else if (oxygen < 95) {
        vitals.spO2.status = 'low';
        abnormalVitals.push('Low SpO2');
    } else {
        vitals.spO2.status = 'normal';
    }

    // 5. Pulse Status
    const hr = vitals.pulse.value;
    if (hr > 100) {
        vitals.pulse.status = 'high';
        abnormalVitals.push('High Pulse');
    } else if (hr < 60) {
        vitals.pulse.status = 'low';
        abnormalVitals.push('Low Pulse');
    } else {
        vitals.pulse.status = 'normal';
    }

    // 6. Set Alerts
    const isCritical = vitals.bloodPressure.status === 'critical' ||
        vitals.temperature.status === 'high_fever' ||
        vitals.spO2.status === 'critical';

    const isWarning = abnormalVitals.length > 0;

    vitals.hasAlert = isCritical || isWarning;
    vitals.alertMessage = abnormalVitals.join(', ');

    if (isCritical) {
        vitals.alertLevel = 'critical';
    } else if (isWarning) {
        vitals.alertLevel = 'warning';
    } else {
        vitals.alertLevel = 'none';
        vitals.hasAlert = false;
    }

    next();
});

module.exports = mongoose.model('Vitals', VitalsSchema);
