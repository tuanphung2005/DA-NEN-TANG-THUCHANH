import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff', padding: 12 },
  search: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  av: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avT: { color: '#fff', fontWeight: 'bold' },
  name: { fontWeight: 'bold', marginLeft: 10, flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 999, marginRight: 6 },
  st: { fontSize: 12 },
  empty: { textAlign: 'center', marginTop: 24, color: '#888' },
});
