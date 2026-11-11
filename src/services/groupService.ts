import { push, ref, serverTimestamp, set, update } from 'firebase/database';
import { db } from './firebase';
import { notificationEntry } from './notificationService';

export async function createGroup(
  creator: { id: string; name: string },
  name: string,
  memberIds: string[],
) {
  const others = memberIds.filter(id => id !== creator.id);
  if (others.length < 2) throw new Error('members');

  const cid = push(ref(db, 'conversations')).key as string;
  const members = Object.fromEntries(
    [creator.id, ...others].map(id => [id, true]),
  );

  await set(ref(db, `conversations/${cid}`), {
    type: 'group',
    name,
    members,
    createdBy: creator.id,
    createdAt: serverTimestamp(),
    lastMessage: 'Nhóm đã được tạo',
    lastSenderId: '',
    lastSenderName: creator.name,
    lastType: 'system',
    updatedAt: serverTimestamp(),
  });

  const updates: Record<string, any> = {};
  Object.keys(members).forEach(uid => {
    const base = `userChats/${uid}/${cid}`;
    updates[`${base}/type`] = 'group';
    updates[`${base}/title`] = name;
    updates[`${base}/peerId`] = '';
    updates[`${base}/lastMessage`] = 'Nhóm đã được tạo';
    updates[`${base}/lastSenderId`] = '';
    updates[`${base}/lastSenderName`] = creator.name;
    updates[`${base}/lastType`] = 'system';
    updates[`${base}/updatedAt`] = serverTimestamp();
    updates[`${base}/unread`] = 0;
  });

  others.forEach(uid => {
    const [path, value] = notificationEntry(uid, {
      type: 'group_add',
      convId: cid,
      fromUid: creator.id,
      text: `${creator.name} đã thêm bạn vào nhóm ${name}`,
    });
    updates[path] = value;
  });

  await update(ref(db), updates);
  return cid;
}
