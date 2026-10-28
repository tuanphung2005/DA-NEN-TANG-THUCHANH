import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authError, login } from '../../services/auth';
import s from './styles';

const LOGO = require('../../assets/logo.png');

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || !pass) {
      setErr('Email và mật khẩu không được để trống.');
      return;
    }
    setErr('');
    setBusy(true);
    try {
      await login(email, pass);
    } catch (e) {
      setErr(authError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={s.flex} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={s.flex} behavior="padding">
        <ScrollView
          contentContainerStyle={s.wrap}
          keyboardShouldPersistTaps="handled"
        >
          <Image source={LOGO} style={s.logo} resizeMode="contain" />
          <Text style={s.app}>UDU CHAT</Text>
          <TextInput
            style={s.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={s.input}
            placeholder="Mật khẩu"
            value={pass}
            onChangeText={setPass}
            secureTextEntry
          />
          {!!err && <Text style={s.err}>{err}</Text>}
          <TouchableOpacity style={s.btn} onPress={submit} disabled={busy}>
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.btnT}>Đăng nhập</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={s.link}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={s.linkT}>Chưa có tài khoản? Đăng ký</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
