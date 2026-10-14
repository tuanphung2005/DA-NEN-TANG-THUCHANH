import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Header from '../components/Header';

const INFO = [
  { label: 'SĐT', value: '0901234567' },
  { label: 'Ngày sinh', value: '29/10/2005' },
  { label: 'Giới tính', value: 'Nam' },
  { label: 'Địa chỉ', value: 'Hà Nội' },
  { label: 'Ngày đăng ký', value: '15/09/2026' },
];

export default function SettingsScreen({ navigation }: any) {
  const logout = () => (navigation.getParent() ?? navigation).replace('Login');

  return (
    <View style={s.wrap}>
      <Header />
      <View style={s.profile}>
        <View style={s.av}>
          <Text style={s.avT}>T</Text>
        </View>
        <Text style={s.name}>Phùng Anh Tuấn</Text>
        <Text style={s.sub}>phungtuan@phungtuan.vn</Text>
      </View>
      <Text style={s.title}>Thông tin cá nhân</Text>
      <View style={s.info}>
        {INFO.map(i => (
          <View key={i.label} style={s.row}>
            <Text style={s.label}>{i.label}</Text>
            <Text style={s.value}>{i.value}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={s.btn} onPress={logout}>
        <Text style={s.btnT}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff', padding: 16 },
  profile: { backgroundColor: '#fff', padding: 20, alignItems: 'center', marginBottom: 16 },
  av: { width: 64, height: 64, borderRadius: 999, backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  avT: { color: '#fff', fontWeight: 'bold', fontSize: 26 },
  name: { fontWeight: 'bold', fontSize: 18 },
  sub: { marginTop: 2 },
  title: { fontWeight: 'bold', fontSize: 15, marginBottom: 8 },
  info: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8, paddingHorizontal: 12, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  label: { fontSize: 14 },
  value: { fontWeight: '600', fontSize: 14 },
  btn: { backgroundColor: 'red', borderRadius: 8, padding: 14, alignItems: 'center' },
  btnT: { color: '#fff', fontWeight: 'bold' },
});
