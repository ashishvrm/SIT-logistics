import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBe-ai0yoY-wHyBqe5DN6IHoEMV-ankLIc',
  authDomain: 'sip-logistics.firebaseapp.com',
  projectId: 'sip-logistics',
  storageBucket: 'sip-logistics.firebasestorage.app',
  messagingSenderId: '112726445360',
  appId: '1:112726445360:ios:51344afe74125a4c060cf5'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

export default app;
