import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemeColors } from '../types';

interface CoursesScreenProps {
  colors: ThemeColors;
}

export const CoursesScreen: React.FC<CoursesScreenProps> = ({ colors }) => {
  return <View style={[styles.container, { backgroundColor: colors.background }]} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
