import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemeColors } from '../types';

interface ProfileScreenProps {
  colors: ThemeColors;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ colors }) => {
  return <View style={[styles.container, { backgroundColor: colors.background }]} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
