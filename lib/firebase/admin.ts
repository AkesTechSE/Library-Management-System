import admin from "firebase-admin";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  throw new Error(
    "Missing Firebase Admin env vars. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY."
  );
}

const credential = admin.credential.cert({
  projectId,
  clientEmail,
  privateKey,
});

if (!admin.apps.length) {
  admin.initializeApp({
    credential,
    projectId,
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export default admin;
