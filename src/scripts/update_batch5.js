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

async function updateBatch5() {
    try {
        await mongoose.connect(MONGODB_URI);
        const Medicine = mongoose.model('Medicine', MedicineSchema);

        const data = [
            { name: 'Ipratropium', url: 'https://imgs.search.brave.com/r8aK_571SElthXUfh1sL9TxbyIbv_XVNs1tV793HWq8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Z3J4c3RhdGljLmNv/bS9kNGZ1cXFkNWwz/ZGJ6L3Byb2R1Y3Rz/L1BhY2thZ2VfMjQy/NzQuSlBHP3dpZHRo/PTM4NCZxdWFsaXR5/PTg1JmF1dG89d2Vi/cA', symp: ['COPD exacerbation', 'Asthma', 'Chronic bronchitis'], side: ['Dry mouth', 'Cough', 'Hoarseness'], gen: 'Anticholinergic bronchodilator' },
            { name: 'Fluticasone', url: 'https://imgs.search.brave.com/ALKdRJ2knbCQeaKETG3gJTvQ8Bv-f0c2Rd_X7XBCbCY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzAxLzU3LzIyLzMy/LzM2MF9GXzE1NzIy/MzI5MF9PaHhQSHdr/SGU4emlHZk5SY0ZK/ZXJrVEFnaU84RzdH/VS5qcGc', symp: ['Allergic rhinitis', 'Asthma prevention'], side: ['Nosebleeds', 'Sore throat', 'Headache'], gen: 'Corticosteroid' },
            { name: 'Amikacin', url: 'https://imgs.search.brave.com/SG8lK9iMYE3G4yCKivt_STmFY3dtBB_GGG2cEgvSsis/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly81Lmlt/aW1nLmNvbS9kYXRh/NS9TRUxMRVIvRGVm/YXVsdC8yMDI0LzEw/LzQ1NjI0NTAzMi9J/Ry9VUy9KVy8yNzQ1/MDIwL2FtaWtqZXkt/MjUweDI1MC5qcGVn', symp: ['Severe bacterial infections', 'Sepsis', 'Hospital-acquired pneumonia'], side: ['Kidney damage', 'Hearing loss', 'Dizziness'], gen: 'Aminoglycoside antibiotic' },
            { name: 'Gentamicin', url: 'https://imgs.search.brave.com/gyrRXVcxAIZhRlMQAeIvS4hbVvoNKvShSoLc7cJkA70/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jcGlt/Zy50aXN0YXRpYy5j/b20vMDU4NDAxMDAv/Yi80L0dlbnRhbWlj/aW4tSW5qZWN0aW9u/LVZldGVyaW5hcnku/anBn', symp: ['Bacterial endocarditis', 'Fever with low WBC counts'], side: ['Ototoxicity (hearing loss)', 'Nephrotoxicity (kidney)'], gen: 'Aminoglycoside antibiotic' },
            { name: 'Linezolid', url: 'https://imgs.search.brave.com/UYzkRHVRMmHvcJfeyNHGhvFNnfxm2CppMOodvco52EM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly81Lmlt/aW1nLmNvbS9kYXRh/NS9TRUxMRVIvRGVm/YXVsdC8yMDI0LzUv/NDE2NzkxNjUxL1hK/L0RZL1ZMLzQ1MjUz/MTAxL2xpbmV6b2xp/ZC02MDAtbWctdGFi/bGV0LTI1MHgyNTAu/anBlZw', symp: ['MRSA infections', 'VRE infections', 'Pneumonia'], side: ['Headache', 'Nausea', 'Diarrhea', 'Low platelet count'], gen: 'Oxazolidinone antibiotic' },
            { name: 'Clindamycin', url: 'https://imgs.search.brave.com/pcvcKkEmU-u1Nxh-JSRuoJE73xlHUw2dT1Fk-MaWqcY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/bW91bnRhaW5zaWRl/LW1lZGljYWwuY29t/L2Nkbi9zaG9wL3By/b2R1Y3RzL0NsaW5k/YW15Y2luLVBob3Nw/aGF0ZS0xXy1Ub3Bp/Y2FsLVNvbHV0aW9u/LTYwbUxfNTEyeDUx/Mi5qcGc_dj0xNjc1/Nzc3MTYy', symp: ['Pelvic inflammatory disease', 'Bone/joint infections', 'Acne'], side: ['Diarrhea (C.diff warning)', 'Abdominal pain', 'Nausea'], gen: 'Lincosamide antibiotic' },
            { name: 'Doxycycline', url: 'https://imgs.search.brave.com/WBg09YK3Ugf6a4nBLD0hGyY0hwapACDMhTPetE0AMTQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9kb3h5/Y3ljbGluZS1wcmVz/Y3JpcHRpb24tbWVk/aWNhdGlvbi1ib3R0/bGUtZG94eWN5bGlu/ZS1hbnRpYmlvdGlj/LWJsYWNrLXRpbGUt/YmFja2Ryb3AtMTE1/NTI4MzQ3LmpwZw', symp: ['Lyme disease', 'Malaria prophylaxis', 'Acne', 'Chlamydia'], side: ['Sun sensitivity', 'Nausea', 'Esophageal irritation'], gen: 'Tetracycline antibiotic' },
            { name: 'Metronidazole', url: 'https://imgs.search.brave.com/wfl62sAGu_U7MxRw2lI9QI853a2aWQhz5ygl-Q1ZVUY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTQz/Mjk4MTc4Ni9waG90/by9tZXRyb25pZGF6/b2xlLXBpbGwtY29u/Y2VwdHVhbC1pbWFn/ZS5qcGc_cz02MTJ4/NjEyJnc9MCZrPTIw/JmM9b293WlhkYzU4/Rm9iN2VmdjFrUWds/UGdYbUxXM1diVUxy/Z2FwRjZnNmY1VT0', symp: ['Amoebiasis', 'Trichomoniasis', 'Bacterial vaginosis'], side: ['Metallic taste', 'Dark urine', 'Nausea with alcohol'], gen: 'Nitroimidazole antibiotic' },
            { name: 'Tinidazole', url: 'https://imgs.search.brave.com/oxbYIx3sPIVqx4BWX6hp7eubIFYCyfUcKr_vLRMVBHs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Y2ZzcGhhcm1hY3ku/cGhhcm1hY3pvbGUvaW4vdGhpcy1tZXNzYWdlL2 NhcHN1bGVzLmpwZw', symp: ['Giardiasis', 'Amoebiasis', 'Bacterial infections'], side: ['Metallic taste', 'Stomach pain', 'Headache'], gen: 'Nitroimidazole antibiotic' },
            { name: 'Acyclovir', url: 'https://imgs.search.brave.com/T0UcinyoDzoSQnW0A4IhC0pFoNMtQSCsICIPZ3i3q3Q/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzE1LzI3LzQwLzQz/LzM2MF9GXzE1Mjc0/MDQzNjdfaDNKMjF3/Z2VDdTF6bVExNFFz/RlF0b0tRNlhqbG9V/eEwuanBn', symp: ['Herpes simplex', 'Varicella-Zoster (Shingles)', 'Chickenpox'], side: ['Malaise', 'Nausea', 'Kidney crystallization (if dehydrated)'], gen: 'Antiviral' },
            { name: 'Oseltamivir', url: 'https://imgs.search.brave.com/oLgi6CWNdMn3w80zqEkYdf7XGKrxG1jCxBjzLTOHVf8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvNDky/MDI2NjY1L3Bob3Rv/L29zZWx0YW1pdmly/LmpwZz9zPTYxMng2/MTImdz0wJms9MjAm/Yz1Ma0hreU52QmdJ/N085WDFCeEowQWNL/d2lrZlMzcGd2OGdw/Ykt2a0hqdkxBPQ', symp: ['Influenza A & B'], side: ['Nausea', 'Vomiting', 'Headache'], gen: 'Neuraminidase inhibitor (Antiviral)' },
            { name: 'Fluconazole', url: 'https://imgs.search.brave.com/-_p46urjAUzSGNRE-81zkROFjmduFSReUsV7OI4KX7Y/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jb250/ZW50LmpwZz9xdWFsaXR5/PTg1JmF1dG89d2Vi/cA', symp: ['Candidiasis (Yeast infection)', 'Cryptococcal meningitis'], side: ['Nausea', 'Abdominal pain', 'Rash'], gen: 'Azole antifungal' },
            { name: 'Amphotericin B', url: 'https://imgs.search.brave.com/WcqHKfUATOom5pWEDQuZEz6GYZ7t6cgVXqLvZG0Zj-8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jcGlt/Zy50aXN0YXRpYy5j/b20vMDc2ODgwNDkv/Yi80LyUwbWctTGlw/b3NvbWFsLUFtcGhv/dGVyaWNpbi1CLUlu/amVjdGlvbi5qcGc', symp: ['Systemic fungal infections', 'Visceral leishmaniasis'], side: ['Infusion reactions (fever/chills)', 'Kidney toxicity'], gen: 'Polyene antifungal' },
            { name: 'Hydroxychloroquine', url: 'https://imgs.search.brave.com/CMFs0cKg6Oye8yY4FpsMe9tziyR9lOti8OEV8YqsNZ4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTI3/MDczODMzOS9waG90/by9oeWRyb3h5Y2hs/b3JvcXVpbmUtaW4t/d2hpdGUtYm90dGxl/LXBhY2thZ2luZy13/aXRoLXNjYXR0ZXJl/ZC1waWxscy1pc29s/YXRlZC1vbi1ibHVl/LWJhY2tncm91bmQu/anBnP3M9NjEyeDYx/MiZ3PTAmaz0yMCZj/PUluSWdZWTU0ZUhG/ZlBodHkxUGVwZFFm/UDJ4UFhwUDl6aXE1/c2hDb1M4cTg9', symp: ['Malaria', 'Rheumatoid arthritis', 'Lupus'], side: ['Retinal damage (long term)', 'Heart rhythm issues', 'Nausea'], gen: 'Antimalarial / DMARD' },
            { name: 'Methotrexate', url: 'https://imgs.search.brave.com/d3rGc_1co9eojLTD3q4sFBEBovEZ8_L_rsCArhl1hpE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9tZXRo/b3RyZXhhdGUtZHJ1/Zy1waWxsLW1lZGlj/YXRpb24tb2ItYmx1/ZS1iYWNrZ3JvdW5k/LXN0b2NrLXBob3Rv/LW1ldGhvdHJleGF0/ZS1kcnVnLXBpbGwt/bWVkaWNhdGlvbi1v/Yi1ibHVlLWJhY2tn/cm91bmQtMjcwNjc5/MzI4LmpwZw', symp: ['Rheumatoid arthritis', 'Psoriasis', 'Various cancers'], side: ['Liver toxicity', 'Low blood cell count', 'Stomatitis'], gen: 'Antimetabolite / Immunosuppressant' },
            { name: 'Cyclophosphamide', url: 'https://imgs.search.brave.com/thrp9iCCDnjUGt-Ba5n0kER2LU6pbB6Ic3AIr6gs83o/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzE2LzU5LzM2LzE1/LzM2MF9GXzE2NTkz/NjE1NzRfVHA5MHpR/Y3o4Vjd0bHZGU044/YzdScVRvbnFOYnBK/MGguanBn', symp: ['Lymphoma', 'Multiple myeloma', 'Leukemia'], side: ['Hair loss', 'Hemorrhagic cystitis (bladder)', 'Nausea'], gen: 'Alkylating agent (Chemotherapy)' },
            { name: 'Vincristine', url: 'https://imgs.search.brave.com/etgn6J5cUGpJ-TPhEFOWPcmF7cHGP_pgnPosoFVONbU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/aW1wYWN0Z3VydS5j/b20vaW5mby93cC1j/b250ZW50L3VwbG9h/ZHMvMjAyMy8wNS9W/aW5jcmlzdGluZS00/LmpwZw', symp: ['Acute leukemia', 'Hodgkin\'s disease'], side: ['Peripheral neuropathy (numbness)', 'Constipation'], gen: 'Vinca alkaloid (Chemotherapy)' },
            { name: 'Paclitaxel', url: 'https://imgs.search.brave.com/xGOMsIhRAIYMplPEQTqK9lfmr9flBtrRQBOLaZzhWEk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly81Lmlt/aW1nLmNvbS9kYXRh/NS9TRUxMRVIvRGVm/YXVsdC8yMDI1LzEx/LzU2MzcxOTE4OC9K/RS9aVy9DVC8yNDI5/ODIwMjcvcGFjbGl0/ZXJvLTEwMG1nLWlu/amVjdGlvbnBhY2xp/dGF4ZWwtMjUweDI1/MC5qcGVn', symp: ['Breast cancer', 'Ovarian cancer', 'NSCLC'], side: ['Muscle/joint pain', 'Hair loss', 'Nausea'], gen: 'Taxane (Chemotherapy)' },
            { name: 'Doxorubicin', url: 'https://imgs.search.brave.com/Ro2_uT_DFmcZfS1jB8gSGVpyWNseQ9r3FojS-XtY9vs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aWlt/Zy50aXN0YXRpYy5j/b20vZnAvMS8wMDYv/ODg4L2RveG9ydWJp/Y2luLWluamVjdGlv/bi0yNTIuanBn', symp: ['Acute leukemia', 'Breast cancer', 'Sarcomas'], side: ['Cardiotoxicity', 'Nausea', 'Hair loss'], gen: 'Anthracycline (Chemotherapy)' },
            { name: 'Apixaban', url: 'https://imgs.search.brave.com/Yunz7bbtKz1xFZEMTQOZzk5sqqOELIrxf4clzq9V9dY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA2LzA1Lzc1LzA0/LzM2MF9GXzYwNTc1/MDQ3OV9UNEp3VE9E/Z2dCWndtQjN1Qms4/RGM2TzRoMkRTcGFG/ZS5qcGc', symp: ['DVT treatment', 'Stroke prevention in Afib'], side: ['Bleeding risk', 'Bruising', 'Anemia'], gen: 'Factor Xa inhibitor (Anticoagulant)' }
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

        console.log('Batch 5 Update Complete.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateBatch5();
