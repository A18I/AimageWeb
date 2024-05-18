import { FIREBASE_API_KEY, APP_CHECK_API_KEY } from '@env';
import { Platform } from 'react-native';
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, indexedDBLocalPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, setLogLevel  } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";


const firebaseConfig = {
 
};

const app = initializeApp(firebaseConfig);

setLogLevel('debug');

const auth = initializeAuth(app, {
  persistence: Platform.OS === 'web' ? browserLocalPersistence : indexedDBLocalPersistence,
});
const db = getFirestore(app);


export { app, auth, db, };
