import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAVgln97k7SYOQEnaowEgYdF5LLg_wazhk",
  authDomain: "nmsdashboard-7fd7c.firebaseapp.com",
  projectId: "nmsdashboard-7fd7c",
  storageBucket: "nmsdashboard-7fd7c.firebasestorage.app",
  messagingSenderId: "345656337009",
  appId: "1:345656337009:web:785851c3818c36debdb1d0",
  measurementId: "G-X97WS43PYD"
};


// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

export { auth, db };