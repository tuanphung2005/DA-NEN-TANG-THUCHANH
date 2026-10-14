import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Header from '../components/Header';

const INIT = [
  { id: '1', text: 'An đã nhắn tin cho bạn', time: '09:12', read: false },
  { id: '2', text: 'Bình đã thích tin nhắn của bạn', time: '08:40', read: false },
  { id: '3', text: 'Chi đã gửi lời mời kết bạn', time: 'Hôm qua', read: true },
  { id: '4', text: 'Dũng đã nhắc đến bạn', time: 'Hôm qua', read: true },
  { id: '5', text: 'An đã nhắn tin cho bạn', time: '09:12', read: false },
];

export default function NotificationsScreen() {
  const [list, setList] = useState(INIT);
  const mark = (id: string) => setList(p => p.map(n => (n.id === id ? { ...n, read: true } : n)));

  return (
    <View style={s.wrap}>
      <Header />
      <TouchableOpacity style={s.btn} onPress={() => setList(p => p.map(n => ({ ...n, read: true })))}>
        <Text style={s.btnT}>Đánh dấu tất cả đã đọc</Text>
      </TouchableOpacity>
      <FlatList
        data={list}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.row, { backgroundColor: item.read ? '#fff' : '#EAF3FF' }]}
            onPress={() => mark(item.id)}
          >
            {!item.read && <View style={s.unreadDot} />}
            <View style={{ flex: 1 }}>
              <Text style={[s.text, { fontWeight: item.read ? 'normal' : 'bold' }]}>{item.text}</Text>
              <Text style={s.time}>{item.time} • {item.read ? 'Đã đọc' : 'Chưa đọc'}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff', padding: 12 },
  btn: { borderWidth: 1, borderColor: '#007AFF', borderRadius: 8, padding: 10, alignItems: 'center', marginBottom: 12 },
  btnT: { color: '#007AFF', fontWeight: 'bold' },
  row: { flexDirection: 'row', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8, padding: 10, marginBottom: 8, alignItems: 'center' },
  unreadDot: { width: 8, height: 8, borderRadius: 999, backgroundColor: '#007AFF', marginRight: 8 },
  text: { fontSize: 14 },
  time: { fontSize: 12, marginTop: 4 },
});
