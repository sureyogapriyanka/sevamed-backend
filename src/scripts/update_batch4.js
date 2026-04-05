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

async function updateBatch4() {
    try {
        await mongoose.connect(MONGODB_URI);
        const Medicine = mongoose.model('Medicine', MedicineSchema);

        const data = [
            { name: 'Glimepiride', url: 'https://imgs.search.brave.com/BaXrxskv92EgS5D3iZMmxqPJXJZX6g3Rb4jIWJqsCa4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9lY29t/bWVyY2UuZ2VuZXJp/Y2FydG1lZGljaW5l/LmNvbS9pbWFnZXMv/cHJvZHVjdHMvcHJv/ZHVjdC1waG90by0x/MTgxODU4MjAyNDE0/NTg1My5qcGc', symp: ['Type 2 Diabetes'], side: ['Hypoglycemia', 'Weight gain', 'Dizziness'], gen: 'Sulfonylurea' },
            { name: 'Glibenclamide', url: 'https://imgs.search.brave.com/JkDngzFv93gZ_ZIzyITq21seDzLQa9hVJMnSwC083nM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/c2hvcGlmeS5jb20v/cy9maWxlcy8xLzEy/OTAvODI5OS9wcm9k/dWN0cy9HbHltZXRf/VGFibGV0XzVfNTAw/bWdfNTZzX2xhcmdl/LnBuZz92PTE2MjIx/MTEyMTQ', symp: ['Type 2 Diabetes'], side: ['Hypoglycemia', 'Weight gain', 'Nausea'], gen: 'Sulfonylurea' },
            { name: 'Pioglitazone', url: 'https://imgs.search.brave.com/fMeHOKp6M3AMBPgIxDmeOgj4a9f-U4RIQVYKmJX9V4w/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/c2h1dHRlcnN0b2Nr/LmNvbS9pbWFnZS1w/aG90by9waW9nbGl0/YXpvbmUtdGhpYXpv/bGlkaW5lZGlvbmUt/dHlwZS0yLWRpYWJl/dGVzLTI2MG53LTIz/MTc0NTAwODEuanBn', symp: ['Type 2 Diabetes', 'Insulin resistance'], side: ['Fluid retention', 'Weight gain', 'Bone fractures'], gen: 'Thiazolidinedione' },
            { name: 'Sitagliptin', url: 'https://imgs.search.brave.com/JjQbPY5H-8a1qBNtnviTYyPmiO0GMEMqbQOCryP2Ljw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA2LzAyLzcyLzc4/LzM2MF9GXzYwMjcy/Nzg3M19OdVlLdUVr/dGY1c0RwVlphY0U2/VXhKVWl0eDlEdnpE/WS5qcGc', symp: ['Type 2 Diabetes'], side: ['Headache', 'Upper respiratory tract infection', 'Joint pain'], gen: 'DPP-4 inhibitor' },
            { name: 'Vildagliptin', url: 'https://imgs.search.brave.com/oQoCXukgN3ekKD4mm-qiWfxfD0YATjx4YaiHaIfKfcc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jcGlt/Zy50aXN0YXRpYy5j/b20vMDg4MTQ0NzEv/Yi80L1ZpbGRhZ2xp/cHRpbi1UYWJsZXRz/LmpwZw', symp: ['Type 2 Diabetes'], side: ['Dizziness', 'Headache', 'Constipation'], gen: 'DPP-4 inhibitor' },
            { name: 'Empagliflozin', url: 'https://imgs.search.brave.com/jdA4MgpT7i4Bh-pYyGAbGK1Xd3KiDH3pDJnDnbNfvKY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly81Lmlt/aW1nLmNvbS9kYXRh/NS9TRUxMRVIvRGVm/YXVsdC8yMDI1LzQv/NTA2ODU3ODgxL0lW/L1RPL0lSLzE5OTIz/OTExMy9naWJ0dWxp/by0yNS1tZy1lbXBh/Z2xpZmxvemluLXRh/YmxldHMtMjUweDI1/MC5qcGVn', symp: ['Type 2 Diabetes', 'Heart failure'], side: ['Urinary tract infections', 'Yeast infections', 'Increased urination'], gen: 'SGLT2 inhibitor' },
            { name: 'Dapagliflozin', url: 'https://imgs.search.brave.com/oYeChSkva_T8y2cFYv8H5KVAw4eOwhRGT7Y8BUn6mZ8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA2LzA0LzI2Lzk3/LzM2MF9GXzYwNDI2/OTc2M19qQ2I1NkJH/MzIwT1lGR0NpTGla/SDAwbEJYbkJ6V0E0/SS5qcGc', symp: ['Type 2 Diabetes', 'Heart failure'], side: ['Genital yeast infections', 'Urinary tract infections', 'Thirst'], gen: 'SGLT2 inhibitor' },
            { name: 'Gliclazide', url: 'https://imgs.search.brave.com/F8JLbsK75KEwsaHyZ11YZuGbgkNZcg4uOzsAKXEbWmU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jcGlt/Zy50aXN0YXRpYy5j/b20vMDMyMTQ3MjYv/Yi81L0dsaWNsYXpp/ZGUtVGFibGV0cy04/MC1tZy5qcGc', symp: ['Type 2 Diabetes'], side: ['Hypoglycemia', 'Stomach upset', 'Weight gain'], gen: 'Sulfonylurea' },
            { name: 'Domperidone', url: 'https://imgs.search.brave.com/TKt7NkMokoovqjYbspY5LotTDD7DkPGY0_PjnXtXYGI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/YmlvZmllbGRwaGFy/bWEuY29tL3dwLWNv/bnRlbnQvdXBsb2Fk/cy8yMDIzLzA2L0JJ/T0ZJRUxELUdJVlBF/UC1ELVRBQi0xLXNj/YWxlZC5qcGc', symp: ['Nausea', 'Vomiting', 'Gastroparesis'], side: ['Dry mouth', 'Headache', 'Diarrhea'], gen: 'Dopamine antagonist (Antiemetic)' },
            { name: 'Esomeprazole', url: 'https://imgs.search.brave.com/krKVDH1Kdc8qNF-6ac-iaPMIVznFCFlfHYjnAQAsH3w/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly81Lmlt/aW1nLmNvbS9kYXRh/NS9TRUxMRVIvRGVm/YXVsdC8yMDI0LzEv/Mzc3OTYwMTY2L0FR/L01EL01KLzY0MTA3/NDEzL2Vzb21lcHJh/em9sZS00MG1nLWxl/dm9zdWxwcmlkZS03/NS1tZy0yNTB4MjUw/LmpwZWc', symp: ['GERD', 'Stomach ulcers'], side: ['Headache', 'Diarrhea', 'Nausea'], gen: 'Proton pump inhibitor' },
            { name: 'Rabeprazole', url: 'https://imgs.search.brave.com/dQRimfYRVQb1J4trjTViZKok4_PjQtap1KBzu89UalQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly81Lmlt/aW1nLmNvbS9kYXRh/NS9TRUxMRVIvRGVm/YXVsdC8yMDI1LzYv/NTE3NzI0ODQ1L1FY/L0RCL1ZXLzE1NjUy/MTYxMy9yYWJlcHJh/em9sZS0yMG1nLWVj/LWxldm9zdWxwaXJp/ZGUtNzVtZy1zci1j/YXBzdWxlLTI1MHgy/NTAucG5n', symp: ['GERD', 'Peptic ulcer disease'], side: ['Headache', 'Stomach pain', 'Diarrhea'], gen: 'Proton pump inhibitor' },
            { name: 'Sucralfate', url: 'https://imgs.search.brave.com/-YG07A-vMGaAlPPLHVNPUAGzxs37mxaMClYRe9RlAKc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wbHVz/aGNhcmUuY29tL2hz/LWZzL2h1YmZzL0hl/cm8lMjBJbWFnZXMv/M18yJTIwUlglMjBP/cmFuZ2UlMjBQaWxs/JTIwQm90dGxlL0Nh/cmFmYXRlJTIwKHN1/Y3JhbGZhdGUpJTIw/M18yLndlYnA_d2lk/dGg9MTYwMCZoZWln/aHQ9MTA2NyZuYW1l/PUNhcmFmYXRlJTIw/KHN1Y3JhbGZhdGUp/JTIwM18yLndlYnA', symp: ['Stomach ulcers', 'Duodenal ulcers'], side: ['Constipation', 'Dry mouth', 'Nausea'], gen: 'Mucosal protectant' },
            { name: 'Aluminum hydroxide', url: 'https://imgs.search.brave.com/Fdei5KhnwM1cCyLbq0LpLTP_zew88V4ok40Nzu3sH7g/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly81Lmlt/aW1nLmNvbS9kYXRh/NS9TRUxMRVIvRGVm/YXVsdC8yMDIzLzQv/MzAxNjk0NTEyL0dW/L0VQL0RLLzcwMzQ0/NTcvbmV3LXByb2R1/Y3QtMTAwMHgxMDAw/LmpwZWc', symp: ['Heartburn', 'Acid indigestion', 'Sour stomach'], side: ['Constipation', 'Loss of appetite', 'Bone pain (long term)'], gen: 'Antacid' },
            { name: 'Magnesium hydroxide', url: 'https://imgs.search.brave.com/NcDjiTgt0eM-OEK4tIP3qkHlXo1ep8C7uMJNNUZmLVE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/YWR2YWNhcmVwaGFy/bWEuY29tL3N0YXRp/Yy84ZjM5ODk4OWU1/MTA1MTY1NjhkYzk1/ZTRiMmU4ODRhYi8z/MjNjNi9hbHVtaW51/bS1oeWRyb3hpZGUt/dGFibGV0cy1ib3gu/cG5n', symp: ['Occasional constipation', 'Heartburn', 'Acid indigestion'], side: ['Diarrhea', 'Abdominal cramping', 'Nausea'], gen: 'Antacid / Laxative' },
            { name: 'Bisacodyl', url: 'https://imgs.search.brave.com/oC0jCfkqsUbGKXEWjUTPUHG9XWdtJE2Hwje7RIaUjtc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Z3J4c3RhdGljLmNv/bS9kNGZ1cXFkNWwz/ZGJ6L3Byb2R1Y3Rz/L1BhY2thZ2VfMjg4/NTkuSlBHP3dpZHRo/PTM4NCZxdWFsaXR5/PTg1JmF1dG89d2Vi/cA', symp: ['Constipation', 'Bowel preparation'], side: ['Abdominal cramps', 'Diarrhea', 'Nausea'], gen: 'Stimulant laxative' },
            { name: 'Senna', url: 'https://imgs.search.brave.com/LMplFjwoJzgcWkvGJmKPIMbxDV_Fj5KdMK3ya3Ijo8A/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cHJlc2NyaXB0aW9u/ZG9jdG9yLmNvbS9z/dG9yYWdlL3Byb2R1/Y3RfaW1hZ2VzX3Ro/L251bWFya19zZW5u/YS53ZWJw', symp: ['Occasional constipation'], side: ['Abdominal cramps', 'Diarrhea', 'Dark urine'], gen: 'Stimulant laxative' },
            { name: 'Loperamide', url: 'https://imgs.search.brave.com/2E8zJiVZYVvXlpPo5jkFzxLs2jmTxcoGY2v781l2rNw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9ob21l/aGVhbHRoLXVrLmNv/bS93cC1jb250ZW50/L3VwbG9hZHMvTG9w/ZXJhbWlkZV8wNy5q/cGc', symp: ['Acute diarrhea', 'Chronic diarrhea'], side: ['Constipation', 'Dizziness', 'Dry mouth'], gen: 'Antidiarrheal' },
            { name: 'Racecadotril', url: 'https://imgs.search.brave.com/RIBjCQUTFLEH3ywRX6M79ChLAxpLgMvL51cMYSP1Xek/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jcGlt/Zy50aXN0YXRpYy5j/b20vMDcxMzQwMjUv/Yi81L1JhY2VjYWRv/dHJpbC1TYWNoZXQu/anBn', symp: ['Acute diarrhea (watery)'], side: ['Headache', 'Skin rash', 'Tonsillitis'], gen: 'Antidiarrheal (Enkephalinase inhibitor)' },
            { name: 'Montelukast', url: 'https://imgs.search.brave.com/r1YetJaAAM8SMBbIbcXYLxTDe0l2dh1Y1i16NBc3Jy4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9tb250/ZWx1a2FzdC1kcnVn/LXByZXNjcmlwdGlv/bi1tZWRpY2F0aW9u/LXBpbGxzLWJvdHRs/ZS1zdG9jay1waG90/by1tb250ZWx1a2Fz/dC1kcnVnLXByZXNj/cmlwdGlvbi1tZWRp/Y2F0aW9uLXBpbGxz/LWJvdHRsZS0yNzA0/MTU1NDguanBn', symp: ['Asthma prevention', 'Allergic rhinitis'], side: ['Headache', 'Stomach pain', 'Mood changes'], gen: 'Leukotriene receptor antagonist' },
            { name: 'Theophylline', url: 'https://imgs.search.brave.com/O2bKxEVzz67nMG63quLxKr8b5TZDNP_Txe3vCiQdzhU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Z3J4c3RhdGljLmNv/bS9kNGZ1cXFkNWwz/ZGJ6L3Byb2R1Y3Rz/L1BhY2thZ2VfMzQ3/NDAuSlBHP3dpZHRo/PTM4NCZxdWFsaXR5/PTg1JmF1dG89d2Vi/cA', symp: ['Asthma', 'COPD', 'Chronic bronchitis'], side: ['Nausea', 'Rapid heart rate', 'Insomnia'], gen: 'Bronchodilator (Xanthine derivative)' }
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

        console.log('Batch 4 Update Complete.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateBatch4();
