import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function parseServiceAccountJson() {
  const raw = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON?.trim();

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as {
      client_email?: string;
      private_key?: string;
      project_id?: string;
    };
  } catch {
    return null;
  }
}

const serviceAccountJson = parseServiceAccountJson();

const firebaseAdminConfig = {
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL ?? serviceAccountJson?.client_email,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? serviceAccountJson?.private_key,
  projectId:
    process.env.FIREBASE_ADMIN_PROJECT_ID ??
    serviceAccountJson?.project_id ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const missingFirebaseAdminConfigKeys = Object.entries(firebaseAdminConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

const invalidFirebaseAdminConfigKeys = serviceAccountJson === null && process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON?.trim()
  ? ["serviceAccountJson"]
  : [];

export const isFirebaseAdminConfigured =
  missingFirebaseAdminConfigKeys.length === 0 && invalidFirebaseAdminConfigKeys.length === 0;

export const firebaseAdminSetupHint = isFirebaseAdminConfigured
  ? "Firebase Admin SDK is configured."
  : [
      invalidFirebaseAdminConfigKeys.length
        ? "FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON is not valid JSON."
        : null,
      missingFirebaseAdminConfigKeys.length
        ? `Missing Firebase admin environment variables: ${missingFirebaseAdminConfigKeys.join(", ")}.`
        : null,
      "Set either FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON or FIREBASE_ADMIN_CLIENT_EMAIL/FIREBASE_ADMIN_PRIVATE_KEY and redeploy.",
    ]
      .filter(Boolean)
      .join(" ");

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