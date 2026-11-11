import {
  get,
  increment,
  limitToLast,
  onDisconnect,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  remove,
  serverTimestamp,
  set,
  update,
} from 'firebase/database';
import { db } from './firebase';
import {
  isUserInConversation,
  notificationEntry,
} from './notificationService';

export type MessageType = 'text' | 'image' | 'location' | 'system' | 'recalled';

export type Message = {
  id: string;
  senderId: string;
  senderName?: string;
  type: MessageType;
  text?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  createdAt: number | null;
  recalled?: boolean;
  reactions?: Record<string, string>;
};

export type Conversation = {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  members: Record<string, boolean>;
  createdBy?: string;
  createdAt?: number | null;
  lastMessage?: string;
  lastSenderId?: string;
  lastSenderName?: string;
  lastType?: MessageType;
  updatedAt?: number | null;
};

export type ChatItem = {
  id: string;
  type: 'direct' | 'group';
  title: string;
  peerId?: string;
  lastMessage: string;
  lastSenderId: string;
  lastSenderName?: string;
  lastType?: MessageType;
  updatedAt: number | null;
  unread: number;
};

export type OutgoingMessage =
  | { type: 'text'; text: string }
  | { type: 'image'; imageUrl: string }
  | { type: 'location'; latitude: number; longitude: number };

export const conversationId = (a: string, b: string) =>
  [a, b].sort().join('_');

export const previewOf = (body: OutgoingMessage) =>
  body.type === 'image'
    ? 'Hình ảnh'
    : body.type === 'location'
    ? 'Vị trí'
    : body.text;

export async function ensureDirect(meId: string, otherId: string) {
  const cid = conversationId(meId, otherId);
  const snap = await get(ref(db, `conversations/${cid}`));
  if (!snap.exists()) {
    await set(ref(db, `conversations/${cid}`), {
      type: 'direct',
      members: { [meId]: true, [otherId]: true },
      createdBy: meId,
      createdAt: serverTimestamp(),
    });
  }
  return cid;
}

export function listenConversation(
  cid: string,
  cb: (conv: Conversation | null) => void,
  onError?: (e: any) => void,
) {
  return onValue(
    ref(db, `conversations/${cid}`),
    snap => {
      const data = snap.val();
      cb(
        snap.exists()
          ? {
              ...data,
              id: cid,
              type: data.type === 'group' ? 'group' : 'direct',
            }
          : null,
      );
    },
    onError,
  );
}

export function listenMessages(
  cid: string,
  limit: number,
  cb: (messages: Message[]) => void,
  onError?: (e: any) => void,
) {
  const q = query(
    ref(db, `messages/${cid}`),
    orderByChild('createdAt'),
    limitToLast(limit),
  );
  return onValue(
    q,
    snap => {
      const list: Message[] = [];
      snap.forEach(child => {
        list.push({ id: child.key as string, ...child.val() });
      });
      cb(list);
    },
    onError,
  );
}

export function listenChats(uid: string, cb: (list: ChatItem[]) => void) {
  return onValue(ref(db, `userChats/${uid}`), snap => {
    const all = snap.val() ?? {};
    cb(
      Object.keys(all)
        .map(id => ({ unread: 0, ...all[id], id }))
        .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0)),
    );
  });
}

export function listenTyping(
  cid: string,
  cb: (typing: Record<string, boolean>) => void,
  onError?: (e: any) => void,
) {
  return onValue(
    ref(db, `typing/${cid}`),
    snap => cb(snap.val() ?? {}),
    onError,
  );
}

export function listenReadStatus(
  cid: string,
  cb: (reads: Record<string, number>) => void,
  onError?: (e: any) => void,
) {
  return onValue(
    ref(db, `readStatus/${cid}`),
    snap => cb(snap.val() ?? {}),
    onError,
  );
}

export function prepareTyping(cid: string, uid: string) {
  onDisconnect(ref(db, `typing/${cid}/${uid}`))
    .remove()
    .catch(e => console.warn('[typing] onDisconnect', e?.code ?? e?.message));
}

export function setTyping(cid: string, uid: string, typing: boolean) {
  const r = ref(db, `typing/${cid}/${uid}`);
  return typing ? set(r, true) : remove(r);
}

export function stopTyping(cid: string, uid: string) {
  const r = ref(db, `typing/${cid}/${uid}`);
  onDisconnect(r).cancel();
  return remove(r);
}

