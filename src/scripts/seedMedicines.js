const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Medicine = require('../models/Medicine');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const medicinesRaw = [
    { name: "Paracetamol", category: "tablet", symptoms: ["fever", "pain", "headache"], sideEffects: ["nausea", "allergic reaction"], commonality: 0.95 },
    { name: "Ibuprofen", category: "tablet", symptoms: ["inflammation", "joint pain", "muscle ache"], sideEffects: ["stomach upset", "dizziness"], commonality: 0.85 },
    { name: "Amoxicillin", category: "capsule", symptoms: ["bacterial infection", "sore throat", "UTI"], sideEffects: ["diarrhea", "rash"], commonality: 0.8 },
    { name: "Omeprazole", category: "capsule", symptoms: ["acidity", "heartburn", "GERD"], sideEffects: ["headache", "abdominal pain"], commonality: 0.75 },
    { name: "Cetirizine", category: "tablet", symptoms: ["allergy", "runny nose", "sneezing"], sideEffects: ["drowsiness", "dry mouth"], commonality: 0.9 },
    { name: "Salbutamol", category: "inhaler", symptoms: ["asthma", "wheezing", "shortness of breath"], sideEffects: ["tremor", "palpitations"], commonality: 0.7 },
    { name: "Metformin", category: "tablet", symptoms: ["diabetes", "high blood sugar"], sideEffects: ["nausea", "metallic taste"], commonality: 0.8 },
    { name: "Amlodipine", category: "tablet", symptoms: ["hypertension", "high blood pressure"], sideEffects: ["swelling", "fatigue"], commonality: 0.75 },
    { name: "Atorvastatin", category: "tablet", symptoms: ["high cholesterol"], sideEffects: ["muscle pain", "joint pain"], commonality: 0.7 },
    { name: "Azithromycin", category: "tablet", symptoms: ["infection", "pneumonia", "bronchitis"], sideEffects: ["vomiting", "stomach cramps"], commonality: 0.65 },
    { name: "Loratadine", category: "tablet", symptoms: ["allergy", "hay fever", "hives"], sideEffects: ["fatigue", "dry mouth"], commonality: 0.8 },
    { name: "Pantoprazole", category: "tablet", symptoms: ["acid reflux", "gastritis"], sideEffects: ["flatulence", "joint pain"], commonality: 0.7 },
    { name: "Insulin glargine", category: "injection", symptoms: ["diabetes", "insulin deficiency"], sideEffects: ["hypoglycemia", "weight gain"], commonality: 0.4 },
    { name: "Adrenaline", category: "injection", symptoms: ["emergency", "anaphylaxis", "cardiac arrest"], sideEffects: ["anxiety", "rapid heartbeat"], commonality: 0.2 },
    { name: "Morphine", category: "injection", symptoms: ["severe pain", "post-surgery pain"], sideEffects: ["constipation", "sedation"], commonality: 0.15 },
    { name: "Heparin", category: "injection", symptoms: ["blood clots", "thrombosis"], sideEffects: ["bleeding", "bruising"], commonality: 0.3 },
    { name: "ORS", category: "powder", symptoms: ["dehydration", "diarrhea", "exhaustion"], sideEffects: ["bloating"], commonality: 0.98 },
    { name: "Lactulose", category: "syrup", symptoms: ["constipation"], sideEffects: ["cramps", "gas"], commonality: 0.7 },
    { name: "Levothyroxine", category: "tablet", symptoms: ["hypothyroidism", "fatigue", "weight gain"], sideEffects: ["nervousness", "heat intolerance"], commonality: 0.6 },
    { name: "Dexamethasone", category: "tablet", symptoms: ["severe inflammation", "allergic reactions"], sideEffects: ["increased appetite", "insomnia"], commonality: 0.5 },
    ...Array.from({ length: 80 }).map((_, i) => ({
        name: `Med-${100 + i}`,
        category: ["tablet", "capsule", "syrup", "injection", "drops", "cream"][Math.floor(Math.random() * 6)],
        symptoms: ["pain", "infection", "fatigue", "inflammation", "nausea"][Math.floor(Math.random() * 5)].split(','),
        sideEffects: ["headache", "dizziness", "rash"][Math.floor(Math.random() * 3)].split(','),
        commonality: Math.random() // Scarcity factor
    }))
];

