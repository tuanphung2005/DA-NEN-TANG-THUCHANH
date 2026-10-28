import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyCYrmemH610AMb-TjsjMdj80UqNByNSOjQ',
  authDomain: 'chatapp-slink-thuchanh.firebaseapp.com',
  databaseURL: 'https://chatapp-slink-thuchanh-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'chatapp-slink-thuchanh',
  storageBucket: 'chatapp-slink-thuchanh.firebasestorage.app',
  messagingSenderId: '160550465600',
  appId: '1:160550465600:android:0032425a5b5068e20eafa5',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
