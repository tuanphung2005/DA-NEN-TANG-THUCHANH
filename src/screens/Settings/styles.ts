import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff', padding: 16 },
  screen: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  profile: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  av: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avT: { color: '#fff', fontWeight: 'bold', fontSize: 26 },
  name: { fontWeight: 'bold', fontSize: 18 },
  sub: { marginTop: 2 },
  title: { fontWeight: 'bold', fontSize: 15, marginBottom: 8 },
  info: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  label: { fontSize: 14 },
  value: { fontWeight: '600', fontSize: 14 },
  btn: {
    backgroundColor: 'red',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  btnT: { color: '#fff', fontWeight: 'bold' },
});
