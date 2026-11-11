import { onValue, ref } from 'firebase/database';
import { db } from './firebase';

export type User = {
  id: string;
  name: string;
  email: string;
  online: boolean;
  lastSeen?: number | null;
};

export function listenUsers(myId: string, cb: (users: User[]) => void) {
  return onValue(ref(db, 'users'), snap => {
    const all = snap.val() ?? {};
    cb(
      Object.keys(all)
        .filter(id => id !== myId)
        .map(id => ({ id, ...all[id] }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    );
  });
}

export function listenUser(id: string, cb: (user: User | null) => void) {
  return onValue(ref(db, `users/${id}`), snap => {
    cb(snap.exists() ? { id, ...snap.val() } : null);
  });
}
