import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BookOpen, ClipboardList, Trophy } from 'lucide-react-native';
import { StatisticItem, ThemeColors } from '../types';
import { typography, getBottomShadow, RADIUS, SPACING } from '../theme';

interface StatCardProps {
  item: StatisticItem;
  colors: ThemeColors;
  isDarkMode: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ item, colors, isDarkMode }) => {
  const renderIcon = () => {
    const iconProps = { size: 20, color: item.color };
    switch (item.icon) {
      case 'book-open':
        return <BookOpen {...iconProps} />;
      case 'clipboard-list':
        return <ClipboardList {...iconProps} />;
      case 'trophy':
        return <Trophy {...iconProps} />;
      default:
        return <BookOpen {...iconProps} />;
    }
  };

  const cardShadow = getBottomShadow('md', isDarkMode);

  return (
    <View
      style={[
        styles.card,
        cardShadow,
        { backgroundColor: colors.cardBackground },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: isDarkMode ? `${item.color}20` : item.bgColor },
        ]}
      >
        {renderIcon()}
      </View>

      <View style={styles.content}>
        <Text style={[typography.statValue, { color: colors.textPrimary }]}>
          {item.value < 10 ? `0${item.value}` : item.value}
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.title}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: RADIUS.xl,
    padding: SPACING.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  content: {
    alignItems: 'center',
  },
});