const seedMedicines = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB for Seeding...");

        await Medicine.deleteMany({});
        console.log("Cleared existing mock data...");

        const medicinesToInsert = [];
        let totalCreated = 0;
        let totalStock = 0;

        const names = [
            "Paracetamol", "Ibuprofen", "Amoxicillin", "Omeprazole", "Cetirizine", "Salbutamol", "Metformin", "Amlodipine", "Atorvastatin", "Azithromycin",
            "Loratadine", "Pantoprazole", "Insulin glargine", "Adrenaline", "Morphine", "Heparin", "ORS", "Lactulose", "Levothyroxine", "Dexamethasone",
            "Ciprofloxacin", "Losartan", "Ranitidine", "Budesonide", "Prednisolone", "Warfarin", "Clopidogrel", "Digoxin", "Furosemide", "Spironolactone",
            "Diazepam", "Alprazolam", "Sertraline", "Fluoxetine", "Haloperidol", "Risperidone", "Ondansetron", "Metoclopramide", "Zinc", "Vitamin D",
            "Calcium", "Iron", "Folic acid", "Ceftriaxone", "Meropenem", "Vancomycin", "Lidocaine", "Propofol", "Tramadol", "Codeine",
            "Carbimazole", "Propranolol", "Atenolol", "Enalapril", "Ramipril", "Hydrochlorothiazide", "Nitroglycerin", "Isosorbide", "Dabigatran", "Rivaroxaban",
            "Apixaban", "Glimepiride", "Glibenclamide", "Pioglitazone", "Sitagliptin", "Vildagliptin", "Empagliflozin", "Dapagliflozin", "Gliclazide", "Domperidone",
            "Esomeprazole", "Rabeprazole", "Sucralfate", "Aluminum hydroxide", "Magnesium hydroxide", "Bisacodyl", "Senna", "Loperamide", "Racecadotril", "Montelukast",
            "Theophylline", "Ipratropium", "Fluticasone", "Amikacin", "Gentamicin", "Linezolid", "Clindamycin", "Doxycycline", "Metronidazole", "Tinidazole",
            "Acyclovir", "Oseltamivir", "Fluconazole", "Amphotericin B", "Hydroxychloroquine", "Methotrexate", "Cyclophosphamide", "Vincristine", "Paclitaxel", "Doxorubicin"
        ];

        // Specific category overrides
        const categoryMap = {
            "Acyclovir": "cream",
            "Sucralfate": "syrup",
            "Aluminum hydroxide": "syrup",
            "Magnesium hydroxide": "syrup",
            "Lidocaine": "ointment",
            "Salbutamol": "inhaler"
        };

        for (let i = 0; i < 100; i++) {
            const raw = medicinesRaw[i] || {};
            const medName = names[i];
            const commonality = raw.commonality || Math.random();
            const category = categoryMap[medName] || raw.category || ["tablet", "capsule", "syrup"][Math.floor(Math.random() * 3)];
            
            const imageMap = {
                tablet: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80",
                capsule: "https://images.unsplash.com/photo-1550572017-ed200159383b?w=400&q=80",
                syrup: "https://images.unsplash.com/photo-1631549448253-da8f2190195c?w=400&q=80",
                cream: "https://images.unsplash.com/photo-1620916566398-39f1143aba7a?w=400&q=80",
                ointment: "https://images.unsplash.com/photo-1620916566398-39f1143aba7a?w=400&q=80",
                injection: "https://images.unsplash.com/photo-1579152276532-83951f99abc2?w=400&q=80",
                drops: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&q=80",
                inhaler: "https://images.unsplash.com/photo-1599493758267-c6c884c7071f?w=400&q=80",
                default: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80"
            };

            let qty = Math.floor(commonality * 400); 
            if (qty < 10) qty = 10; 

            const med = {
                name: medName,
                genericName: medName,
                brand: "SevaMed Global",
                category: category,
                description: `High-quality ${medName} for hospital use.`,
                symptoms: raw.symptoms || ["general relief"],
                sideEffects: raw.sideEffects || ["mild drowsiness"],
                imageUrl: imageMap[category] || imageMap.default,
                currentStock: qty,
                minimumStock: 20,
                purchasePrice: Math.floor(Math.random() * 100) + 20,
                sellingPrice: Math.floor(Math.random() * 150) + 150,
                mrp: 400,
                expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
                unit: i % 4 === 0 ? "bottle" : "strip",
                barcode: `MED-V2-${1000 + i}`
            };

            medicinesToInsert.push(med);
            totalStock += qty;
            totalCreated++;
        }

        await Medicine.insertMany(medicinesToInsert);
        console.log(`Successfully seeded ${totalCreated} medicines.`);
        process.exit();
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
};

seedMedicines();
