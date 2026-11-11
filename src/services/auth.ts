import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  onDisconnect,
  ref,
  serverTimestamp,
  set,
  update,
} from 'firebase/database';
import { auth, db } from './firebase';

const ERRORS: Record<string, string> = {
  'auth/invalid-credential': 'Sai email hoặc mật khẩu.',
  'auth/user-not-found': 'Sai email hoặc mật khẩu.',
  'auth/wrong-password': 'Sai email hoặc mật khẩu.',
  'auth/invalid-email': 'Email không hợp lệ.',
  'auth/email-already-in-use': 'Email này đã được đăng ký.',
  'auth/weak-password': 'Mật khẩu phải có ít nhất 6 ký tự.',
  'auth/network-request-failed': 'Không có kết nối mạng.',
};

export const authError = (e: any) => ERRORS[e?.code] ?? 'Có lỗi xảy ra, vui lòng thử lại.';

export function startPresence(uid: string) {
  const online = ref(db, `users/${uid}/online`);
  const seen = ref(db, `users/${uid}/lastSeen`);
  update(ref(db, `users/${uid}`), {
    online: true,
    lastSeen: serverTimestamp(),
  });
  onDisconnect(online).set(false);
  onDisconnect(seen).set(serverTimestamp());
}

export async function register(name: string, email: string, password: string) {
  const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await set(ref(db, `users/${user.uid}`), {
    name: name.trim(),
    email: email.trim(),
    online: true,
  });
  startPresence(user.uid);
}

export async function login(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(auth, email.trim(), password);
  startPresence(user.uid);
}

export async function logout() {
  const uid = auth.currentUser?.uid;
  if (uid) {
    const online = ref(db, `users/${uid}/online`);
    const seen = ref(db, `users/${uid}/lastSeen`);
    await onDisconnect(online).cancel();
    await onDisconnect(seen).cancel();
    await update(ref(db, `users/${uid}`), {
      online: false,
      lastSeen: serverTimestamp(),
    });
  }
  await signOut(auth);
}
