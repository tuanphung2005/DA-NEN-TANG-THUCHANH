import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../services/firebase';
import { listenUsers, User } from '../../services/users';
import Header from '../../components/Header';
import s from './styles';

export default function ContactsScreen({ navigation }: any) {
  const myId = auth.currentUser?.uid ?? '';
  const [users, setUsers] = useState<User[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => listenUsers(myId, setUsers), [myId]);

  const list = users.filter(u =>
    u.name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <SafeAreaView style={s.wrap} edges={['top']}>
      <Header title="Danh bạ" />
      <TextInput
        style={s.search}
        placeholder="Tìm kiếm danh bạ"
        value={q}
        onChangeText={setQ}
      />
      <FlatList
        data={list}
        keyExtractor={i => i.id}
        ListEmptyComponent={
          <Text style={s.empty}>Chưa có người dùng nào.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.row}
            onPress={() =>
              navigation.navigate('Chat', { userId: item.id, name: item.name })
            }
          >
            <View style={s.av}>
              <Text style={s.avT}>{item.name[0]}</Text>
            </View>
            <Text style={s.name}>{item.name}</Text>
            <View
              style={[
                s.dot,
                { backgroundColor: item.online ? 'green' : '#ccc' },
              ]}
            />
            <Text style={s.st}>
              {item.online ? 'Trực tuyến' : 'Ngoại tuyến'}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
