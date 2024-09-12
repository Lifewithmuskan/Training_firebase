import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, getDoc ,limit, orderBy} from "firebase/firestore";
import { getDatabase, ref, set, get } from "firebase/database";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Realtime Database
const realTimeDb = getDatabase(app);

// Export the auth, firestore, and realtime database references and methods
export {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  db,
  collection,
  addDoc,
  getDocs,
  query,
  realTimeDb,
  ref,
  limit,
  orderBy,
  where,
  doc,
  getDoc,
  set,
  get
};
