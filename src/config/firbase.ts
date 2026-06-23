import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = getApps().some((firebaseApp) => firebaseApp.name === "[DEFAULT]")
  ? getApp()
  : initializeApp(firebaseConfig);
const storefrontApp = getApps().some((firebaseApp) => firebaseApp.name === "storefront")
  ? getApp("storefront")
  : initializeApp(firebaseConfig, "storefront");

export const auth = getAuth(app);
export const storefrontAuth = getAuth(storefrontApp);
