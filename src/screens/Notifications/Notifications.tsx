import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Heart,
  MessageCircle,
  Users,
} from 'lucide-react-native';
import Header from '../../components/Header';
import { auth } from '../../services/firebase';
import {
  AppNotification,
  listenNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../services/notificationService';
import { formatTime } from '../../services/chatService';
import s from './styles';

export default function NotificationsScreen({ navigation }: any) {
  const myId = auth.currentUser?.uid ?? '';
  const [list, setList] = useState<AppNotification[]>([]);

  useEffect(() => listenNotifications(myId, setList), [myId]);

  const unread = list.filter(n => !n.read);

  const open = (item: AppNotification) => {
    if (!item.read) markNotificationRead(myId, item.id).catch(() => {});
    navigation.navigate('Chat', { convId: item.convId });
  };

  const markAll = () => {
    markAllNotificationsRead(
      myId,
      unread.map(n => n.id),
    ).catch(() => {});
  };

  const icon = (type: AppNotification['type']) => {
    if (type === 'group_add') return <Users color="#007AFF" size={18} />;
    if (type === 'reaction') return <Heart color="#E0245E" size={18} />;
    return <MessageCircle color="#007AFF" size={18} />;
  };

  return (
    <SafeAreaView style={s.wrap} edges={['top']}>
      <Header title="Thông báo" />
      <TouchableOpacity
        style={[s.btn, !unread.length && s.btnOff]}
        onPress={markAll}
        disabled={!unread.length}
      >
        <Text style={s.btnT}>Đánh dấu tất cả đã đọc</Text>
      </TouchableOpacity>
      <FlatList
        data={list}
        keyExtractor={i => i.id}
        ListEmptyComponent={
          <Text style={s.empty}>Chưa có thông báo nào.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.row, { backgroundColor: item.read ? '#fff' : '#EAF3FF' }]}
            onPress={() => open(item)}
          >
            <View style={s.icon}>{icon(item.type)}</View>
            <View style={s.mid}>
              <Text
                style={[
                  s.text,
                  { fontWeight: item.read ? 'normal' : 'bold' },
                ]}
              >
                {item.text}
              </Text>
              <Text style={s.time}>
                {formatTime(item.createdAt)} ·{' '}
                {item.read ? 'Đã đọc' : 'Chưa đọc'}
              </Text>
            </View>
            {!item.read && <View style={s.dot} />}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
