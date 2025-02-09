// js/pdfProcessor.js
export const extractPDFText = async (file) => {
    const pdf = await pdfjs.getDocument(URL.createObjectURL(file)).promise;
    let text = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ');
    }
    
    return text;
};

export const processLegalDocument = async (file, docType) => {
    const text = await extractPDFText(file);
    return {
        rawText: text,
        analysis: await analyzeLegalDocument(text, docType)
    };
};