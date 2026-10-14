import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff', padding: 12 },
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  av: { width: 44, height: 44, borderRadius: 999, backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avT: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  title: { fontWeight: 'bold', fontSize: 18 },
  onRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  dot: { width: 8, height: 8, borderRadius: 999, marginRight: 5 },
  on: { fontSize: 12 },
  bubble: { maxWidth: '75%', borderRadius: 8, padding: 10, marginBottom: 8 },
  other: { backgroundColor: '#F0F0F0', alignSelf: 'flex-start' },
  me: { backgroundColor: '#007AFF', alignSelf: 'flex-end' },
  otherT: { color: '#000' },
  meT: { color: '#fff' },
  time: { fontSize: 10, marginTop: 4 },
  bar: { flexDirection: 'row', marginTop: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8, padding: 10, marginRight: 8 },
  send: { backgroundColor: '#007AFF', borderRadius: 8, paddingHorizontal: 18, justifyContent: 'center' },
  sendT: { color: '#fff', fontWeight: 'bold' },
});
