import { initializeApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Only initialize if we have at least the API key, to prevent the whole app from crashing if .env is missing
export const app = firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null;
export const auth: Auth | null = app ? getAuth(app) : null;

if (!app) {
  console.warn("Firebase config is missing or invalid. Authentication will not work. Please check your .env file.");
}
