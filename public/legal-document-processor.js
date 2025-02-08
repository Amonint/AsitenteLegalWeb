// Inicialización de la API de Google AI
const genAI = new GoogleGenerativeAI("AIzaSyCTIA2YQmtJsPMhebibj1YMBnbfbS8sncE");

// Función para convertir archivo a base64
const fileToBase64 = (file) => 
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(
            reader.result
                .replace('data:', '')
                .replace(/^.+,/, '')
        );
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

// Función principal para procesar el documento legal
const processLegalDocument = async (file) => {
    const uploadToStorage = async (file) => {
        const storageRef = storage.ref(`legal-documents/${file.name}`);
        const uploadTask = await storageRef.put(file);
        return await uploadTask.ref.getDownloadURL();
    };

    const analyzeDocument = async (base64Data, prompt) => {
        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
        const result = await model.generateContent([ 
            prompt, 
            { inlineData: { mimeType: "application/pdf", data: base64Data } }
        ]);
        return JSON.parse(result.response.text());
    };

    const saveToFirestore = async (data) => {
        return await db.collection('documentosLegales').add({
            ...data,
            fechaProcesamiento: firebase.firestore.FieldValue.serverTimestamp(),
            estado: "procesado"
        });
    };

    try {
        const downloadURL = await uploadToStorage(file);
        const base64Data = await fileToBase64(file);

        const initialPrompt = `
            Analiza este documento legal y determina:
            1. ¿Qué tipo de documento legal es?
            2. ¿Cuáles son los elementos más importantes que contiene?
            3. ¿Qué estructura sería la más adecuada para organizar su información?
            
            Responde en formato JSON con esta estructura:
            {
                "tipoDocumento": "",
                "elementosClaves": [],
                "estructuraPropuesta": {}
            }
        `;

        const documentInfo = await analyzeDocument(base64Data, initialPrompt);

        const extractionPrompt = `
            Analiza este documento legal (${documentInfo.tipoDocumento}) y extrae toda la información relevante.
            
            Consideraciones importantes:
            1. Estructura la información de la manera más natural para este tipo específico de documento
            2. Incluye todos los detalles importantes sin forzarlos en categorías predefinidas
            3. Mantén las relaciones lógicas entre los diferentes elementos del documento
            4. Preserva el contexto legal de cada elemento
            5. Identifica cualquier elemento único o especial de este documento
            
            Organiza la información en un JSON que refleje la estructura natural del documento.
            No uses una estructura fija - adapta el JSON a la naturaleza específica de este documento.
        `;

        const structuredData = await analyzeDocument(base64Data, extractionPrompt);

        const docRef = await saveToFirestore({
            urlDocumento: downloadURL,
            tipoDocumento: documentInfo.tipoDocumento,
            datosEstructurados: structuredData,
            elementosClaves: documentInfo.elementosClaves,
            nombreArchivo: file.name
        });

        return {
            success: true,
            documentId: docRef.id,
            tipoDocumento: documentInfo.tipoDocumento,
            data: structuredData
        };

    } catch (error) {
        console.error("Error procesando documento legal:", error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Hacer que la función esté disponible globalmente
window.processLegalDocument = processLegalDocument;
window.fileToBase64 = fileToBase64;
