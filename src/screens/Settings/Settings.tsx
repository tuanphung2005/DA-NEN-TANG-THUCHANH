import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../services/firebase';
import { logout } from '../../services/auth';
import { listenUser, User } from '../../services/users';
import s from './styles';

export default function SettingsScreen() {
  const uid = auth.currentUser?.uid ?? '';
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
    if (!uid) return;
    return listenUser(uid, setProfile);
  }, [uid]);

  const doLogout = async () => {
    try {
      await logout();
    } catch {
      Alert.alert('Lỗi', 'Không thể đăng xuất, vui lòng thử lại.');
    }
  };

  return (
    <SafeAreaView style={s.wrap} edges={['top']}>
      <Text style={s.screen}>Cài đặt</Text>
      <View style={s.profile}>
        <View style={s.av}>
          <Text style={s.avT}>{profile?.name?.[0] ?? '?'}</Text>
        </View>
        <Text style={s.name}>{profile?.name ?? ''}</Text>
        <Text style={s.sub}>{profile?.email ?? ''}</Text>
      </View>
      <Text style={s.title}>Thông tin cá nhân</Text>
      <View style={s.info}>
        <View style={s.row}>
          <Text style={s.label}>Họ tên</Text>
          <Text style={s.value}>{profile?.name ?? ''}</Text>
        </View>
        <View style={s.row}>
          <Text style={s.label}>Email</Text>
          <Text style={s.value}>{profile?.email ?? ''}</Text>
        </View>
      </View>
      <TouchableOpacity style={s.btn} onPress={doLogout}>
        <Text style={s.btnT}>Đăng xuất</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
