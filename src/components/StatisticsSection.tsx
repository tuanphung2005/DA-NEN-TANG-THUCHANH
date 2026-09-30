import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatisticItem, ThemeColors } from '../types';
import { StatCard } from './StatCard';
import { typography, SPACING } from '../theme';

interface StatisticsSectionProps {
  data: StatisticItem[];
  colors: ThemeColors;
  isDarkMode: boolean;
}

export const StatisticsSection: React.FC<StatisticsSectionProps> = ({
  data,
  colors,
  isDarkMode,
}) => {
  return (
    <View style={styles.container}>

      <View style={styles.cardsRow}>
        {data.map((item) => (
          <StatCard
            key={item.id}
            item={item}
            colors={colors}
            isDarkMode={isDarkMode}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  title: {
    marginBottom: SPACING.md,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
});