export async function sendMessage(
  cid: string,
  conv: Conversation,
  sender: { id: string; name: string },
  body: OutgoingMessage,
) {
  const msgId = push(ref(db, `messages/${cid}`)).key as string;
  const preview = previewOf(body);
  const type = conv.type === 'group' ? 'group' : 'direct';
  const memberIds = Object.keys(conv.members ?? {});
  const otherId =
    type === 'direct'
      ? memberIds.find(id => id !== sender.id) ?? ''
      : '';

  const updates: Record<string, any> = {
    [`messages/${cid}/${msgId}`]: {
      senderId: sender.id,
      senderName: sender.name,
      ...body,
      createdAt: serverTimestamp(),
    },
    [`conversations/${cid}/lastMessage`]: preview,
    [`conversations/${cid}/lastSenderId`]: sender.id,
    [`conversations/${cid}/lastSenderName`]: sender.name,
    [`conversations/${cid}/lastType`]: body.type,
    [`conversations/${cid}/updatedAt`]: serverTimestamp(),
  };

  const recipients = memberIds.filter(id => id !== sender.id);
  const activeMap = Object.fromEntries(
    await Promise.all(
      recipients.map(async uid => [
        uid,
        await isUserInConversation(uid, cid),
      ]),
    ),
  );

  memberIds.forEach(uid => {
    const base = `userChats/${uid}/${cid}`;
    updates[`${base}/type`] = type;
    updates[`${base}/title`] = type === 'group' ? conv.name ?? '' : '';
    updates[`${base}/peerId`] =
      type === 'group' ? '' : uid === sender.id ? otherId : sender.id;
    updates[`${base}/lastMessage`] = preview;
    updates[`${base}/lastSenderId`] = sender.id;
    updates[`${base}/lastSenderName`] = sender.name;
    updates[`${base}/lastType`] = body.type;
    updates[`${base}/updatedAt`] = serverTimestamp();

    if (uid === sender.id) {
      updates[`${base}/unread`] = 0;
      return;
    }
    updates[`${base}/unread`] = increment(1);
    if (!activeMap[uid]) {
      const [path, value] = notificationEntry(uid, {
        type: 'message',
        convId: cid,
        fromUid: sender.id,
        text:
          type === 'group'
            ? `${sender.name} (${conv.name ?? 'Nhóm'}): ${preview}`
            : `${sender.name}: ${preview}`,
      });
      updates[path] = value;
    }
  });

  await update(ref(db), updates);
}

export function markRead(cid: string, uid: string) {
  return update(ref(db), {
    [`readStatus/${cid}/${uid}`]: serverTimestamp(),
    [`userChats/${uid}/${cid}/unread`]: 0,
  });
}

export async function toggleReaction(
  cid: string,
  msg: Message,
  uid: string,
  emoji: string,
  myName: string,
) {
  const mine = msg.reactions?.[uid];
  const updates: Record<string, any> = {
    [`messages/${cid}/${msg.id}/reactions/${uid}`]:
      mine === emoji ? null : emoji,
  };
  if (mine !== emoji && msg.senderId !== uid) {
    const [path, value] = notificationEntry(msg.senderId, {
      type: 'reaction',
      convId: cid,
      fromUid: uid,
      text: `${myName} đã thả ${emoji} vào tin nhắn của bạn`,
    });
    updates[path] = value;
  }
  await update(ref(db), updates);
}

export async function recallMessage(
  cid: string,
  msg: Message,
  memberIds: string[],
  isLast: boolean,
) {
  const updates: Record<string, any> = {
    [`messages/${cid}/${msg.id}/recalled`]: true,
  };
  if (isLast) {
    updates[`conversations/${cid}/lastMessage`] = 'Tin nhắn đã được thu hồi';
    updates[`conversations/${cid}/lastType`] = 'recalled';
    updates[`conversations/${cid}/lastSenderId`] = msg.senderId;
    updates[`conversations/${cid}/lastSenderName`] = msg.senderName ?? '';
    memberIds.forEach(uid => {
      updates[`userChats/${uid}/${cid}/lastMessage`] =
        'Tin nhắn đã được thu hồi';
      updates[`userChats/${uid}/${cid}/lastType`] = 'recalled';
      updates[`userChats/${uid}/${cid}/lastSenderId`] = msg.senderId;
    });
  }
  await update(ref(db), updates);
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

export function formatLastSeen(ts?: number | null) {
  if (!ts) return 'Ngoại tuyến';
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'Hoạt động vừa xong';
  if (diff < 3_600_000)
    return `Hoạt động ${Math.floor(diff / 60_000)} phút trước`;
  if (diff < 86_400_000)
    return `Hoạt động ${Math.floor(diff / 3_600_000)} giờ trước`;
  return `Hoạt động ${Math.floor(diff / 86_400_000)} ngày trước`;
}

export const mapsUrl = (latitude: number, longitude: number) =>
  `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

export const locationLabel = (latitude: number, longitude: number) =>
  `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
