import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff', padding: 12 },
  btn: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnOff: { borderColor: '#ccc' },
  btnT: { color: '#007AFF', fontWeight: 'bold' },
  row: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    alignItems: 'center',
  },
  icon: { marginRight: 10 },
  mid: { flex: 1 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#007AFF',
  },
  text: { fontSize: 14 },
  time: { fontSize: 12, marginTop: 4, color: '#666' },
  empty: { textAlign: 'center', marginTop: 24, color: '#888' },
});
