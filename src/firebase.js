import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBum7sv5toCKj_3ygRDp9CMPFV_1IseaI4",
  authDomain: "portail-cs-javel.firebaseapp.com",
  projectId: "portail-cs-javel",
  storageBucket: "portail-cs-javel.firebasestorage.app",
  messagingSenderId: "95140466942",
  appId: "1:95140466942:web:d7cd01aa1b06d2d53995af",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
