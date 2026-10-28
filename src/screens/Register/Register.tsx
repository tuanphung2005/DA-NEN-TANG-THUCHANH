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
import { authError, register } from '../../services/auth';
import s from './styles';

const LOGO = require('../../assets/logo.png');

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!name.trim() || !email.trim() || !pass || !confirm) {
      setErr('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    if (pass.length < 6) {
      setErr('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (pass !== confirm) {
      setErr('Mật khẩu nhập lại không khớp.');
      return;
    }
    setErr('');
    setBusy(true);
    try {
      await register(name, email, pass);
    } catch (e) {
      setErr(authError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={s.flex} edges={['bottom']}>
      <KeyboardAvoidingView style={s.flex} behavior="padding">
        <ScrollView
          contentContainerStyle={s.wrap}
          keyboardShouldPersistTaps="handled"
        >
          <Image source={LOGO} style={s.logo} resizeMode="contain" />
          <Text style={s.app}>Tạo tài khoản</Text>
          <TextInput
            style={s.input}
            placeholder="Họ và tên"
            value={name}
            onChangeText={setName}
          />
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
            placeholder="Mật khẩu (tối thiểu 6 ký tự)"
            value={pass}
            onChangeText={setPass}
            secureTextEntry
          />
          <TextInput
            style={s.input}
            placeholder="Nhập lại mật khẩu"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
          />
          {!!err && <Text style={s.err}>{err}</Text>}
          <TouchableOpacity style={s.btn} onPress={submit} disabled={busy}>
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.btnT}>Đăng ký</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={s.link} onPress={() => navigation.goBack()}>
            <Text style={s.linkT}>Đã có tài khoản? Đăng nhập</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
