import { FIREBASE_API_KEY, APP_CHECK_API_KEY } from '@env';
import { Platform } from 'react-native';
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, indexedDBLocalPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, setLogLevel  } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";


const firebaseConfig = {
  apiKey: 'AIzaSyDztCVILgSdDDe5mZnI3WYjRCpZ6YofRw8',
  authDomain: "textti-38fbc.firebaseapp.com",
  projectId: "textti-38fbc",
  storageBucket: "textti-38fbc.appspot.com",
  messagingSenderId: "191583632362",
  appId: "1:191583632362:web:fef871ce295ddca6395093",
  measurementId: "G-HJ3H6LFQWV"
};

const app = initializeApp(firebaseConfig);

setLogLevel('debug');

const auth = initializeAuth(app, {
  persistence: Platform.OS === 'web' ? browserLocalPersistence : indexedDBLocalPersistence,
});
const db = getFirestore(app);


export { app, auth, db, };