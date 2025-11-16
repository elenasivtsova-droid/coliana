// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Prefer environment variables for project-specific values so different deploys
// (dev/staging/prod) can use different Firebase projects without changing source.
// const firebaseConfig = {
//   // apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDaY4qkqgHsjfJ1lrnVdkoJfbYnOpOYPeE",
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "rich-agency-478220-d8.firebaseapp.com",
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "rich-agency-478220-d8",
//   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
//   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
//   appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id"
// };
// const firebaseConfig = {
//   apiKey: "AIzaSyAaafEeyXeW5opTsroivmqnX8-Vc0S73H8",
//   authDomain: "rich-agency-478220-d8.firebaseapp.com",
//   projectId: "rich-agency-478220-d8",
//   storageBucket: "rich-agency-478220-d8.firebasestorage.app",
//   messagingSenderId: "243886041554",
//   appId: "1:243886041554:web:b648b12af47f983d64400b"
// };


const firebaseConfig = {
  apiKey: "AIzaSyCdqBZa2MQPt3FwO-fTzB16wgPmo1Jem9w",
  authDomain: "coliana-b6009.firebaseapp.com",
  projectId: "coliana-b6009",
  storageBucket: "coliana-b6009.firebasestorage.app",
  messagingSenderId: "531172840544",
  appId: "1:531172840544:web:1300dcda176e8d0a20df05",
  measurementId: "G-P4TCJ21QT0"
};

// const firebaseConfig = {
//   apiKey: "AIzaSyDoXyyqUwBj8HPAgOj_6MdJfQO46cKPmcc",
//   authDomain: "coliana-ai.firebaseapp.com",
//   projectId: "coliana-ai",
//   storageBucket: "coliana-ai.firebasestorage.app",
//   messagingSenderId: "884139650102",
//   appId: "1:884139650102:web:83d9f48a715e2b2189fc97",
//   measurementId: "G-ZMPLFSBTCQ"
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// // Quick developer check: warn if placeholders are still in the config
// if (firebaseConfig.storageBucket && firebaseConfig.storageBucket.includes('your-project')) {
//   // eslint-disable-next-line no-console
//   console.warn('Firebase storageBucket appears to be a placeholder. Replace with your real bucket in VITE_FIREBASE_STORAGE_BUCKET.');
// }
// if (firebaseConfig.messagingSenderId === '123456789' || firebaseConfig.appId === 'your-app-id') {
//   // eslint-disable-next-line no-console
//   console.warn('Firebase messagingSenderId / appId contain placeholder values. Verify your Vite env vars.');
// }

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Real SMS testing enabled for local development
// Make sure you've added 'localhost' to Firebase authorized domains
console.log('🔐 Firebase phone verification: Real SMS mode enabled');
