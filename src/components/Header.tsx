import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { auth } from '../services/firebase';
import { listenUser } from '../services/users';

export default function Header({ title }: { title: string }) {
  const uid = auth.currentUser?.uid ?? '';
  const [name, setName] = useState('');

  useEffect(() => {
    if (!uid) return;
    return listenUser(uid, u => setName(u?.name ?? ''));
  }, [uid]);

  return (
    <View>
      <View style={s.wrap}>
        <View style={s.av}>
          <Text style={s.avT}>{name[0] ?? '?'}</Text>
        </View>
        <Text style={s.hi}>Xin chào, {name}</Text>
      </View>
      <Text style={s.title}>{title}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  wrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  av: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avT: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  hi: { fontSize: 18, fontWeight: 'bold' },
});
