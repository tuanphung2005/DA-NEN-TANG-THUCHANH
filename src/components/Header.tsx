import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Header() {
  return (
    <View style={s.wrap}>
      <View style={s.av}>
        <Text style={s.avT}>T</Text>
      </View>
      <Text style={s.hi}>Xin chào, Tuấn</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  av: { width: 40, height: 40, borderRadius: 999, backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avT: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  hi: { fontSize: 18, fontWeight: 'bold' },
});
