import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Linking,
  PermissionsAndroid,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { ChevronLeft, MapPin } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../services/firebase';
import {
  conversationId,
  ensureConversation,
  formatTime,
  listenMessages,
  locationLabel,
  mapsUrl,
  markRead,
  Message,
  sendMessage,
} from '../../services/chat';
import { listenUser, User } from '../../services/users';
import s from './styles';

const getCurrentLocation = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      throw new Error('denied');
    }
  } else {
    Geolocation.requestAuthorization();
  }

  return new Promise<{ latitude: number; longitude: number }>(
    (resolve, reject) =>
      Geolocation.getCurrentPosition(
        ({ coords }) =>
          resolve({ latitude: coords.latitude, longitude: coords.longitude }),
        reject,
        {
          enableHighAccuracy: true,
          timeout: 15000,
        },
      ),
  );
};

export default function ChatScreen({ route, navigation }: any) {
  const myId = auth.currentUser?.uid ?? '';
  const otherId: string = route.params?.userId ?? '';
  const cid = conversationId(myId, otherId);

  const [other, setOther] = useState<User | null>(null);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => listenUser(otherId, setOther), [otherId]);

  useEffect(() => {
    let off: (() => void) | undefined;
    let alive = true;
    ensureConversation(myId, otherId)
      .then(() => {
        if (alive) off = listenMessages(cid, setMsgs);
      })
      .catch(() => {
        if (alive) Alert.alert('Lỗi', 'Không tải được cuộc trò chuyện.');
      });
    return () => {
      alive = false;
      off?.();
    };
  }, [cid, myId, otherId]);

  // Đang mở cuộc trò chuyện thì tin của người kia được coi là đã đọc.
  useEffect(() => {
    const last = msgs[msgs.length - 1];
    if (last && last.senderId !== myId) markRead(cid, myId);
  }, [msgs, cid, myId]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setSending(true);
    try {
      await sendMessage(myId, otherId, { type: 'text', text });
    } catch {
      setInput(text);
      Alert.alert('Lỗi', 'Không gửi được tin nhắn, vui lòng thử lại.');
    } finally {
      setSending(false);
    }
  };

  const shareLocation = async () => {
    try {
      const { latitude, longitude } = await getCurrentLocation();
      await sendMessage(myId, otherId, {
        type: 'location',
        latitude,
        longitude,
      });
    } catch (e: any) {
      Alert.alert(
        'Không thể gửi vị trí',
        e?.message === 'denied'
          ? 'Bạn đã từ chối quyền truy cập vị trí. Hãy bật lại trong phần Cài đặt.'
          : 'Không lấy được vị trí hiện tại.',
      );
    }
  };

  const name = other?.name ?? route.params?.name ?? 'Chat';
  const online = !!other?.online;

  return (
    <SafeAreaView style={s.wrap} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={s.flex} behavior="padding">
        <View style={s.head}>
          <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
            <ChevronLeft color="#007AFF" size={26} />
          </TouchableOpacity>
          <View style={s.av}>
            <Text style={s.avT}>{name[0]}</Text>
          </View>
          <View>
            <Text style={s.title}>{name}</Text>
            <View style={s.onRow}>
              <View
                style={[s.dot, { backgroundColor: online ? 'green' : '#ccc' }]}
              />
              <Text style={s.on}>{online ? 'Trực tuyến' : 'Ngoại tuyến'}</Text>
            </View>
          </View>
        </View>
        <FlatList
          ref={listRef}
          data={msgs}
          keyExtractor={i => i.id}
          contentContainerStyle={{ paddingVertical: 8 }}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            const mine = item.senderId === myId;
            return (
              <View style={[s.bubble, mine ? s.me : s.other]}>
                {item.type === 'location' ? (
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(
                        mapsUrl(item.latitude ?? 0, item.longitude ?? 0),
                      )
                    }
                  >
                    <View style={s.locRow}>
                      <MapPin
                        size={16}
                        color={mine ? '#fff' : '#007AFF'}
                        style={s.locIcon}
                      />
                      <Text style={[s.loc, mine && s.meT]}>
                        Vị trí đã chia sẻ
                      </Text>
                    </View>
                    <Text style={[s.coord, mine && s.meTime]}>
                      {locationLabel(item.latitude ?? 0, item.longitude ?? 0)}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={mine ? s.meT : s.otherT}>{item.text}</Text>
                )}
                <Text style={[s.time, mine && s.meTime]}>
                  {formatTime(item.createdAt)}
                </Text>
              </View>
            );
          }}
        />
        <View style={s.bar}>
          <TouchableOpacity style={s.locBtn} onPress={shareLocation}>
            <MapPin color="#007AFF" size={22} />
          </TouchableOpacity>
          <TextInput
            style={s.input}
            placeholder="Nhập tin nhắn"
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity style={s.send} onPress={send}>
            <Text style={s.sendT}>Gửi</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
