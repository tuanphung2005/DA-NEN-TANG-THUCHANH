import {
  get,
  onDisconnect,
  onValue,
  push,
  ref,
  remove,
  serverTimestamp,
  set,
  update,
} from 'firebase/database';
import { db } from './firebase';

export type AppNotification = {
  id: string;
  type: 'message' | 'group_add' | 'reaction';
  convId: string;
  fromUid: string;
  text: string;
  createdAt: number | null;
  read: boolean;
};

export function setActiveConversation(uid: string, cid: string | null) {
  const r = ref(db, `active/${uid}`);
  if (cid) {
    set(r, cid);
    onDisconnect(r).remove();
  } else {
    onDisconnect(r).cancel();
    remove(r);
  }
}

export function isUserInConversation(uid: string, cid: string) {
  return get(ref(db, `active/${uid}`))
    .then(snap => snap.val() === cid)
    .catch(() => false);
}

export function notificationEntry(
  uid: string,
  data: Pick<AppNotification, 'type' | 'convId' | 'fromUid' | 'text'>,
) {
  const id = push(ref(db, `notifications/${uid}`)).key as string;
  return [
    `notifications/${uid}/${id}`,
    { ...data, createdAt: serverTimestamp(), read: false },
  ] as const;
}

export function listenNotifications(
  uid: string,
  cb: (list: AppNotification[]) => void,
) {
  return onValue(ref(db, `notifications/${uid}`), snap => {
    const all = snap.val() ?? {};
    cb(
      Object.keys(all)
        .map(id => ({ id, ...all[id] }))
        .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)),
    );
  });
}

export function listenUnreadNotifications(
  uid: string,
  cb: (count: number) => void,
) {
  return onValue(ref(db, `notifications/${uid}`), snap => {
    cb(
      Object.values(snap.val() ?? {}).filter((n: any) => !n.read).length,
    );
  });
}

export function markNotificationRead(uid: string, id: string) {
  return update(ref(db, `notifications/${uid}`), { [`${id}/read`]: true });
}

export function markAllNotificationsRead(uid: string, ids: string[]) {
  if (!ids.length) return Promise.resolve();
  return update(
    ref(db, `notifications/${uid}`),
    Object.fromEntries(ids.map(id => [`${id}/read`, true])),
  );
}
