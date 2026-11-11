import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  PermissionsAndroid,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import Clipboard from '@react-native-clipboard/clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Camera,
  ChevronLeft,
  Copy,
  Heart,
  Image as ImageIcon,
  MapPin,
  Send,
  Undo2,
  X,
} from 'lucide-react-native';
import { auth } from '../../services/firebase';
import {
  Conversation,
  Message,
  conversationId,
  ensureDirect,
  formatLastSeen,
  formatTime,
  listenConversation,
  listenMessages,
  listenReadStatus,
  listenTyping,
  locationLabel,
  mapsUrl,
  markRead,
  prepareTyping,
  recallMessage,
  sendMessage,
  setTyping,
  stopTyping,
  toggleReaction,
} from '../../services/chatService';
import { setActiveConversation } from '../../services/notificationService';
import { listenUser, listenUsers, User } from '../../services/users';
import {
  pickFromCamera,
  pickFromLibrary,
  uploadImage,
} from '../../services/uploadService';
import s from './styles';

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢'];
const PAGE = 20;

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
        { enableHighAccuracy: true, timeout: 15000 },
      ),
  );
};

type Pending = { id: string; uri: string; failed?: boolean };

const groupReactions = (reactions: Record<string, string>) => {
  const counts: Record<string, number> = {};
  Object.values(reactions).forEach(emoji => {
    counts[emoji] = (counts[emoji] ?? 0) + 1;
  });
  return Object.entries(counts);
};

