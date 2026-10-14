import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import s from './styles';

const LOGO = require('../../assets/logo.png');

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
      <Image source={LOGO} style={s.logo} resizeMode="contain" />
      <Text style={s.app}>UDU CHAT</Text>
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
