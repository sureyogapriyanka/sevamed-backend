const { exec } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const { promisify } = require('util');
const execPromise = promisify(exec);

const UPLOADS_DIR = path.join(__dirname, '../../uploads/reports');

/**
 * Generates a professional Medical Report using Pandoc
 * @param {Object} data - Form data
 * @param {string} format - 'pdf' or 'docx'
 * @returns {Promise<string>} - Path to the generated file
 */
const generateReport = async (data, format = 'pdf') => {
    const filename = `report_${data.appointmentId}_${Date.now()}.${format}`;
    const filePath = path.join(UPLOADS_DIR, filename);
    
    // ... HTML Template content remains same ...
    // [I'll use the existing content logic but wrapped]
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 40px; }
            .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .logo { color: #2563eb; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; }
            .title { font-size: 24px; font-weight: 900; text-align: right; color: #64748b; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 14px; font-weight: 900; color: #2563eb; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
            .value { font-size: 14px; font-weight: 600; color: #0f172a; margin-top: 2px; }
            .checklist { list-style: none; padding: 0; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
            .checklist-item { font-size: 12px; display: flex; align-items: center; gap: 5px; }
            .box { height: 12px; width: 12px; border: 1px solid #cbd5e1; border-radius: 2px; display: inline-block; }
            .box-checked { background: #2563eb; border-color: #2563eb; position: relative; }
            .box-checked::after { content: '✓'; color: white; font-size: 8px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
            .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .table th { background: #f8fafc; text-align: left; padding: 10px; font-size: 10px; font-weight: 900; color: #64748b; border-bottom: 2px solid #e2e8f0; }
            .table td { padding: 10px; font-size: 12px; border-bottom: 1px solid #f1f5f9; }
            .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">SevaMed <span style="font-weight:400; color: #94a3b8;">HMS</span></div>
            <div class="title">Official Medical Report</div>
        </div>

        <div class="section">
            <div class="grid">
                <div><div class="label">Patient Name</div><div class="value">${data.patientName}</div></div>
                <div><div class="label">Visit Date</div><div class="value">${data.date}</div></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Case Presentation</div>
            <div class="grid">
                <div><div class="label">Problem Onset</div><div class="value">${data.onsetTime || 'Not specified'}</div></div>
                <div><div class="label">Primary Concern</div><div class="value">${data.describeProblem || 'N/A'}</div></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Clinical History Checklist</div>
            <div class="checklist">
                ${(data.history || []).map(h => `
                    <div class="checklist-item">
                        <div class="box box-checked"></div>
                        <span>${h}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="section">
            <div class="section-title">Medication Recommendations</div>
            <table class="table">
                <thead>
                    <tr><th>Medicine</th><th>Dosage</th><th>Duration</th><th>Reason</th></tr>
                </thead>
                <tbody>
                    ${(data.medications || []).map(m => `
                        <tr>
                            <td><strong>${m.name}</strong></td>
                            <td>${m.dose}</td>
                            <td>${m.duration}</td>
                            <td>${m.reason}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section">
            <div class="section-title">Allergies & Contraindications</div>
            <div class="value">${data.allergies || 'No known allergies reported.'}</div>
        </div>

        <div class="footer">
            Generated by SevaMed Digital Health Infrastructure · DocID: ${data.appointmentId} · ${new Date().toLocaleString()}
        </div>
    </body>
    </html>
    `;

    const tempHtmlPath = path.join(UPLOADS_DIR, `temp_${data.appointmentId}.html`);
    await fs.writeFile(tempHtmlPath, htmlContent);

    try {
        await execPromise(`pandoc "${tempHtmlPath}" -o "${filePath}"`);
        await fs.remove(tempHtmlPath);
        return filename;
    } catch (error) {
        console.error('Pandoc conversion failed:', error);
        throw new Error('Document conversion failed.');
    }
};

module.exports = { generateReport };
