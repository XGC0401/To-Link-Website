import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);

const missingFirebaseConfigKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

export function getFirebaseApp() {
  if (!isFirebaseConfigured) {
    return null;
  }

  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseServices() {
  const app = getFirebaseApp();

  if (!app) {
    return null;
  }

  return {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
  };
}

export const firebaseSetupHint =
  missingFirebaseConfigKeys.length
    ? `Missing Firebase public environment variables: ${missingFirebaseConfigKeys.join(", ")}. Add them to your environment and redeploy.`
    : "Add Firebase public environment variables to enable live authentication and Firestore data.";