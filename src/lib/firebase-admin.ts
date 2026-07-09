import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const firebaseAdminConfig = {
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
};

const missingFirebaseAdminConfigKeys = Object.entries(firebaseAdminConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const isFirebaseAdminConfigured = missingFirebaseAdminConfigKeys.length === 0;

export const firebaseAdminSetupHint = isFirebaseAdminConfigured
  ? "Firebase Admin SDK is configured."
  : `Missing Firebase admin environment variables: ${missingFirebaseAdminConfigKeys.join(", ")}. Add them to your environment and redeploy.`;

export function getFirebaseAdminApp() {
  if (!isFirebaseAdminConfigured) {
    return null;
  }

  if (getApps().length) {
    return getApp();
  }

  return initializeApp({
    credential: cert({
      clientEmail: firebaseAdminConfig.clientEmail,
      privateKey: firebaseAdminConfig.privateKey?.replace(/\\n/g, "\n"),
      projectId: firebaseAdminConfig.projectId,
    }),
    projectId: firebaseAdminConfig.projectId,
  });
}

export function getFirebaseAdminAuth() {
  const app = getFirebaseAdminApp();

  return app ? getAuth(app) : null;
}