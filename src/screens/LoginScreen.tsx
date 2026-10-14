import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function LoginScreen({ navigation }: any) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');

  const login = () => {
    if (!user.trim() || !pass.trim()) {
      setErr('Tài khoản và mật khẩu không được để trống.');
      return;
    }
    setErr('');
    navigation.replace('Main');
  };

  return (
    <View style={s.wrap}>
      <Text style={s.app}>ChatApp</Text>
      <TextInput style={s.input} placeholder="Tài khoản" value={user} onChangeText={setUser} />
      <TextInput
        style={s.input}
        placeholder="Mật khẩu"
        value={pass}
        onChangeText={setPass}
        secureTextEntry
      />
      {!!err && <Text style={s.err}>{err}</Text>}
      <TouchableOpacity style={s.btn} onPress={login}>
        <Text style={s.btnT}>Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff', padding: 20, justifyContent: 'center' },
  app: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8, padding: 12, marginBottom: 12 },
  err: { color: 'red', marginBottom: 12 },
  btn: { backgroundColor: '#007AFF', borderRadius: 8, padding: 14, alignItems: 'center' },
  btnT: { color: '#fff', fontWeight: 'bold' },
});
