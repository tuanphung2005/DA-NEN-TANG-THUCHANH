import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { USERS } from '../../data/users';
import s from './styles';

export default function ChatScreen({ route }: any) {
  const name = route.params?.name ?? 'Chat';
  const online = route.params?.online ?? USERS.find(u => u.name === name)?.online ?? true;
  const [msgs, setMsgs] = useState([
    { id: '1', text: 'Chào bạn!', time: '09:10', me: false },
    { id: '2', text: 'Bạn khỏe không?', time: '09:11', me: false },
    { id: '3', text: 'Mai gặp nhé', time: '09:12', me: false },
  ]);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    setMsgs(p => [...p, { id: String(Date.now()), text: input.trim(), time: 'Bây giờ', me: true }]);
    setInput('');
  };

  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <View style={s.av}>
          <Text style={s.avT}>{name[0]}</Text>
        </View>
        <View>
          <Text style={s.title}>{name}</Text>
          <View style={s.onRow}>
            <View style={[s.dot, { backgroundColor: online ? 'green' : '#ccc' }]} />
            <Text style={s.on}>{online ? 'Trực tuyến' : 'Ngoại tuyến'}</Text>
          </View>
        </View>
      </View>
      <FlatList
        data={msgs}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingVertical: 8 }}
        renderItem={({ item }) => (
          <View style={[s.bubble, item.me ? s.me : s.other]}>
            <Text style={item.me ? s.meT : s.otherT}>{item.text}</Text>
            <Text style={s.time}>{item.time}</Text>
          </View>
        )}
      />
      <View style={s.bar}>
        <TextInput style={s.input} placeholder="Nhập tin nhắn" value={input} onChangeText={setInput} />
        <TouchableOpacity style={s.send} onPress={send}>
          <Text style={s.sendT}>Gửi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
