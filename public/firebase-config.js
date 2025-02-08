const firebaseConfig = {
    apiKey: "AIzaSyDfLe_BqaJ45xJeE08yjLsuYh3_-FPRfbY",
    authDomain: "asistentejuridico-90176.firebaseapp.com",
    projectId: "asistentejuridico-90176",
    storageBucket: "asistentejuridico-90176.firebasestorage.app",
    messagingSenderId: "495048449457",
    appId: "1:495048449457:web:3e903f0184d1db72ea3190",
    measurementId: "G-SXQCERQLYB"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();