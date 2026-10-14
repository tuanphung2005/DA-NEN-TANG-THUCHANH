import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff', padding: 12 },
  search: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8, padding: 10, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8, padding: 10, marginBottom: 8 },
  av: { width: 44, height: 44, borderRadius: 999, backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center' },
  avT: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  mid: { flex: 1, marginHorizontal: 10 },
  name: { fontWeight: 'bold', fontSize: 15 },
  last: { marginTop: 2 },
  right: { alignItems: 'flex-end' },
  time: { fontSize: 12 },
  badge: { backgroundColor: 'red', borderRadius: 999, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', marginTop: 4, paddingHorizontal: 5 },
  badgeT: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
});
