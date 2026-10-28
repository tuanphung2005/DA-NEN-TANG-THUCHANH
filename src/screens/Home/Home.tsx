import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin } from 'lucide-react-native';
import Header from '../../components/Header';
import { auth } from '../../services/firebase';
import {
  formatTime,
  listenConversations,
  Conversation,
} from '../../services/chat';
import { listenUsers, User } from '../../services/users';
import s from './styles';

export default function HomeScreen({ navigation }: any) {
  const myId = auth.currentUser?.uid ?? '';
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [q, setQ] = useState('');

  useEffect(() => listenConversations(myId, setConvs), [myId]);
  useEffect(
    () =>
      listenUsers(myId, list =>
        setUsers(Object.fromEntries(list.map(u => [u.id, u]))),
      ),
    [myId],
  );

  const rows = convs
    .map(c => {
      const otherId =
        Object.keys(c.members ?? {}).find(id => id !== myId) ?? '';
      return {
        ...c,
        otherId,
        name: users[otherId]?.name ?? 'Người dùng',
        unread: c.unread?.[myId] ?? 0,
      };
    })
    .filter(c => c.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <SafeAreaView style={s.wrap} edges={['top']}>
      <Header title="Trang chủ" />
      <TextInput
        style={s.search}
        placeholder="Tìm kiếm cuộc trò chuyện"
        value={q}
        onChangeText={setQ}
      />
      <FlatList
        data={rows}
        keyExtractor={i => i.id}
        ListEmptyComponent={
          <Text style={s.empty}>Chưa có cuộc trò chuyện nào.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.row}
            onPress={() =>
              navigation.navigate('Chat', {
                userId: item.otherId,
                name: item.name,
              })
            }
          >
            <View style={s.av}>
              <Text style={s.avT}>{item.name[0]}</Text>
            </View>
            <View style={s.mid}>
              <Text style={s.name}>{item.name}</Text>
              <View style={s.lastRow}>
                {item.lastType === 'location' && (
                  <MapPin size={12} color="#888" style={s.lastIcon} />
                )}
                <Text numberOfLines={1} style={s.last}>
                  {item.lastSenderId === myId ? 'Bạn: ' : ''}
                  {item.lastMessage}
                </Text>
              </View>
            </View>
            <View style={s.right}>
              <Text style={s.time}>{formatTime(item.lastTime)}</Text>
              {item.unread > 0 && (
                <View style={s.badge}>
                  <Text style={s.badgeT}>{item.unread}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
