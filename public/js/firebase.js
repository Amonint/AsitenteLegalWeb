

// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, doc, setDoc, updateDoc, arrayUnion 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
    getStorage, ref, uploadBytes, getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";


const firebaseConfig = {
    apiKey: "AIzaSyDfLe_BqaJ45xJeE08yjLsuYh3_-FPRfbY",
    authDomain: "asistentejuridico-90176.firebaseapp.com",
    projectId: "asistentejuridico-90176",
    storageBucket: "asistentejuridico-90176.firebasestorage.app",
    messagingSenderId: "495048449457",
    appId: "1:495048449457:web:3e903f0184d1db72ea3190",
    measurementId: "G-SXQCERQLYB"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export const createLegalCase = async (caseData) => {
    const caseRef = doc(db, 'casos', caseData.numero_proceso);
    await setDoc(caseRef, {
        ...caseData,
        documentos: {},
        timeline: {
            creado: new Date(),
            actualizado: new Date()
        }
    });
    return caseRef;
};

export const addDocumentToCase = async (caseId, documentData) => {
    const caseRef = doc(db, 'casos', caseId);
    const docId = `DOC_${Date.now()}`;
    
    await updateDoc(caseRef, {
        [`documentos.${docId}`]: documentData,
        "timeline.actualizado": new Date()
    });
    
    return docId;
};

export const uploadLegalDocument = async (file, caseId) => {
    const storageRef = ref(storage, `casos/${caseId}/${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
};