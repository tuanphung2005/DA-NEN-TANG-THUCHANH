import {
  limitToLast,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  runTransaction,
  serverTimestamp,
  update,
} from 'firebase/database';
import { db } from './firebase';

export type Message = {
  id: string;
  senderId: string;
  type: 'text' | 'location';
  text?: string;
  latitude?: number;
  longitude?: number;
  createdAt: number | null;
};

export type Conversation = {
  id: string;
  members: Record<string, boolean>;
  lastMessage: string;
  lastType?: 'text' | 'location';
  lastSenderId: string;
  lastTime: number | null;
  unread?: Record<string, number>;
};

export const conversationId = (a: string, b: string) => [a, b].sort().join('_');

export function ensureConversation(a: string, b: string) {
  const cid = conversationId(a, b);
  return update(ref(db, `conversations/${cid}/members`), {
    [a]: true,
    [b]: true,
  });
}

export function listenMessages(cid: string, cb: (messages: Message[]) => void) {
  const q = query(
    ref(db, `conversations/${cid}/messages`),
    orderByChild('createdAt'),
    limitToLast(200),
  );
  return onValue(q, snap => {
    const list: Message[] = [];
    snap.forEach(child => {
      list.push({ id: child.key as string, ...child.val() });
    });
    cb(list);
  });
}

export async function sendMessage(
  from: string,
  to: string,
  body: {
    type: 'text' | 'location';
    text?: string;
    latitude?: number;
    longitude?: number;
  },
) {
  const cid = conversationId(from, to);
  const messageRef = push(ref(db, `conversations/${cid}/messages`));
  const preview =
    body.type === 'location' ? 'Vị trí đã chia sẻ' : body.text ?? '';

  // Tăng unread trước khi ghi tin để người đang mở chat luôn đánh dấu đã đọc sau cùng.
  await runTransaction(
    ref(db, `conversations/${cid}/unread/${to}`),
    n => (n ?? 0) + 1,
  );

  await update(ref(db), {
    [`conversations/${cid}/members/${from}`]: true,
    [`conversations/${cid}/members/${to}`]: true,
    [`conversations/${cid}/lastMessage`]: preview,
    [`conversations/${cid}/lastType`]: body.type,
    [`conversations/${cid}/lastSenderId`]: from,
    [`conversations/${cid}/lastTime`]: serverTimestamp(),
    [`conversations/${cid}/messages/${messageRef.key}`]: {
      senderId: from,
      ...body,
      createdAt: serverTimestamp(),
    },
    [`userConvs/${from}/${cid}`]: true,
    [`userConvs/${to}/${cid}`]: true,
  });
}

export function markRead(cid: string, uid: string) {
  return update(ref(db, `conversations/${cid}/unread`), { [uid]: 0 });
}

// Chỉ nghe các cuộc trò chuyện của mình, sắp xếp mới nhất lên đầu.
export function listenConversations(
  uid: string,
  cb: (list: Conversation[]) => void,
) {
  let offs: Array<() => void> = [];
  const offIndex = onValue(ref(db, `userConvs/${uid}`), snap => {
    offs.forEach(off => off());
    offs = [];

    const ids = Object.keys(snap.val() ?? {});
    const map: Record<string, Conversation> = {};
    if (!ids.length) {
      cb([]);
      return;
    }

    ids.forEach(id => {
      offs.push(
        onValue(ref(db, `conversations/${id}`), child => {
          map[id] = { id, ...child.val() };
          cb(
            Object.values(map).sort(
              (a, b) => (b.lastTime ?? 0) - (a.lastTime ?? 0),
            ),
          );
        }),
      );
    });
  });

  return () => {
    offIndex();
    offs.forEach(off => off());
  };
}

export function formatTime(ts: number | null) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes(),
  ).padStart(2, '0')}`;
  if (d.toDateString() === now.toDateString()) return time;
  return `${String(d.getDate()).padStart(2, '0')}/${String(
    d.getMonth() + 1,
  ).padStart(2, '0')}`;
}

export const mapsUrl = (latitude: number, longitude: number) =>
  `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

export const locationLabel = (latitude: number, longitude: number) =>
  `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
