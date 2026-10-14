import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import Header from '../../components/Header';
import s from './styles';

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
