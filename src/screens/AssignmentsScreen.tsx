import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemeColors } from '../types';

interface AssignmentsScreenProps {
  colors: ThemeColors;
}

export const AssignmentsScreen: React.FC<AssignmentsScreenProps> = ({ colors }) => {
  return <View style={[styles.container, { backgroundColor: colors.background }]} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
