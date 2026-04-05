const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://ypsure:chinnu0345@sevaonline.8zwq9ed.mongodb.net/sevaonline';

const MedicineSchema = new mongoose.Schema({
    name: String,
    genericName: String,
    imageUrl: String,
    symptoms: [String],
    sideEffects: [String],
    description: String,
    category: String,
});

async function updateBatch1() {
    try {
        await mongoose.connect(MONGODB_URI);
        const Medicine = mongoose.model('Medicine', MedicineSchema);

        const data = [
            { name: 'Paracetamol', url: 'https://imgs.search.brave.com/g0Z0KzmNecV9O-ugnLmoDUqD8gwOzYsDA02T8eBo8rk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvNDkw/Mzc1MzU5L3Bob3Rv/L2Nsb3NlLXVwLW9m/LW9wZW4tYmx1ZS1j/YXJkYm9hcmQtcGFj/a2V0LW9mLXBhcmFj/ZXRhbW9sLXBhaW4t/cmVsaWVmLmpwZz9z/PTYxMng2MTImdz0w/Jms9MjAmYz1FSlB3/djd1dUkzR2RTbUxa/b2IwUzh3cHFVRU5D/dWRMRmlvaXEwbG1B/R3FBPQ', symp: ['Fever', 'Headache', 'Muscle pain'], side: ['Nausea', 'Skin rash', 'Liver toxicity (overdose)'], gen: 'Analgesic & Antipyretic' },
            { name: 'Ibuprofen', url: 'https://imgs.search.brave.com/_eNvfCalPlUunxA0mnyaqXIqVWAASnSaKMsALOE3tHg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTI0/Nzg0NjQyNS9waG90/by9pYnVwcm9mZW4t/Ym90dGxlLWFuZC1w/aWxscy5qcGc_cz02/MTJ4NjEyJnc9MCZr/PTIwJmM9UlVWNlIx/QUZNQXhlR3RKMHNT/dGJBOU1Xcll1dE5T/UTBuMHBmQlBiMnZx/Yz0', symp: ['Inflammation', 'Joint pain', 'Dysmenorrhea'], side: ['Stomach upset', 'Dizziness', 'Heartburn'], gen: 'NSAID' },
            { name: 'Amoxicillin', url: 'https://imgs.search.brave.com/tsr7LmWClharLzkbqnX4WLCwXTGGkTpb1_3Q950PtCI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9hbW94/aWNpbGxpbi1tZWRp/Y2F0aW9uLXBsYXN0/aWMtdmlhbC1hbnRp/YmlvdGljLXVzZWQt/dG8tdHJlYXQtYmFj/dGVyaWFsLWluZmVj/dGlvbnMtc3VjaC1h/cy1wbmV1bW9uaWEt/Mjc4MjgwODQyLmpw/Zw', symp: ['Bacterial infections', 'Ear infection', 'Pneumonia'], side: ['Diarrhea', 'Nausea', 'Vaginal yeast infection'], gen: 'Penicillin-type antibiotic' },
            { name: 'Omeprazole', url: 'https://imgs.search.brave.com/c1lRPGLrvjVcHtWGee6XcjxOh1LkJZc0Fint6yA_XZc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzE2LzE3Lzc2LzQx/LzM2MF9GXzE2MTc3/NjQxNDVfUEhmdWxB/djJjTlFVWFRpQjhk/d2F0QUNFU0hzekl3/WlguanBn', symp: ['Acidity', 'Heartburn', 'Stomach ulcers'], side: ['Headache', 'Abdominal pain', 'Flatulence'], gen: 'Proton pump inhibitor (PPI)' },
            { name: 'Cetirizine', url: 'https://imgs.search.brave.com/jzOpjY3q1Zr1Ynbx76htqc76kXxQ9aQdBrrUbFHmHns/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9jZXRp/cml6aW5lLWNldGly/aXppbmUtYW50aWhp/c3RhbWluZS1tZWRp/Y2F0aW9uLXVzZWQt/dG8tdHJlYXQtYWxs/ZXJneS1zeW1wdG9t/cy1hbGxlcmd5LXN5/bXB0b21zLXRhYmxl/dC1zeXJ1cC0yNzc2/OTA4NTUuanBn', symp: ['Allergies', 'Hay fever', 'Hives'], side: ['Drowsiness', 'Dry mouth', 'Fatigue'], gen: 'Antihistamine' },
            { name: 'Salbutamol', url: 'https://imgs.search.brave.com/8-dHUZpzqyqBYkoCHm7-DdWu7LkQeQG_uWGNjS5QoOQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzE3LzA0LzU1Lzg2/LzM2MF9GXzE3MDQ1/NTg2MjhfQmVib3Rx/cnpKcXlrclRpR1Va/NmpYdE1zWG1mVXpl/ZzcuanBn', symp: ['Asthma', 'Bronchospasm', 'Wheezing'], side: ['Tremors', 'Nervousness', 'Palpitations'], gen: 'Bronchodilator (Beta-2 agonist)' },
            { name: 'Metformin', url: 'https://imgs.search.brave.com/eFzmPMfv5jfyO6VGddqrdxO9mp7TUhyVuAxt6owSZpo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMjIx/MDk0MDg1MC9waG90/by9wcmVzY3JpcHRp/b24tcGlsbC1ib3R0/bGUtb2YtbWV0Zm9y/bWluLmpwZz9zPTYx/Mng2MTImdz0wJms9MjAmYz1qWmUxLWFL/NzFPeTZTVWY1MEgt/M0lUVmhXTFNzMC01/LU12ai1YT0ZaVUhN/PQ', symp: ['Type 2 Diabetes', 'PCOS'], side: ['Nausea', 'Diarrhea', 'Metallic taste'], gen: 'Biguanide' },
            { name: 'Amlodipine', url: 'https://imgs.search.brave.com/UMzFatpsqKJKy6JC7twWlsiMoyQlTzGqutxjkk5uA40/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA2LzAzLzI1Lzk1/LzM2MF9GXzYwMzI1/OTU3M192c1FnM25E/N29OaEwyaUQzeW1k/cWh0Z2RxT0YzTExu/aS5qcGc', symp: ['Hypertension', 'Angina'], side: ['Edema (swelling)', 'Fatigue', 'Dizziness'], gen: 'Calcium channel blocker' },
            { name: 'Atorvastatin', url: 'https://imgs.search.brave.com/T8JlMfBBBGYceG98HRGOiNA1l8jT8MbErrrTPD4NTKo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvNTU5/MDg0OTgvcGhvdG8v/ZGVzLXBsYWluZXMt/aWwtYS1wcmVzY3Jp/cHRpb24tYm90dGxl/LWxhYmVsLW9mLXBm/aXplcnMtbGlwaXRv/ci1rbm93bi1hcy1h/dG9ydmFzdGF0aW4t/aW4tdGhlLmpwZz9z/PTYxMng2MTImdz0w/Jms9MjAmYz1ZTjVG/ZUJteGFNUnVEb1BT/THRTT3o3OEhCRmxu/ZkpEbXMyelk0UFU5/aTlRPQ', symp: ['High Cholesterol', 'Hyperlipidemia'], side: ['Muscle pain', 'Digestive issues', 'Increased blood sugar'], gen: 'Statin' },
            { name: 'Azithromycin', url: 'https://imgs.search.brave.com/YlMSbg8NuF-kYSZaB6erriF8N4HeKvJAqA0qLSOwy8o/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/c2h1dHRlcnN0b2Nr/LmNvbS9pbWFnZS1w/aG90by90YWJsZXQt/YXppdGhyb215Y2lu/LW9uLXRhYmxlLW1l/ZGljYXRpb24tMjYw/bnctMTY3ODIyOTQz/Ny5qcGc', symp: ['Respiratory infection', 'Skin infection'], side: ['Nausea', 'Vomiting', 'Stomach cramps'], gen: 'Macrolide antibiotic' },
            { name: 'Loratadine', url: 'https://imgs.search.brave.com/MLbVNWdtIzj96bBVDM22Q-O4HbmImsGr4MAAtW50Z3I/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Z3J4c3RhdGljLmNv/bS9kNGZ1cXFkNWwz/ZGJ6L3Byb2R1Y3Rz/L1BhY2thZ2VfNDQz/MTcuSlBHP3dpZHRo/PTM4NCZxdWFsaXR5/PTg1JmF1dG89d2Vi/cA', symp: ['Seasonal allergies', 'Skin itching'], side: ['Headache', 'Dry mouth', 'Nosebleed'], gen: 'Antihistamine' },
            { name: 'Pantoprazole', url: 'https://imgs.search.brave.com/RaLxedOdVpcM5AZPFLRQv-PkPT1KR3VFnEegPjb85lo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA1LzE1LzQzLzcx/LzM2MF9GXzUxNTQz/NzE3NV9mREdBVlYz/cWlCU3J6VHdjYVFI/VG8xTE1WUzI5MEFs/YS5qcGc', symp: ['GERD', 'Peptic ulcers'], side: ['Abdominal pain', 'Gas', 'Diarrhea'], gen: 'Proton pump inhibitor (PPI)' },
            { name: 'Insulin glargine', url: 'https://imgs.search.brave.com/TTSQMT8flIiwRPZm52l3V__xRZmAPhale7oOKyE8XzI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly81Lmlt/aW1nLmNvbS9kYXRh/NS9TRUxMRVIvRGVm/YXVsdC8yMDI0LzEx/LzQ2NDA2NzMyMS9H/Si9JSy9DRi8xMDc2/MDM2NDEvaW5zdWxp/bi1nbGFyZ2luZS1p/bmplY3Rpb24tMjUw/eDI1MC5qcGc', symp: ['Diabetes Mellitus'], side: ['Hypoglycemia', 'Weight gain', 'Injection site itching'], gen: 'Long-acting insulin' },
            { name: 'Adrenaline', url: 'https://imgs.search.brave.com/DBfaEwmSnmWwPzQdKBPsqBo78iBAvYVQK4N6s1u6rzY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi92aWFs/LWFkcmVuYWxpbmUt/aW5qZWN0aW9uLXN5/cmluZ2UtdmlhbC1h/ZHJlbmFsaW5lLWlu/amVjdGlvbi1zeXJp/bmdlLWhvcm1vbmUt/bWVkaWNhdGlvbi0x/OTAxMzE1NjAuanBn', symp: ['Severe allergy (Anaphylaxis)', 'Cardiac arrest'], side: ['Anxiety', 'Palpitations', 'Sweating'], gen: 'Vasopressor (Epinephrine)' },
            { name: 'Morphine', url: 'https://imgs.search.brave.com/0MRO1GkJoInSrofhXzdxvzsOJOCdSSa3rHhzwUfvOqY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9yZW5k/ZXIuZmluZWFydGFt/ZXJpY2EuY29tL2lt/YWdlcy9pbWFnZXMt/cHJvZmlsZS1mbG93/LzQwMC9pbWFnZXMv/YXJ0d29ya2ltYWdl/cy9tZWRpdW1sYXJn/ZS8yL3ZpYWwtb2Yt/bW9ycGhpbmUtd2xh/ZGltaXItYnVsZ2Fy/c2NpZW5jZS1waG90/by1saWJyYXJ5Lmpw/Zw', symp: ['Severe acute pain', 'Chronic pain'], side: ['Constipation', 'Drowsiness', 'Respiratory depression'], gen: 'Opioid analgesic' },
            { name: 'Heparin', url: 'https://imgs.search.brave.com/Ep1RcY0XVs2dt5FuejZcTtAK6p02YHwW34dLkRFILWw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzAzLzU2LzQ5Lzcw/LzM2MF9GXzM1NjQ5/NzA4MF8ycmh5ckJH/TUI0djZtdWdNSXRi/cENNYm1vMTlOdXVz/bS5qcGc', symp: ['Blood clotting prevention', 'Deep vein thrombosis'], side: ['Bleeding', 'Easy bruising', 'Heparin-induced thrombocytopenia'], gen: 'Anticoagulant' },
            { name: 'ORS', url: 'https://imgs.search.brave.com/W0DSuBmVTRySeCgbKDy68Ov8UrliC-daAMdiwEKHf9c/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly81Lmlt/aW1nLmNvbS9kYXRh/NS9LRS9RRS9NWS00/MDEzNzkyNi9vcnMt/bGlxdWlkLW9yYW5n/ZS1jaXBsYS0xMDAw/eDEwMDAuanBn', symp: ['Dehydration', 'Diarrhea', 'Electrolyte loss'], side: ['Vomiting', 'High sodium (if improperly mixed)'], gen: 'Oral Rehydration Salts' },
            { name: 'Lactulose', url: 'https://imgs.search.brave.com/O2jb87atig-8wi_eFqkpSgbiP1HpYpWHFcP888a5G8U/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly81Lmlt/aW1nLmNvbS9kYXRh/NS9TRUxMRVIvRGVm/YXVsdC8yMDI0LzMv/Mzk1OTMwMTY1L0FY/L0ROL0ZJLzkwNzI0/NDY4L2xhY3R1bG9z/ZS11c3AtMTBnbS1v/cmFsLXNvbHV0aW9u/LTEwMDB4MTAwMC5q/cGVn', symp: ['Constipation', 'Hepatic encephalopathy'], side: ['Flatulence', 'Abdominal cramps', 'Nausea'], gen: 'Osmotic laxative' },
            { name: 'Levothyroxine', url: 'https://imgs.search.brave.com/NoE6FVaMwh5yHTXYIs6M_tE-SLZRGmKkT1SgtUzEiqk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/c2h1dHRlcnN0b2Nr/LmNvbS9pbWFnZS1w/aG90by9sZXZvdGh5/cm94aW5lLW1lZGlj/YXRpb24tdXNlZC10/cmVhdC11bmRlcmFj/dGl2ZS0yNjBudy0y/MzE5NDQyNjc1Lmpw/Zw', symp: ['Hypothyroidism', 'Goiter'], side: ['Weight loss', 'Palpitations', 'Heat sensitivity'], gen: 'Thyroid hormone replacement' },
            { name: 'Dexamethasone', url: 'https://imgs.search.brave.com/G-TMx303FsI-FAnkwEpPVbPBLxgvEUYTIQ2tTpuDjis/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTI1/MDEyNDU5Ny9waG90/by9sb25kb24tdW5p/dGVkLWtpbmdkb20t/aW4tdGhpcy1waG90/by1pbGx1c3RyYXRp/b24tYS1jbG9zZS11/cC1vZi1hLWJvdHRs/ZS1vZi1kZXhhbWV0/aGFzb25lLmpwZz9z/PTYxMng2MTImdz0w/Jms9MjAmYz0yd2NQ/RFFyQ3p3R1JlOEVI/aGxwVzVvSlpsOXlV/WktnQ0VNSTdCRkxI/Wi13PQ', symp: ['Severe inflammation', 'Allergies', 'Arthritis'], side: ['Fluid retention', 'Increased appetite', 'Mood swings'], gen: 'Corticosteroid' }
        ];

        for (const item of data) {
            await Medicine.findOneAndUpdate(
                { name: item.name },
                { 
                    imageUrl: item.url,
                    symptoms: item.symp,
                    sideEffects: item.side,
                    genericName: item.gen
                }
            );
            console.log(`Updated: ${item.name}`);
        }

        console.log('Batch 1 Update Complete.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateBatch1();
