import { cert, getApps, initializeApp } from "firebase-admin/app";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

export const firebaseAdmin =
  getApps()[0] ??
  initializeApp({
    credential: cert({ clientEmail, privateKey, projectId }),
  });
