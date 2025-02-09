const GEMINI_API_KEY = 'AIzaSyCTIA2YQmtJsPMhebibj1YMBnbfbS8sncE';
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
};

// js/gemini.js
export const analyzeLegalDocument = async (file) => {
    const base64Data = await fileToBase64(file);
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-user-project': 'TU_PROYECTO_GCP'
            },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: "application/pdf",
                                data: base64Data
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.1,
                    responseMimeType: "application/json"
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${errorData.error.message}`);
        }

        const data = await response.json();
        
        // Validación robusta de la respuesta
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
            console.error('Respuesta inválida de Gemini:', data);
            throw new Error('Estructura de respuesta inválida de la API');
        }
        
        const rawJson = data.candidates[0].content.parts[0].text;
        const cleanJson = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
        
        return JSON.parse(cleanJson);
        
    } catch (error) {
        console.error('Detalles completos del error:', {
            error,
            request: {
                file: file.name,
                size: file.size,
                type: file.type
            }
        });
        throw new Error(`Error en análisis: ${error.message}`);
    }
};