export default function ChatScreen({ route, navigation }: any) {
  const myId = auth.currentUser?.uid ?? '';
  const params = route.params ?? {};
  const directPeer: string = params.userId ?? '';
  const cid: string =
    params.convId ?? (directPeer ? conversationId(myId, directPeer) : '');

  const [ready, setReady] = useState(!!params.convId);
  const [conv, setConv] = useState<Conversation | null>(null);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [limitN, setLimitN] = useState(PAGE);
  const [typingMap, setTypingMap] = useState<Record<string, boolean>>({});
  const [reads, setReads] = useState<Record<string, number>>({});
  const [users, setUsers] = useState<Record<string, User>>({});
  const [me, setMe] = useState<User | null>(null);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);
  const [menu, setMenu] = useState<Message | null>(null);
  const [viewer, setViewer] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const listRef = useRef<FlatList<Message>>(null);
  const atBottom = useRef(true);
  const prevLen = useRef(0);
  const typingOn = useRef(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingMore = useRef(false);

  const myName = me?.name ?? 'Tôi';
  const directFallback: Conversation | null =
    directPeer && myId
      ? {
          id: cid,
          type: 'direct',
          members: { [myId]: true, [directPeer]: true },
        }
      : null;
  const activeConv = conv ?? directFallback;

  useEffect(() => {
    if (!myId) return;
    return listenUser(myId, setMe);
  }, [myId]);

  useEffect(
    () =>
      listenUsers(myId, list =>
        setUsers(Object.fromEntries(list.map(u => [u.id, u]))),
      ),
    [myId],
  );

  useEffect(() => {
    if (params.convId || !directPeer || !myId) return;
    let alive = true;
    ensureDirect(myId, directPeer)
      .then(() => alive && setReady(true))
      .catch(
        () =>
          alive &&
          Alert.alert('Lỗi', 'Không mở được cuộc trò chuyện.'),
      );
    return () => {
      alive = false;
    };
  }, [myId, directPeer, params.convId]);

  useEffect(() => {
    if (!ready || !cid) return;
    const offs = [
      listenConversation(cid, setConv, e =>
        console.warn('[chat] conversation error', e?.code ?? e?.message),
      ),
      listenTyping(
        cid,
        setTypingMap,
        e => console.warn('[typing] listen error', e?.code ?? e?.message),
      ),
      listenReadStatus(cid, setReads, e =>
        console.warn('[read] listen error', e?.code ?? e?.message),
      ),
    ];
    return () => offs.forEach(off => off());
  }, [ready, cid]);

  useEffect(() => {
    if (!ready || !cid) return;
    return listenMessages(
      cid,
      limitN,
      setMsgs,
      e =>
        Alert.alert(
          'Không tải được tin nhắn',
          `${e?.code ?? ''} ${e?.message ?? ''}\nKiểm tra database.rules.json đã Publish (có .indexOn createdAt).`,
        ),
    );
  }, [ready, cid, limitN]);

  useEffect(() => {
    if (!cid || !myId) return;
    setActiveConversation(myId, cid);
    return () => setActiveConversation(myId, null);
  }, [cid, myId]);

  useEffect(() => {
    if (!ready || !cid || !myId) return;
    prepareTyping(cid, myId);
    return () => {
      stopTyping(cid, myId);
    };
  }, [ready, cid, myId]);

  useEffect(
    () => () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
    },
    [],
  );

  const last = msgs[msgs.length - 1];
  const lastId = last?.id ?? '';

  useEffect(() => {
    if (!ready || !cid || !lastId) return;
    markRead(cid, myId).catch(e =>
      console.warn('[read] mark failed', e?.code ?? e?.message),
    );
  }, [ready, cid, myId, lastId]);

  useEffect(() => {
    if (!pending) return;
    requestAnimationFrame(() =>
      listRef.current?.scrollToEnd({ animated: true }),
    );
  }, [pending]);

  useEffect(() => {
    const someoneTyping = Object.keys(typingMap).some(
      id => typingMap[id] && id !== myId,
    );
    if (someoneTyping && atBottom.current) {
      requestAnimationFrame(() =>
        listRef.current?.scrollToEnd({ animated: true }),
      );
    }
  }, [typingMap, myId]);

  useEffect(() => {
    if (!last) return;
    const initial = prevLen.current === 0;
    if (initial || last.senderId === myId || atBottom.current) {
      requestAnimationFrame(() =>
        listRef.current?.scrollToEnd({ animated: !initial }),
      );
    }
    prevLen.current = msgs.length;
  }, [last, msgs.length, myId]);

  useEffect(() => {
    loadingMore.current = false;
  }, [msgs.length]);

  const clearTyping = () => {
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }
    if (typingOn.current && cid) {
      typingOn.current = false;
      setTyping(cid, myId, false).catch(e =>
        console.warn('[typing] off error', e?.code ?? e?.message),
      );
    }
  };

  const onChangeText = (text: string) => {
    setInput(text);
    if (!ready || !cid) return;
    if (text && !typingOn.current) {
      typingOn.current = true;
      setTyping(cid, myId, true).catch(e =>
        console.warn('[typing] on error', e?.code ?? e?.message),
      );
    }
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(clearTyping, 3000);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || busy || !cid) return;
    if (!activeConv) {
      Alert.alert(
        'Chưa tải được cuộc trò chuyện',
        'Kiểm tra đã Publish database.rules.json rồi thử lại.',
      );
      return;
    }
    clearTyping();
    setInput('');
    setBusy(true);
    try {
      await sendMessage(
        cid,
        activeConv,
        { id: myId, name: myName },
        { type: 'text', text },
      );
    } catch (e: any) {
      console.warn('[send] failed', e?.code ?? e?.message);
      setInput(text);
      Alert.alert(
        'Không gửi được tin nhắn',
        `${e?.code ?? ''} ${e?.message ?? ''}`.trim(),
      );
    } finally {
      setBusy(false);
    }
  };

  const shareLocation = async () => {
    if (!activeConv || !cid) {
      Alert.alert(
        'Chưa tải được cuộc trò chuyện',
        'Kiểm tra đã Publish database.rules.json rồi thử lại.',
      );
      return;
    }
    try {
      const { latitude, longitude } = await getCurrentLocation();
      await sendMessage(
        cid,
        activeConv,
        { id: myId, name: myName },
        { type: 'location', latitude, longitude },
      );
    } catch (e: any) {
      Alert.alert(
        'Không thể gửi vị trí',
        e?.message === 'denied'
          ? 'Bạn đã từ chối quyền truy cập vị trí. Hãy bật lại trong phần Cài đặt.'
          : 'Không lấy được vị trí hiện tại.',
      );
    }
  };

  const uploadAndSend = async (uri: string) => {
    if (!activeConv || !cid) {
      Alert.alert(
        'Chưa tải được cuộc trò chuyện',
        'Kiểm tra đã Publish database.rules.json rồi thử lại.',
      );
      return;
    }
    const id = String(Date.now());
    setPending({ id, uri });
    try {
      const imageUrl = await uploadImage(uri);
      await sendMessage(
        cid,
        activeConv,
        { id: myId, name: myName },
        { type: 'image', imageUrl },
      );
      setPending(p => (p?.id === id ? null : p));
    } catch (e: any) {
      setPending(p => (p?.id === id ? { ...p, failed: true } : p));
      Alert.alert(
        'Tải ảnh thất bại',
        e?.message === 'cloudinary'
          ? 'Chưa cấu hình Cloudinary trong src/services/uploadService.ts.'
          : e?.message ?? 'Không upload được ảnh, vui lòng thử lại.',
      );
    }
  };

  const chooseImage = async (source: 'camera' | 'library') => {
    setPickerOpen(false);
    try {
      const uri =
        source === 'camera'
          ? await pickFromCamera()
          : await pickFromLibrary();
      if (uri) await uploadAndSend(uri);
    } catch (e: any) {
      Alert.alert(
        'Không mở được ảnh',
        e?.message === 'permission'
          ? 'Bạn đã từ chối quyền camera/thư viện ảnh. Hãy bật lại trong Cài đặt.'
          : 'Vui lòng thử lại.',
      );
    }
  };

  const reactTo = async (msg: Message, emoji: string) => {
    setMenu(null);
    try {
      await toggleReaction(cid, msg, myId, emoji, myName);
    } catch {
      Alert.alert('Lỗi', 'Không thả được cảm xúc.');
    }
  };

  const doRecall = async (msg: Message) => {
    setMenu(null);
    try {
      await recallMessage(
        cid,
        msg,
        Object.keys(conv?.members ?? {}),
        msg.id === last?.id,
      );
    } catch {
      Alert.alert('Lỗi', 'Không thu hồi được tin nhắn.');
    }
  };

  const copyMessage = (msg: Message) => {
    setMenu(null);
    if (msg.text) Clipboard.setString(msg.text);
  };

  const loadOlder = () => {
    if (loadingMore.current || msgs.length < limitN) return;
    loadingMore.current = true;
    setLimitN(n => n + PAGE);
  };

  const memberIds = Object.keys(conv?.members ?? {});
  const isGroup = conv?.type === 'group';
  const peerId =
    directPeer ||
    memberIds.find(id => id !== myId) ||
    '';
  const peer = users[peerId];
  const name = isGroup
    ? conv?.name ?? params.name ?? 'Nhóm'
    : peer?.name ?? params.name ?? 'Chat';

  const typingUids = Object.keys(typingMap).filter(
    id => typingMap[id] && id !== myId,
  );
  const typingNames = typingUids.map(id => users[id]?.name ?? 'Thành viên');
  const typingLabel = typingUids.length
    ? isGroup
      ? typingNames.length === 1
        ? `${typingNames[0]} đang soạn tin…`
        : `${typingNames.length} người đang soạn tin…`
      : 'đang soạn tin…'
    : '';
  const onlineCount = memberIds.filter(id =>
    id === myId ? me?.online : users[id]?.online,
  ).length;
  const subtitle = typingLabel
    ? typingLabel
    : isGroup
    ? `${memberIds.length} thành viên · ${onlineCount} đang online`
    : peer?.online
    ? 'Trực tuyến'
    : formatLastSeen(peer?.lastSeen);

  const others = memberIds.filter(id => id !== myId);
  const lastMineId = [...msgs]
    .reverse()
    .find(m => m.senderId === myId && !m.recalled)?.id;

  return (
    <SafeAreaView style={s.wrap} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={s.flex} behavior="padding">
        <View style={s.head}>
          <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
            <ChevronLeft color="#007AFF" size={26} />
          </TouchableOpacity>
          <View style={s.av}>
            <Text style={s.avT}>{name[0] ?? '?'}</Text>
          </View>
          <View style={s.headMid}>
            <Text style={s.title} numberOfLines={1}>
              {name}
            </Text>
            <View style={s.onRow}>
              {isGroup || typingUids.length ? null : (
                <View
                  style={[
                    s.dot,
                    { backgroundColor: peer?.online ? 'green' : '#ccc' },
                  ]}
                />
              )}
              <Text
                style={[s.on, typingUids.length ? s.typing : null]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            </View>
          </View>
        </View>

        <FlatList
          ref={listRef}
          data={msgs}
          style={s.flex}
          keyExtractor={i => i.id}
          contentContainerStyle={s.list}
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
          scrollEventThrottle={16}
          onScroll={e => {
            const { contentOffset, contentSize, layoutMeasurement } =
              e.nativeEvent;
            atBottom.current =
              contentOffset.y + layoutMeasurement.height >=
              contentSize.height - 80;
            if (contentOffset.y < 30) loadOlder();
          }}
          ListHeaderComponent={
            msgs.length >= limitN ? (
              <ActivityIndicator style={s.older} color="#007AFF" />
            ) : undefined
          }
          ListFooterComponent={
            typingLabel || pending ? (
              <>
                {pending ? (
                  <View style={s.pendingRow}>
                    <View style={[s.bubble, s.me, s.pendingBubble]}>
                      <Image source={{ uri: pending.uri }} style={s.img} />
                      {pending.failed ? (
                        <View style={s.pendingOverlay}>
                          <TouchableOpacity
                            style={s.retry}
                            onPress={() => uploadAndSend(pending.uri)}
                          >
                            <Text style={s.retryT}>Thử lại</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={s.pendingOverlay}>
                          <ActivityIndicator color="#fff" />
                        </View>
                      )}
                    </View>
                  </View>
                ) : null}
                {typingLabel ? (
                  <View style={[s.msgRow, s.msgRowOther]}>
                    <View style={[s.bubble, s.other, s.typingBubble]}>
                      <Text style={s.typingText}>{typingLabel}</Text>
                    </View>
                  </View>
                ) : null}
              </>
            ) : undefined
          }
          renderItem={({ item }) => {
            const mine = item.senderId === myId;
            const isLastMine = item.id === lastMineId;
            const msgTime = item.createdAt ?? Infinity;
            const seenIds = isLastMine
              ? others.filter(id => (reads[id] ?? 0) >= msgTime)
              : [];
            const lastSeen = seenIds.length
              ? Math.max(...seenIds.map(id => reads[id] ?? 0))
              : 0;
            const seenNames = seenIds.map(
              id => users[id]?.name ?? 'Thành viên',
            );
            const reactions = item.reactions
              ? groupReactions(item.reactions)
              : [];

            return (
              <View style={[s.msgRow, mine ? s.msgRowMine : s.msgRowOther]}>
                {isGroup && !mine && (
                  <Text style={s.sender}>
                    {item.senderName ??
                      users[item.senderId]?.name ??
                      'Thành viên'}
                  </Text>
                )}
                <Pressable
                  onLongPress={() => setMenu(item)}
                  delayLongPress={300}
                  style={[s.bubble, mine ? s.me : s.other]}
                >
                  {item.recalled ? (
                    <View style={s.recallRow}>
                      <Undo2
                        size={14}
                        color={mine ? '#fff' : '#666'}
                        style={s.locIcon}
                      />
                      <Text style={[s.recallT, mine && s.meT]}>
                        Tin nhắn đã được thu hồi
                      </Text>
                    </View>
                  ) : item.type === 'image' && item.imageUrl ? (
                    <TouchableOpacity
                      onPress={() => setViewer(item.imageUrl ?? null)}
                    >
                      <Image source={{ uri: item.imageUrl }} style={s.img} />
                    </TouchableOpacity>
                  ) : item.type === 'location' ? (
                    <TouchableOpacity
                      onPress={() =>
                        Linking.openURL(
                          mapsUrl(
                            item.latitude ?? 0,
                            item.longitude ?? 0,
                          ),
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
                        {locationLabel(
                          item.latitude ?? 0,
                          item.longitude ?? 0,
                        )}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={mine ? s.meT : s.otherT}>
                      {item.text}
                    </Text>
                  )}
                  <Text style={[s.time, mine && s.meTime]}>
                    {formatTime(item.createdAt)}
                  </Text>
                </Pressable>

                {!item.recalled && reactions.length > 0 && (
                  <View
                    style={[
                      s.reactions,
                      mine ? s.reactionsMine : s.reactionsOther,
                    ]}
                  >
                    {reactions.map(([emoji, count]) => (
                      <TouchableOpacity
                        key={emoji}
                        style={s.chip}
                        onPress={() => reactTo(item, emoji)}
                      >
                        <Text style={s.chipT}>
                          {emoji} {count}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {isLastMine && !item.recalled && (
                  <Text style={s.status}>
                    {seenIds.length
                      ? isGroup
                        ? `Đã xem: ${seenNames.join(', ')} · ${formatTime(
                            lastSeen,
                          )}`
                        : `Đã xem ${formatTime(lastSeen)}`
                      : 'Đã gửi'}
                  </Text>
                )}
              </View>
            );
          }}
        />

        <View style={s.bar}>
          <TouchableOpacity
            style={s.iconBtn}
            onPress={() => setPickerOpen(true)}
          >
            <Camera color="#007AFF" size={22} />
          </TouchableOpacity>
          <TouchableOpacity style={s.iconBtn} onPress={shareLocation}>
            <MapPin color="#007AFF" size={22} />
          </TouchableOpacity>
          <TextInput
            style={s.input}
            placeholder="Nhập tin nhắn"
            value={input}
            onChangeText={onChangeText}
            multiline
            returnKeyType="send"
            submitBehavior="submit"
            onSubmitEditing={send}
          />
          <TouchableOpacity style={s.send} onPress={send} disabled={busy}>
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Send color="#fff" size={20} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={pickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerOpen(false)}
      >
        <Pressable style={s.backdrop} onPress={() => setPickerOpen(false)}>
          <Pressable style={s.sheet} onPress={() => {}}>
            <Text style={s.sheetTitle}>Gửi ảnh</Text>
            <TouchableOpacity
              style={s.sheetBtn}
              onPress={() => chooseImage('camera')}
            >
              <Camera color="#007AFF" size={20} />
              <Text style={s.sheetT}>Chụp ảnh</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.sheetBtn}
              onPress={() => chooseImage('library')}
            >
              <ImageIcon color="#007AFF" size={20} />
              <Text style={s.sheetT}>Chọn từ thư viện</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.sheetBtn, s.sheetCancel]}
              onPress={() => setPickerOpen(false)}
            >
              <X color="#888" size={20} />
              <Text style={s.sheetT}>Đóng</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={!!menu}
        transparent
        animationType="fade"
        onRequestClose={() => setMenu(null)}
      >
        <Pressable style={s.backdrop} onPress={() => setMenu(null)}>
          <Pressable style={s.sheet} onPress={() => {}}>
            <Text style={s.sheetTitle} numberOfLines={1}>
              {menu && !menu.recalled && menu.type === 'text' && menu.text
                ? menu.text
                : 'Tin nhắn'}
            </Text>
            {menu && !menu.recalled && (
              <View style={s.reactRow}>
                {REACTIONS.map(emoji => (
                  <TouchableOpacity
                    key={emoji}
                    style={s.reactBtn}
                    onPress={() => reactTo(menu, emoji)}
                  >
                    <Text style={s.reactEmoji}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {menu &&
              !menu.recalled &&
              menu.type === 'text' &&
              !!menu.text && (
                <TouchableOpacity
                  style={s.sheetBtn}
                  onPress={() => copyMessage(menu)}
                >
                  <Copy color="#007AFF" size={20} />
                  <Text style={s.sheetT}>Sao chép</Text>
                </TouchableOpacity>
              )}
            {menu && menu.senderId === myId && !menu.recalled && (
              <TouchableOpacity
                style={s.sheetBtn}
                onPress={() => doRecall(menu)}
              >
                <Undo2 color="#d11" size={20} />
                <Text style={[s.sheetT, s.danger]}>Thu hồi</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[s.sheetBtn, s.sheetCancel]}
              onPress={() => setMenu(null)}
            >
              <X color="#888" size={20} />
              <Text style={s.sheetT}>Đóng</Text>
            </TouchableOpacity>
            {menu && !menu.recalled && (
              <View style={s.hintRow}>
                <Heart color="#888" size={14} />
                <Text style={s.hint}>Chạm cảm xúc để thả / bỏ</Text>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={!!viewer}
        transparent
        animationType="fade"
        onRequestClose={() => setViewer(null)}
      >
        <View style={s.viewer}>
          {viewer && (
            <Image
              source={{ uri: viewer }}
              style={s.viewerImg}
              resizeMode="contain"
            />
          )}
          <TouchableOpacity
            style={s.viewerClose}
            onPress={() => setViewer(null)}
          >
            <X color="#fff" size={26} />
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
