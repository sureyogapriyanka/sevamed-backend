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

async function updateBatch3() {
    try {
        await mongoose.connect(MONGODB_URI);
        const Medicine = mongoose.model('Medicine', MedicineSchema);

        const data = [
            { name: 'Calcium', url: 'https://imgs.search.brave.com/18PCLWcFHgknq0c2CsbCHCLfqVxBv06XOARFSbzHaQg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9ydWtt/aW5pbTIuZmxpeGNh/cnQuY29tL2ltYWdl/LzYxMi82MTIveGlm/MHEvdml0YW1pbi1z/dXBwbGVtZW50L3Uv/di9oLzEwMC1jYWxj/aXVtLW11bHRpdml0/YW1pbi10YWJsZXRz/LWZvci1oZWFsdGh5/LWJvZHktc3BlY2lh/bC1vcmlnaW5hbC1p/bWFoaDdwM3NneHhr/d2dxLmpwZWc_cT03/MA', symp: ['Calcium deficiency', 'Bone health', 'Hypocalcemia'], side: ['Constipation', 'Kidney stones (excess)', 'Nausea'], gen: 'Mineral Supplement' },
            { name: 'Iron', url: 'https://imgs.search.brave.com/w5io172F9B4g8aLlCgi1Pjc0eUKE4qjbAd-y87SjTao/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzE1LzQ2Lzg0Lzc2/LzM2MF9GXzE1NDY4/NDc2NTFfazV0NXRy/WklsdUViMWJuMGFs/Q1JyNm42V3ZJZHM3/UFIuanBn', symp: ['Iron deficiency anemia', 'Pregnancy supplement'], side: ['Constipation', 'Dark stools', 'Upset stomach'], gen: 'Mineral Supplement (Ferrous sulfate)' },
            { name: 'Folic acid', url: 'https://imgs.search.brave.com/pfJvCCuAsW9MBNhxv2NuxcIClWzUG5Dz4l3sG4SHXjI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA5Lzc2LzY4Lzkx/LzM2MF9GXzk3NjY4/OTEwM19TUzBjdTNi/WWlROTVCYUFLdkRO/eE5lMWlGZU1pdFpt/TC5qcGc', symp: ['Folate deficiency', 'Pregnancy support'], side: ['Nausea', 'Loss of appetite', 'Bloating'], gen: 'Vitamin B9' },
            { name: 'Ceftriaxone', url: 'https://imgs.search.brave.com/8AJIBOhh_Em6Htq-TYhWb_4X5ffQJxFdsg4yuGAu1Wg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/cGltLm1lc29pZ25l/ci5mci9tZXNvaWdu/ZXIvOTI2YjIwMzgx/MzdlMTg4ZWJjYjNh/MGVjYTkwNjg2MDcv/bWVzb2lnbmVyLXRo/dW1ibmFpbC0zMDAt/MzAwLWluc2V0LzYx/MC80MzUvY2VmdHJp/YXhvbmUtZWctMS1n/LTMtNS1tbC1wb3Vk/cmUtZXQtc29sdmFu/dC1wb3VyLXNvbHV0/aW9uLWluamVjdGFi/bGUtaW0ud2VicA', symp: ['Severe bacterial infections', 'Meningitis', 'Pneumonia'], side: ['Diarrhea', 'Injection site pain', 'Rash'], gen: 'Cephalosporin antibiotic' },
            { name: 'Meropenem', url: 'https://imgs.search.brave.com/ZnxExLA6MieqE2h7w1MBZFz8PsWeq7GxFx9Ae-t-2qQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly81Lmlt/aW1nLmNvbS9kYXRh/NS9TRUxMRVIvRGVm/YXVsdC8yMDI1Lzgv/NTMzNTQ2MzA1L0RE/L0hHL1JZLzMwMTA3/NTAvbWVyb3BlbmVt/LXN1bGJhY3RhbS1m/b3ItaW5qZWN0aW9u/LTEtNWdtLTUwMHg1/MDAuanBn', symp: ['Severe bacterial infections', 'Sepsis', 'Intra-abdominal infections'], side: ['Headache', 'Nausea', 'Seizures (rare)'], gen: 'Carbapenem antibiotic' },
            { name: 'Vancomycin', url: 'https://imgs.search.brave.com/NP0K8R9C_7CVjY1_espgoCMlXxS7_cIxp0zSTW-NmQk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzE3Lzc4LzAyLzU3/LzM2MF9GXzE3Nzgw/MjU3NzlfZHJEck0w/Y2t5MkM1ZzNYRzZH/akZmTjNCbnZNWnBO/U2EuanBn', symp: ['MRSA infections', 'Severe bacterial infections'], side: ['Red Man Syndrome', 'Kidney damage', 'Hearing loss (rare)'], gen: 'Glycopeptide antibiotic' },
            { name: 'Lidocaine', url: 'https://imgs.search.brave.com/FBQm0hpQqZBkjlxG0PwP94v_5uz27OfAZ7eRLCauCmU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/c2h1dHRlcnN0b2Nr/LmNvbS9pbWFnZS1w/aG90by9saWRvY2Fp/bmUtbG9jYWwtYW5l/c3RoZXRpYy1tZWRp/Y2F0aW9uLXVzZWQt/MjYwbnctMjMxMzY1/MjcyNy5qcGc', symp: ['Local anesthesia', 'Ventricular arrhythmias'], side: ['Drowsiness', 'Dizziness', 'Tingling'], gen: 'Local anesthetic / Antiarrhythmic' },
            { name: 'Propofol', url: 'https://imgs.search.brave.com/iYCsXyM-ZmDtNylEsTRSiBJ9CDhOs41KxzHpoHpd4rY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/dWNoaWNhZ29tZWRp/Y2luZS5vcmcvX25l/eHQvaW1hZ2U_dXJs/PWh0dHBzOi8vZWRn/ZS5zaXRlY29yZWNs/b3VkLmlvL3VuaWNo/aWNhZ29tYy04MW5i/cW5iMy9tZWRpYS9p/bWFnZXMvdWNtYy9m/b3JlZnJvbnQvdW5p/dmVyc2FsLWltYWdl/L3Byb3BvZm9sLXVu/aXZlcnNhbC5qcGc_/c2NfbGFuZz1lbiZ3/PTM4NDAmcT03NQ', symp: ['General anesthesia setup', 'Sedation'], side: ['Pain at injection site', 'Low blood pressure', 'Slow heart rate'], gen: 'General anesthetic' },
            { name: 'Tramadol', url: 'https://imgs.search.brave.com/vFfG5F0KXVKzhN_BxieUS49erFBEMbXGLoDnpauYKTU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMuY3RmYXNzZXRz/Lm5ldC9pcDc0bXFt/Zmd2cWYvNDJJVTFs/NGpVNHU4VTZlYWNx/R01nQy9kZTI4Mjll/ZjgzM2IxODc2Y2E5/YTQxMmY3M2IxNjIy/My9GUkFOS19kcnVn/X2ltYWdlX3RyYW1h/ZG9sLmpwZz9maXQ9/c2NhbGUmZj1ib3R0/b20mcT03MCZmbT13/ZWJwJnc9Mzg0MA', symp: ['Moderate to severe pain'], side: ['Dizziness', 'Nausea', 'Constipation', 'Seizure risk'], gen: 'Opioid analgesic' },
            { name: 'Codeine', url: 'https://imgs.search.brave.com/3MZuy1hIxSOB3F0oCYdjpdfE0VM-jy2DKryM9h9Cltk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzEzLzA5LzE5LzU0/LzM2MF9GXzEzMDkx/OTU0ODJfVEdzOGxh/cTUzOGd6akRjaENJ/a1B3ZGtRaW1xd3BN/TEEuanBn', symp: ['Mild to moderate pain', 'Cough suppression'], side: ['Drowsiness', 'Constipation', 'Nausea'], gen: 'Opioid analgesic / Antitussive' },
            { name: 'Carbimazole', url: 'https://imgs.search.brave.com/uNIUGBBE42fcsX2A8fnqPy_6ber9ntQb2vQD_dhou50/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly81Lmlt/aW1nLmNvbS9kYXRh/NS9TRUxMRVIvRGVm/YXVsdC8yMDI0Lzkv/NDQ3NzAwNTczL01D/L1SVL1pYLzIyMzA3/NTE1OC9sZWVjYXJi/aW1hem9sZTUtY2Fy/YmltYXpvbGUtaXAt/NS1tZy0yNTB4MjUw/LmpwZw', symp: ['Hyperthyroidism', 'Graves disease'], side: ['Nausea', 'Headache', 'Low white blood cell count'], gen: 'Antithyroid agent' },
            { name: 'Propranolol', url: 'https://imgs.search.brave.com/jdTxEBZ-YoS8nOtXq-sMSs20s_GhVSv9YwxycFH7hf8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/c2h1dHRlcnN0b2Nr/LmNvbS9pbWFnZS1w/aG90by9wcm9wcmFu/b2xvbC1waWxsLWRy/dWctYmV0YS1ibG9j/a2VyLTI2MG53LTIy/MDMyMzc5MTEuanBn', symp: ['Hypertension', 'Anxiety (physical symptoms)', 'Migraine prevention'], side: ['Fatigue', 'Cold extremities', 'Sleep disturbances'], gen: 'Beta-blocker' },
            { name: 'Atenolol', url: 'https://imgs.search.brave.com/VIopnkDK5An4EpWaA1R8MoSny18lzKmJvubWJtjqEWY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/c2h1dHRlcnN0b2Nr/LmNvbS9pbWFnZS1w/aG90by9hdGVub2xv/bC1iZXRhLWJsb2Nr/ZXItcGlsbC1tZWRp/Y2F0aW9uLTI2MG53/LTE4Mzg5MDcxNjku/anBn', symp: ['Hypertension', 'Angina'], side: ['Fatigue', 'Slow heart rate', 'Dizziness'], gen: 'Beta-blocker' },
            { name: 'Enalapril', url: 'https://imgs.search.brave.com/yJCJ2LFZT4mDiZVD1N0ueK2ddLBSnKcwtyWITLKkstw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cHJhY3Rvc3RhdGlj/LmNvbS9wcmFjdG9w/ZWRpYS12Mi1pbWFn/ZXMvcmVzLTc1MC8y/MDQyN2E4NmM1ZmM0/ZjgyYzEyMTdkYTkw/Y2M3ZGVmM2NlMTg4/NGVkMS5KUEc', symp: ['Hypertension', 'Heart failure'], side: ['Dry cough', 'Dizziness', 'High potassium'], gen: 'ACE inhibitor' },
            { name: 'Ramipril', url: 'https://imgs.search.brave.com/lM-lzg3t4YFrZi3tHav9s0K2ysmKcKS6SluctgiLlpY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9yYW1p/cHJpbC1tZWRpY2F0/aW9uLXBsYXN0aWMt/dmlhbC11c2VkLXRv/LXRyZWF0LWh5cGVy/dGVuc2lvbi1jb25n/ZXN0aXZlLWhlYXJ0/LWZhaWx1cmUtYXZh/aWxhYmxlLW9yYWwt/Y2Fwc3VsZXMtMjc4/MjgwODI5LmpwZw', symp: ['Hypertension', 'Heart failure', 'Post-heart attack'], side: ['Dry cough', 'Dizziness', 'Fatigue'], gen: 'ACE inhibitor' },
            { name: 'Hydrochlorothiazide', url: 'https://imgs.search.brave.com/vuX_KvyBs4rdRsSh8BFXV8EOe9EFBts9c394VspS53U/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTQz/Mjk4Mjc1MC9waG90/by9oeWRyb2NobG9y/b3RoaWF6aWRlLXBp/bGwtYm90dGxlLWNv/bmNlcHR1YWwtaW1h/Z2UuanBnP3M9NjEy/eDYxMiZ3PTAmaz0y/MCZjPUhGMzdJSEhJ/dDNHWW1JMnN0OFlQ/N09DdUhmWnRsTDZ0/VUlEZk9lNy02Qnc9', symp: ['Hypertension', 'Edema'], side: ['Low potassium', 'Frequent urination', 'Dehydration'], gen: 'Thiazide diuretic' },
            { name: 'Nitroglycerin', url: 'https://imgs.search.brave.com/t4MHPiN9vxeZDK9AELbBAMZBdUinjNoSuWbh-D-ncu8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Z3J4c3RhdGljLmNv/bS9kNGZ1cXFkNWwz/ZGJ6L3Byb2R1Y3Rz/L1BhY2thZ2VfMjY1/MjIuSlBHP3dpZHRo/PTM4NCZxdWFsaXR5/PTg1JmF1dG89d2Vi/cA', symp: ['Angina (chest pain)'], side: ['Headache', 'Dizziness', 'Low blood pressure'], gen: 'Nitrate vasodilator' },
            { name: 'Isosorbide', url: 'https://imgs.search.brave.com/uGHPyfABwzC65dNPffmJopHuJRTxQqcjnZ1w6IdcZ88/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/c2h1dHRlcnN0b2Nr/LmNvbS9zaHV0dGVy/c3RvY2svcGhvdG9z/LzIzMTk0NzMzOTMv/ZGlzcGxheV8xNTAw/L3N0b2NrLXBob3Rv/LWlzb3NvcmJpZGUt/aXMtYW4tYWN0aXZl/LXN1YnN0YW5jZS11/c2VkLXRvLXRyZWF0/LWFuZ2luYS1wZWN0/b3Jpcy1hLXR5cGUt/b2YtY2hlc3QtcGFp/bi1jYXVzZWQtYnkt/YS0yMzE5NDczMzkz/LmpwZw', symp: ['Angina prevention', 'Heart failure'], side: ['Headache', 'Lightheadedness', 'Flushing'], gen: 'Nitrate vasodilator' },
            { name: 'Dabigatran', url: 'https://imgs.search.brave.com/Mypv-PY6aqOU_eG8HQH9hY08TFQrh2fkZSGBseCY124/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jYWZv/bGkuaW4vU3RhdGlj/L1YxL090aGVyUGFn/ZUltYWdlcy9EYWJp/Z2F0cmFuJTIwMTEw/JTIwbWclMjBldGV4/aWxhdGUlMjBjYXBz/dWxlczYzODg4NDMw/MDE1ODQ2ODA5My53/ZWJw', symp: ['Stroke prevention', 'DVT/PE treatment'], side: ['Bleeding', 'Stomach pain', 'Indigestion'], gen: 'Direct thrombin inhibitor (Anticoagulant)' },
            { name: 'Rivaroxaban', url: 'https://imgs.search.brave.com/sffkWNs2zy2HujnOtpnsJaQxaryWL2ZxoNcjZIKLrfM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA5LzYxLzEyLzM1/LzM2MF9GXzk2MTEy/MzU5MV9BeXlpclZC/eU1rdFAwVjFsTFNI/VThkVGVGZGx1anhy/Vy5qcGc', symp: ['DVT/PE treatment', 'Stroke prevention'], side: ['Bleeding risk', 'Back pain', 'Dizziness'], gen: 'Factor Xa inhibitor (Anticoagulant)' }
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

        console.log('Batch 3 Update Complete.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateBatch3();
