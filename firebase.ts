import { initializeApp, getApps, getApp  } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDI3Bj_-wjrze60mZ3GCBaES6PcAB_Tjtk",
  authDomain: "noce-pr3.firebaseapp.com",
  projectId: "noce-pr3",
  storageBucket: "noce-pr3.firebasestorage.app",
  // storageBucket: "noce-pr3.appspot.com",
  messagingSenderId: "473252258715",
  appId: "1:473252258715:web:dae9a7ae31d28c0333f73e"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);

export {db, storage};