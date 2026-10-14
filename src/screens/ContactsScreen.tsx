import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

import { USERS } from '../data/users';
import Header from '../components/Header';

export default function ContactsScreen({ navigation }: any) {
  const [q, setQ] = useState('');
  const list = USERS.filter(u => u.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <View style={s.wrap}>
      <Header />
      <TextInput style={s.search} placeholder="Tìm kiếm danh bạ" value={q} onChangeText={setQ} />
      <FlatList
        data={list}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.row} onPress={() => navigation.navigate('Chat', { name: item.name })}>
            <View style={s.av}>
              <Text style={s.avT}>{item.name[0]}</Text>
            </View>
            <Text style={s.name}>{item.name}</Text>
            <View style={[s.dot, { backgroundColor: item.online ? 'green' : '#ccc' }]} />
            <Text style={s.st}>{item.online ? 'Trực tuyến' : 'Ngoại tuyến'}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff', padding: 12 },
  search: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8, padding: 10, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8, padding: 10, marginBottom: 8 },
  av: { width: 40, height: 40, borderRadius: 999, backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center' },
  avT: { color: '#fff', fontWeight: 'bold' },
  name: { fontWeight: 'bold', marginLeft: 10, flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 999, marginRight: 6 },
  st: { fontSize: 12 },
});
