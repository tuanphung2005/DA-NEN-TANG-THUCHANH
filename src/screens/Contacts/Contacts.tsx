import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { USERS } from '../../data/users';
import Header from '../../components/Header';
import s from './styles';

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
