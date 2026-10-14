import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Header from '../../components/Header';
import s from './styles';

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
