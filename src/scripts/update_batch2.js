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

async function updateBatch2() {
    try {
        await mongoose.connect(MONGODB_URI);
        const Medicine = mongoose.model('Medicine', MedicineSchema);

        const data = [
            { name: 'Ciprofloxacin', url: 'https://imgs.search.brave.com/K1ljO9Xwu-EizU6Ekb-6pM8-DrdvLzY_wFZSevbdals/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzE4Lzc3LzU1LzY3/LzM2MF9GXzE4Nzc1/NTY3NjFfVXRraGNr/V0F6N1JhOHdTRlRr/N0Y5VHBncU1BN1VT/ZEUuanBn', symp: ['Bacterial infection', 'UTI', 'Prostatitis'], side: ['Nausea', 'Diarrhea', 'Tendon rupture (rare)'], gen: 'Fluoroquinolone antibiotic' },
            { name: 'Losartan', url: 'https://imgs.search.brave.com/ugVJgFFL0t_OSJvU570lbjvFxR079p_jNYQBX3GVvNk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9sb3Nh/cnRhbi1hbmdpb3Rl/bnNpbi1iiS1yZWNl/cHRvci1hbnRhZ29u/aXN0LWh5cGVydGVu/c2lvbi1hbmdpb3Rl/bnNpbi1yZWNlcHRv/ci1ibG9ja2VyLWFy/Yi10YWJsZXQtbG9z/YXJ0YW4tMjc3MDQw/NTc1LmpwZw', symp: ['Hypertension', 'Diabetic nephropathy'], side: ['Dizziness', 'Fatigue', 'High potassium'], gen: 'Angiotensin II receptor blocker' },
            { name: 'Ranitidine', url: 'https://imgs.search.brave.com/DlTwHQdwUHAueETdTwJsY22rDZqkEdq5_ZWEIMPY56I/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA2LzE0LzM0Lzk2/LzM2MF9GXzYxNDM0/OTYyNl9Da3BEMHU5/ajUzVWJ5emNVODc2/dWlSVGJMakRFbWQ5/by5qcGc', symp: ['Heartburn', 'Acid reflux', 'GERD'], side: ['Headache', 'Constipation', 'Diarrhea'], gen: 'H2-receptor antagonist' },
            { name: 'Budesonide', url: 'https://imgs.search.brave.com/zIGfIaGrnzJs89QfbTCdXMUX2ttdy6M9J8Rihfgpqas/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA2LzAwLzA4LzUz/LzM2MF9GXzYwMDA4/NTM4MF9yblBCRDBP/ZTZTSGRFY1ZTZ1lu/Uk42THJHMWdKZHJq/US5qcGc', symp: ['Asthma', 'COPD', 'Crohn\'s disease'], side: ['Throat irritation', 'Hoarseness', 'Cough'], gen: 'Glucocorticoid' },
            { name: 'Prednisolone', url: 'https://imgs.search.brave.com/bkgsNNblCqcFamJdL8jBszUXlQcYM5Us49n9FgWCluQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/c2h1dHRlcnN0b2Nr/LmNvbS9pbWFnZS1w/aG90by9wcmVkbmlz/b2xvbmUtbWVkaWNh/dGlvbi11c2VkLXRy/ZWF0LXZhcmlldHkt/MjYwbnctMjMxMzU0/MzE3OS5qcGc', symp: ['Inflammation', 'Arthritis', 'Allergies'], side: ['Weight gain', 'Increased appetite', 'Insomnia'], gen: 'Systemic corticosteroid' },
            { name: 'Warfarin', url: 'https://imgs.search.brave.com/UajKBAmg8GxOWox-cl-r8X5nnuvTL65SKRoqMlfQr88/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi93YXJm/YXJpbi1kcnVnLXBp/bGwtbWVkaWNhdGlv/bi1vYi1ibHVlLWJh/Y2tncm91bmQtc3Rv/Y2stcGhvdG8td2Fy/ZmFyaW4tZHJ1Zy1w/aWxsLW1lZGljYXRp/b24tb2ItYmx1ZS1i/YWNrZ3JvdW5kLTI3/MDQyODcwNC5qcGc', symp: ['Blood clotting', 'DVT prevention', 'Atrial fibrillation'], side: ['Bleeding', 'Bruising', 'Gum bleeding'], gen: 'Anticoagulant (Vitamin K antagonist)' },
            { name: 'Clopidogrel', url: 'https://imgs.search.brave.com/KasTY_f0M3XrlY0TBAk00vdEg5PrdD7k7pP1jVjZXIg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA1LzIyLzczLzc2/LzM2MF9GXzUyMjcz/NzY5OF9lOEJTVVFr/em84elZkT3hSYnhF/YnJhWGNGM2ZIRlF0/Ny5qcGc', symp: ['Heart attack prevention', 'Stroke prevention'], side: ['Bleeding', 'Headache', 'Dizziness'], gen: 'Antiplatelet agent' },
            { name: 'Digoxin', url: 'https://imgs.search.brave.com/Rcg24YNq79S5OAyO8WpVysPCCBp6uYeM3dlXMpK5I8k/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9kaWdv/eGluLW1lZGljYXRp/b24tcGxhc3RpYy12/aWFsLXVzZWQtdHJl/YXRtZW50LWhlYXJ0/LWZhaWx1cmUtY2Vy/dGFpbi1hcnJoeXRo/bWlhcy1hdmFpbGFi/bGUtdGFibGV0LTI3/Nzg0MTI1MC5qcGc', symp: ['Heart failure', 'Atrial fibrillation'], side: ['Nausea', 'Visual disturbances', 'Arrhythmia'], gen: 'Cardiac glycoside' },
            { name: 'Furosemide', url: 'https://imgs.search.brave.com/doug7ryYxrufiOmIlxzp1hls0FxgPVRLsD6MhRjDKAk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMuYWxvZG9rdGVy/LmNvbS9dk06NHVt/czMvaW1hZ2UvdXBs/b2FkL3YxNjUwOTQx/MTEwL2F0dGFjaGVk/X2ltYWdlL2Z1cm9z/ZW1pZGUtMC1hbG9k/b2t0ZXIuanBn', symp: ['Edema', 'Heart failure swelling', 'Hypertension'], side: ['Dehydration', 'Low potassium', 'Frequent urination'], gen: 'Loop diuretic' },
            { name: 'Spironolactone', url: 'https://imgs.search.brave.com/WevOd3-x7tAx3qpnP_KSuI62VJO9GuwSeGg3OZeT7QE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9zcGly/b25vbGFjdG9uZS1z/cGlyb25vbGFjdG9u/ZS10b3hpY29sb2d5/LXNjcmVlbi11cmlu/ZS10ZXN0cy1kb3Bp/bmctZHJ1Z3Mtc3Bp/cm9ub2xhY3RvbmUt/c3Bpcm9ub2xhY3Rv/bmUtdG94aWNvbG9n/eS1zY3JlZW4tMjcw/Njg2NzU2LmpwZw', symp: ['Heart failure', 'Hyperaldosteronism', 'Acne'], side: ['Breast tenderness', 'Hyperkalemia', 'Dizziness'], gen: 'Potassium-sparing diuretic' },
            { name: 'Diazepam', url: 'https://imgs.search.brave.com/e7_SLswovNN6FKfVbYjtaoVLWBRogVvw3OGMW-jjmHE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9yZW5k/ZXIuZmluZWFydGFt/ZXJpY2EuY29tL2lt/YWdlcy9pbWFnZXMt/cHJvZmlsZS1mbG93/LzQwMC9pbWFnZXMv/YXJ0d29ya2ltYWdl/cy9tZWRpdW1sYXJn/ZS8yL3ZpYWwtb2Yt/ZGlhemVwYW0td2xh/ZGltaXItYnVsZ2Fy/c2NpZW5jZS1waG90/by1saWJyYXJ5Lmpw/Zw', symp: ['Anxiety', 'Muscle spasms', 'Alcohol withdrawal'], side: ['Drowsiness', 'Fatigue', 'Ataxia (clumsiness)'], gen: 'Benzodiazepine' },
            { name: 'Alprazolam', url: 'https://imgs.search.brave.com/Esk6wE7QWwP0T8BDb-UAXriipXxnH5gLI1sBK7bZCN4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9hbHBy/YXpvbGFtLW1lZGlj/YWwtdmlhbC1waWxs/cy1tZWRpY2FsLXBp/bGxzLW9yYW5nZS1w/bGFzdGljLXByZXNj/cmlwdGlvbi1tb3N0/LXBvcHVsYXItbWVk/aWNpbmUtYWxwcmF6/b2xhbS1tZWRpY2Fs/LXZpYWwtMjY2OTc5/NTg2LmpwZw', symp: ['Panic attacks', 'Generalized anxiety', 'Insomnia (short-term)'], side: ['Sedation', 'Lightheadedness', 'Memory impairment'], gen: 'Benzodiazepine' },
            { name: 'Sertraline', url: 'https://imgs.search.brave.com/QOdnLSKoyuvdDv2hK2myfXTSutjsPemqvjcmr9_yGQ8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9zZXJ0/cmFsaW5lLXNlcnRy/YWxpbmUtc2VsZWN0/aXZlLXNlcm90b25p/bi1yZXVwdGFrZS1p/bmhpYml0b3Itc3Ry/aS1kZXByZXNzaW9u/LWFueGlldHktc3Ry/aS1hbnRpZGVwcmVz/c2FudC10YWJsZXQt/Mjc4MjgwODczLmpw/Zw', symp: ['Depression', 'OCD', 'Social anxiety'], side: ['Nausea', 'Sexual dysfunction', 'Insomnia'], gen: 'SSRI Antidepressant' },
            { name: 'Fluoxetine', url: 'https://imgs.search.brave.com/Ny_UgyX7XQaj7OK_-GMIYCyBs2lVDo70BPVYySlOGRE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly81Lmlt/aW1nLmNvbS9kYXRh/NS9TRUxMRVIvRGVm/YXVsdC8yMDIyLzgv/SksvV1cvUksvMTgw/MzIwMi9mbHVveGV0/aW5lLTYwLW1nLTQw/LW1nLTIwLW1nLWNh/cHN1bGUtMjUweDI1/MC5wbmc', symp: ['Major depression', 'Bulimia nervosa', 'Panic disorder'], side: ['Anxiety', 'Tremor', 'Nervousness'], gen: 'SSRI Antidepressant' },
            { name: 'Haloperidol', url: 'https://imgs.search.brave.com/lsLohaMlbt3UiIJDRVEd0VL9XKJVAw2kn33lEXmotOE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9idXp6/cnguczMuYW1hem9u/YXdzLmNvbS9ncy9E/cnVnSXRlbV8xMzk2/My5KUEc', symp: ['Schizophrenia', 'Psychosis', 'Tourette\'s'], side: ['Extrapyramidal symptoms', 'Dry mouth', 'Tardive dyskinesia'], gen: 'Typical Antipsychotic' },
            { name: 'Risperidone', url: 'https://imgs.search.brave.com/5QILVXvdZskfmIcVoWtojMJCXuzuOFVf3gVt_aC5KUA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/c2h1dHRlcnN0b2Nr/LmNvbS9pbWFnZS1w/aG90by9yaXNwZXJp/ZG9uZS1hdHlwaWNh/bC1hbnRpcHN5Y2hv/dGljLXNjaGl6b3Bo/cmVuaWEtYmlwb2xh/ci0yNjBudy0yMzA2/NDQyNDEzLmpwZw', symp: ['Bipolar disorder mania', 'Schizophrenia', 'Autistic irritability'], side: ['Weight gain', 'Drowsiness', 'Diabetes risk'], gen: 'Atypical Antipsychotic' },
            { name: 'Ondansetron', url: 'https://imgs.search.brave.com/juVA15huT2WMlL_2GBj7xhkq3WcCgxX92IUrPCaJu0Q/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Z3J4c3RhdGljLmNv/bS9kNGZ1cXFkNWwz/ZGJ6L3Byb2R1Y3Rz/L1BhY2thZ2VfMTkw/MDQuSlBHP3dpZHRo/PTM4NCZxdWFsaXR5/PTg1JmF1dG89d2Vi/cA', symp: ['Nausea', 'Vomiting after chemo', 'Post-operative vomiting'], side: ['Headache', 'Constipation', 'Fatigue'], gen: '5-HT3 receptor antagonist' },
            { name: 'Metoclopramide', url: 'https://imgs.search.brave.com/lRlpFkzSrYMoVpFu3s5eNwRsQ7vyyn_rZhQL38S8cqU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/c2h1dHRlcnN0b2Nr/LmNvbS9pbWFnZS1w/aG90by9tZXRvY2xv/cHJhbWlkZS1nYXN0/cm9pbnRlc3RpbmFs/LW1vdGlsaXR5LXN0/aW11bGFudC1hbnRp/ZW1ldGljLTI2MG53/LTIzMDg2MzI2MjUu/anBn', symp: ['Gastroparesis', 'GERD relief', 'Nausea prevention'], side: ['Fatigue', 'Drowsiness', 'Restlessness'], gen: 'Dopamine-receptor antagonist' },
            { name: 'Zinc', url: 'https://imgs.search.brave.com/v6TJNVGKWpGIqhrGG9o5h5NBBTkIRKMwT50Rlk7Zk2g/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/bXl2aXRhbWlucy5j/b20vaW1hZ2VzP3Vy/bD1odHRwczovL3N0/YXRpYy50aGNkbi5j/b20vcHJvZHVjdGlt/Zy9vcmlnaW5hbC8x/MDU3NTI2MS0xMzg0/OTA0NDEzNTY2MTk1/LmpwZyZmb3JtYXQ9/d2VicCZhdXRvPWF2/aWYmd2lkdGg9NzAw/JmZpdD1jb3Zlcg', symp: ['Zinc deficiency', 'Immune support', 'Common cold'], side: ['Metallic taste', 'Nausea', 'Stomach pain'], gen: 'Essential Trace Mineral' },
            { name: 'Vitamin D', url: 'https://imgs.search.brave.com/X8_vXdaJxEJ16kFQOtm68Wzp6J_hvo3YKU53YD4qLqk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTQy/MjAzMTY5NC9waG90/by92aXRhbWluLWQu/anBnP3M9NjEyeDYx/MiZ3PTAmaz0yMCZj/PTg5eWI3cjk3VmZw/Y0xreFdRU0NUeTJI/TGl6bTJjSDRiNlJu/Wmw0Z3Z0LTQ9', symp: ['Vitamin D deficiency', 'Osteoporosis prevention', 'Bone health'], side: ['Rare (Excess can cause high calcium)'], gen: 'Fat-soluble vitamin (Calciferol)' }
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

        console.log('Batch 2 Update Complete.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateBatch2();
