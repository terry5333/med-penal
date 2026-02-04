import admin from "firebase-admin";

let cachedApp: admin.app.App | null = null;

function getCredential() {
  const projectId = process.env.FIREBASE_PROJECT_ID || "";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || "";
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n") || "";

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase service account environment variables.");
  }

  return admin.credential.cert({
    projectId,
    clientEmail,
    privateKey,
  });
}

function getApp() {
  if (cachedApp) return cachedApp;
  cachedApp = admin.apps.length ? admin.app() : admin.initializeApp({ credential: getCredential() });
  return cachedApp;
}

export function getDb() {
  return admin.firestore(getApp());
}

export { admin };
