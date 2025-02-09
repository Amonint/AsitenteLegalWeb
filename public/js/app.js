// js/app.js
import { createLegalCase, addDocumentToCase, uploadLegalDocument } from './firebase.js';
import { analyzeLegalDocument } from './gemini.js';

let currentCase = null;

document.getElementById('documents').addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    
    if (!currentCase) {
        currentCase = await initializeCase();
    }
    
    files.forEach(async (file) => {
        try {
            updateStatus(`Procesando ${file.name}...`);
            
            // Analizar con Gemini 1.5 Flash
            const analysis = await analyzeLegalDocument(file);
            
            // Subir a Storage
            const docUrl = await uploadLegalDocument(file, currentCase.id);
            
            // Guardar en Firestore
            await addDocumentToCase(currentCase.id, {
                ...analysis,
                metadata: {
                    nombreArchivo: file.name,
                    url: docUrl,
                    fechaSubida: new Date().toISOString()
                }
            });
            
            updateFileStatus(file.name, true);
        } catch (error) {
            updateFileStatus(file.name, false);
            console.error('Error:', error);
            updateStatus(`Error procesando ${file.name}: ${error.message}`, true);
        }
    });
});

const initializeCase = async () => {
    const caseData = {
        numero_proceso: document.getElementById('caseNumber').value,
        tipo_proceso: document.getElementById('caseType').value,
        jurisdiccion: "Ecuador",
        estado_actual: "En trámite"
    };
    
    const caseRef = await createLegalCase(caseData);
    updateStatus(`Caso ${caseRef.id} creado exitosamente!`);
    return caseRef;
};

// Helpers UI
const updateStatus = (message, isError = false) => {
    const statusDiv = document.getElementById('status');
    statusDiv.className = `p-4 rounded-lg ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
    statusDiv.innerHTML = message;
};

const updateFileStatus = (fileName, success) => {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML += `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span>${fileName}</span>
            <span class="text-xl">${success ? '✅' : '❌'}</span>
        </div>
    `;
};