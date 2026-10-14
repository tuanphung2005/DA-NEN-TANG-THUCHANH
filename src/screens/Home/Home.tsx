import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import Header from '../../components/Header';
import s from './styles';

const CONVS = [
  { id: '1', name: 'An', last: 'Ok mai gặp nhé', time: '09:12', unread: 2 },
  { id: '2', name: 'Bình', last: 'Gửi file giúp mình', time: '08:40', unread: 0 },
  { id: '3', name: 'Chi', last: 'Cảm ơn nhiều', time: 'Hôm qua', unread: 5 },
  { id: '4', name: 'Dũng', last: 'Đang ở đâu vậy?', time: 'Hôm qua', unread: 0 },
  { id: '5', name: 'An', last: 'Ok mai gặp nhé', time: '09:12', unread: 1 },
];

export default function HomeScreen({ navigation }: any) {
  const [q, setQ] = useState('');
  const list = CONVS.filter(c => c.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <View style={s.wrap}>
      <Header />
      <TextInput style={s.search} placeholder="Tìm kiếm cuộc trò chuyện" value={q} onChangeText={setQ} />
      <FlatList
        data={list}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.row} onPress={() => navigation.navigate('Chat', { name: item.name })}>
            <View style={s.av}>
              <Text style={s.avT}>{item.name[0]}</Text>
            </View>
            <View style={s.mid}>
              <Text style={s.name}>{item.name}</Text>
              <Text numberOfLines={1} style={s.last}>{item.last}</Text>
            </View>
            <View style={s.right}>
              <Text style={s.time}>{item.time}</Text>
              {item.unread > 0 && (
                <View style={s.badge}>
                  <Text style={s.badgeT}>{item.unread}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
