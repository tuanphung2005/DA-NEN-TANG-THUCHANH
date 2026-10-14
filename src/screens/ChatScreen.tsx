import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

import { USERS } from '../data/users';

export default function ChatScreen({ route }: any) {
  const name = route.params?.name ?? 'Chat';
  const online = route.params?.online ?? USERS.find(u => u.name === name)?.online ?? true;
  const [msgs, setMsgs] = useState([
    { id: '1', text: 'Chào bạn!', time: '09:10', me: false },
    { id: '2', text: 'Bạn khỏe không?', time: '09:11', me: false },
    { id: '3', text: 'Mai gặp nhé', time: '09:12', me: false },
  ]);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    setMsgs(p => [...p, { id: String(Date.now()), text: input.trim(), time: 'Bây giờ', me: true }]);
    setInput('');
  };

  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <View style={s.av}>
          <Text style={s.avT}>{name[0]}</Text>
        </View>
        <View>
          <Text style={s.title}>{name}</Text>
          <View style={s.onRow}>
            <View style={[s.dot, { backgroundColor: online ? 'green' : '#ccc' }]} />
            <Text style={s.on}>{online ? 'Trực tuyến' : 'Ngoại tuyến'}</Text>
          </View>
        </View>
      </View>
      <FlatList
        data={msgs}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingVertical: 8 }}
        renderItem={({ item }) => (
          <View style={[s.bubble, item.me ? s.me : s.other]}>
            <Text style={item.me ? s.meT : s.otherT}>{item.text}</Text>
            <Text style={s.time}>{item.time}</Text>
          </View>
        )}
      />
      <View style={s.bar}>
        <TextInput style={s.input} placeholder="Nhập tin nhắn" value={input} onChangeText={setInput} />
        <TouchableOpacity style={s.send} onPress={send}>
          <Text style={s.sendT}>Gửi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff', padding: 12 },
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  av: { width: 44, height: 44, borderRadius: 999, backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avT: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  title: { fontWeight: 'bold', fontSize: 18 },
  onRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  dot: { width: 8, height: 8, borderRadius: 999, marginRight: 5 },
  on: { fontSize: 12 },
  bubble: { maxWidth: '75%', borderRadius: 8, padding: 10, marginBottom: 8 },
  other: { backgroundColor: '#F0F0F0', alignSelf: 'flex-start' },
  me: { backgroundColor: '#007AFF', alignSelf: 'flex-end' },
  otherT: { color: '#000' },
  meT: { color: '#fff' },
  time: { fontSize: 10, marginTop: 4 },
  bar: { flexDirection: 'row', marginTop: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8, padding: 10, marginRight: 8 },
  send: { backgroundColor: '#007AFF', borderRadius: 8, paddingHorizontal: 18, justifyContent: 'center' },
  sendT: { color: '#fff', fontWeight: 'bold' },
});
