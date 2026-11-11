import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Image as ImageIcon,
  MapPin,
  Undo2,
  Users,
} from 'lucide-react-native';
import Header from '../../components/Header';
import { auth } from '../../services/firebase';
import {
  ChatItem,
  formatTime,
  listenChats,
} from '../../services/chatService';
import { listenUsers, User } from '../../services/users';
import s from './styles';

export default function HomeScreen({ navigation }: any) {
  const myId = auth.currentUser?.uid ?? '';
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [q, setQ] = useState('');

  useEffect(() => listenChats(myId, setChats), [myId]);
  useEffect(
    () =>
      listenUsers(myId, list =>
        setUsers(Object.fromEntries(list.map(u => [u.id, u]))),
      ),
    [myId],
  );

  const rows = chats
    .map(c => ({
      ...c,
      name:
        c.type === 'group'
          ? c.title || 'Nhóm'
          : users[c.peerId ?? '']?.name || c.title || 'Người dùng',
      lastIcon:
        c.lastType === 'image'
          ? ('image' as const)
          : c.lastType === 'location'
          ? ('location' as const)
          : c.lastType === 'recalled'
          ? ('recalled' as const)
          : null,
    }))
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
              navigation.navigate('Chat', { convId: item.id, name: item.name })
            }
          >
            <View style={s.av}>
              {item.type === 'group' ? (
                <Users color="#fff" size={20} />
              ) : (
                <Text style={s.avT}>{item.name[0]}</Text>
              )}
            </View>
            <View style={s.mid}>
              <View style={s.nameRow}>
                {item.type === 'group' && (
                  <Users color="#888" size={13} style={s.groupIcon} />
                )}
                <Text style={s.name} numberOfLines={1}>
                  {item.name}
                </Text>
              </View>
              <View style={s.lastRow}>
                {item.lastIcon === 'image' && (
                  <ImageIcon size={12} color="#888" style={s.lastIcon} />
                )}
                {item.lastIcon === 'location' && (
                  <MapPin size={12} color="#888" style={s.lastIcon} />
                )}
                {item.lastIcon === 'recalled' && (
                  <Undo2 size={12} color="#888" style={s.lastIcon} />
                )}
                <Text numberOfLines={1} style={s.last}>
                  {item.lastSenderId === myId
                    ? 'Bạn: '
                    : item.type === 'group'
                    ? `${item.lastSenderName ?? ''}: `
                    : ''}
                  {item.lastMessage}
                </Text>
              </View>
            </View>
            <View style={s.right}>
              <Text style={s.time}>{formatTime(item.updatedAt)}</Text>
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
