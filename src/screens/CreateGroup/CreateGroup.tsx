import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Check,
  ChevronLeft,
  Square,
  Users,
} from 'lucide-react-native';
import { auth } from '../../services/firebase';
import { createGroup } from '../../services/groupService';
import { listenUser, listenUsers, User } from '../../services/users';
import s from './styles';

export default function CreateGroupScreen({ navigation }: any) {
  const myId = auth.currentUser?.uid ?? '';
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [me, setMe] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => listenUsers(myId, setUsers), [myId]);
  useEffect(() => listenUser(myId, setMe), [myId]);

  const picked = users.filter(u => selected[u.id]).map(u => u.id);
  const canCreate = name.trim().length > 0 && picked.length >= 2 && !busy;
  const missing = busy
    ? ''
    : !name.trim()
    ? 'Nhập tên nhóm để bật nút Tạo nhóm.'
    : picked.length < 2
    ? `Chọn thêm ${2 - picked.length} thành viên nữa.`
    : '';

  const toggle = (id: string) =>
    setSelected(p => ({ ...p, [id]: !p[id] }));

  const submit = async () => {
    if (busy) return;
    if (!name.trim()) {
      Alert.alert('Thiếu tên nhóm', 'Nhập tên nhóm trước khi tạo.');
      return;
    }
    if (picked.length < 2) {
      Alert.alert(
        'Chưa đủ thành viên',
        'Cần chọn ít nhất 2 người ngoài bạn.',
      );
      return;
    }
    setBusy(true);
    try {
      const cid = await createGroup(
        { id: myId, name: me?.name ?? 'Ai đó' },
        name.trim(),
        picked,
      );
      navigation.replace('Chat', { convId: cid, name: name.trim() });
    } catch (e: any) {
      console.warn('[group] create failed', e?.code ?? e?.message);
      Alert.alert(
        'Không tạo được nhóm',
        e?.message === 'members'
          ? 'Cần chọn ít nhất 2 thành viên ngoài bạn.'
          : `${e?.code ?? ''} ${e?.message ?? ''}\nKiểm tra database.rules.json đã Publish.`.trim(),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={s.wrap} edges={['top', 'bottom']}>
      <View style={s.head}>
        <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#007AFF" size={26} />
        </TouchableOpacity>
        <Users color="#007AFF" size={22} />
        <Text style={s.title}>Tạo nhóm</Text>
      </View>

      <TextInput
        style={s.input}
        placeholder="Tên nhóm"
        value={name}
        onChangeText={setName}
      />

      <Text style={s.label}>
        Chọn thành viên ({picked.length}) · tối thiểu 2 người
      </Text>

      <FlatList
        data={users}
        keyExtractor={i => i.id}
        ListEmptyComponent={
          <Text style={s.empty}>Chưa có người dùng nào.</Text>
        }
        renderItem={({ item }) => {
          const on = !!selected[item.id];
          return (
            <TouchableOpacity style={s.row} onPress={() => toggle(item.id)}>
              <View style={s.av}>
                <Text style={s.avT}>{item.name[0]}</Text>
              </View>
              <View style={s.mid}>
                <Text style={s.name}>{item.name}</Text>
                <Text style={s.st}>
                  {item.online ? 'Trực tuyến' : 'Ngoại tuyến'}
                </Text>
              </View>
              {on ? (
                <Check color="#007AFF" size={22} />
              ) : (
                <Square color="#bbb" size={22} />
              )}
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity
        style={[s.btn, !canCreate && s.btnOff]}
        onPress={submit}
        disabled={busy}
      >
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={s.btnT}>Tạo nhóm</Text>
        )}
      </TouchableOpacity>
      {!!missing && <Text style={s.hint}>{missing}</Text>}
    </SafeAreaView>
  );
}
