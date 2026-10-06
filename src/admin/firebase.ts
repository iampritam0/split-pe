import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

// Same Firebase project as the SplitPe mobile app (SplitPe repo,
// src/services/firebase.js). These values are public identifiers, not
// secrets — every admin action is enforced server-side by firestore.rules /
// storage.rules, which only let accounts with the `admin` custom claim write.
const firebaseConfig = {
  apiKey: "AIzaSyD-Z_DS4JkNOzNnHBC5yq5w0Rr5jA1U3v8",
  authDomain: "splitpe-b4ca6.firebaseapp.com",
  projectId: "splitpe-b4ca6",
  storageBucket: "splitpe-b4ca6.firebasestorage.app",
  messagingSenderId: "228341388136",
  appId: "1:228341388136:android:6dd1e7c10a5d2c50453cdd",
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
// Same region the app's Cloud Functions (sendOtp/verifyOtp) are deployed to.
export const functions = getFunctions(app, "asia-south1");
