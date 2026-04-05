const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../../.env' }); // Ensure proper .env path
const Medicine = require('../models/Medicine');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

const medicines = [
    {
        name: "Paracetamol 500mg",
        genericName: "Acetaminophen",
        brand: "Crocin",
        category: "tablet",
        description: "Pain reliever and a fever reducer.",
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80",
        barcode: "1000000001",
        batchNumber: "B1001",
        hsnCode: "30049099",
        currentStock: 500,
        minimumStock: 50,
        maximumStock: 2000,
        unit: "strip",
        purchasePrice: 15.00,
        sellingPrice: 20.00,
        mrp: 25.00,
        gstPercent: 12,
        expiryDate: new Date("2028-12-31"),
        supplier: { name: "MedLife Corp", contactNumber: "9876543210" }
    },
    {
        name: "Amoxicillin 250mg",
        genericName: "Amoxicillin",
        brand: "Amoxil",
        category: "capsule",
        description: "Penicillin antibiotic that fights bacteria.",
        imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&q=80",
        barcode: "1000000002",
        batchNumber: "B1002",
        currentStock: 300,
        unit: "strip",
        purchasePrice: 40.00,
        sellingPrice: 55.00,
        mrp: 65.00,
        expiryDate: new Date("2026-06-30")
    },
    {
        name: "Ibuprofen 400mg",
        genericName: "Ibuprofen",
        brand: "Advil",
        category: "tablet",
        description: "Nonsteroidal anti-inflammatory drug (NSAID).",
        imageUrl: "https://images.unsplash.com/photo-1550572017-edb7df081498?w=300&q=80",
        barcode: "1000000003",
        batchNumber: "B1003",
        currentStock: 450,
        unit: "strip",
        purchasePrice: 20.00,
        sellingPrice: 30.00,
        mrp: 35.00,
        expiryDate: new Date("2027-11-15")
    },
    {
        name: "Cough Syrup 100ml",
        genericName: "Dextromethorphan",
        brand: "Benadryl DR",
        category: "syrup",
        description: "Cough suppressant.",
        imageUrl: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=300&q=80",
        barcode: "1000000004",
        batchNumber: "B1004",
        currentStock: 120,
        unit: "bottle",
        purchasePrice: 65.00,
        sellingPrice: 90.00,
        mrp: 110.00,
        expiryDate: new Date("2025-10-10")
    },
    {
        name: "Cetirizine 10mg",
        genericName: "Cetirizine",
        brand: "Zyrtec",
        category: "tablet",
        description: "Antihistamine used to relieve allergy symptoms.",
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80",
        barcode: "1000000005",
        batchNumber: "B1005",
        currentStock: 800,
        unit: "strip",
        purchasePrice: 10.00,
        sellingPrice: 18.00,
        mrp: 22.00,
        expiryDate: new Date("2029-01-01")
    },
    {
        name: "Omeprazole 20mg",
        genericName: "Omeprazole",
        brand: "Prilosec",
        category: "capsule",
        description: "Proton pump inhibitor that decreases stomach acid.",
        imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&q=80",
        barcode: "1000000006",
        batchNumber: "B1006",
        currentStock: 250,
        unit: "strip",
        purchasePrice: 35.00,
        sellingPrice: 50.00,
        mrp: 60.00,
        expiryDate: new Date("2027-05-20")
    },
    {
        name: "Vitamin C 500mg",
        genericName: "Ascorbic Acid",
        brand: "Limcee",
        category: "tablet",
        description: "Vitamin supplement.",
        imageUrl: "https://images.unsplash.com/photo-1550572017-edb7df081498?w=300&q=80",
        barcode: "1000000007",
        batchNumber: "B1007",
        currentStock: 1000,
        unit: "strip",
        purchasePrice: 12.00,
        sellingPrice: 22.00,
        mrp: 25.00,
        expiryDate: new Date("2028-08-30")
    },
    {
        name: "Azithromycin 500mg",
        genericName: "Azithromycin",
        brand: "Zithromax",
        category: "tablet",
        description: "Macrolide antibiotic.",
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80",
        barcode: "1000000008",
        batchNumber: "B1008",
        currentStock: 600,
        unit: "strip",
        purchasePrice: 55.00,
        sellingPrice: 80.00,
        mrp: 100.00,
        expiryDate: new Date("2026-11-12")
    },
    {
        name: "Metformin 500mg",
        genericName: "Metformin hydrochloride",
        brand: "Glucophage",
        category: "tablet",
        description: "First-line medication for type 2 diabetes.",
        imageUrl: "https://images.unsplash.com/photo-1550572017-edb7df081498?w=300&q=80",
        barcode: "1000000009",
        batchNumber: "B1009",
        currentStock: 900,
        unit: "strip",
        purchasePrice: 18.00,
        sellingPrice: 28.00,
        mrp: 35.00,
        expiryDate: new Date("2029-03-25")
    },
    {
        name: "Amlodipine 5mg",
        genericName: "Amlodipine besylate",
        brand: "Norvasc",
        category: "tablet",
        description: "Calcium channel blocker used to treat high blood pressure.",
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80",
        barcode: "1000000010",
        batchNumber: "B1010",
        currentStock: 750,
        unit: "strip",
        purchasePrice: 25.00,
        sellingPrice: 40.00,
        mrp: 50.00,
        expiryDate: new Date("2028-02-18")
    },
    {
        name: "Diclofenac Gel",
        genericName: "Diclofenac sodium",
        brand: "Volini",
        category: "ointment",
        description: "Pain relief gel for muscle and joint pain.",
        imageUrl: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=300&q=80",
        barcode: "1000000011",
        batchNumber: "B1011",
        currentStock: 200,
        unit: "tube",
        purchasePrice: 45.00,
        sellingPrice: 70.00,
        mrp: 85.00,
        expiryDate: new Date("2026-09-05")
    },
    {
        name: "Salbutamol Inhaler",
        genericName: "Albuterol",
        brand: "Ventolin HFA",
        category: "inhaler",
        description: "Bronchodilator that relaxes muscles in the airways.",
        imageUrl: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=300&q=80",
        barcode: "1000000012",
        batchNumber: "B1012",
        currentStock: 150,
        unit: "piece",
        purchasePrice: 120.00,
        sellingPrice: 180.00,
        mrp: 220.00,
        expiryDate: new Date("2025-12-20")
    }
];

const seedMedicines = async () => {
    try {
        await Medicine.deleteMany({});
        console.log('Cleared existing medicines.');
        await Medicine.insertMany(medicines);
        console.log(`Successfully seeded ${medicines.length} medicines with images.`);
        mongoose.connection.close();
    } catch (err) {
        console.error('Seeding error:', err);
        mongoose.connection.close();
    }
};

seedMedicines();
