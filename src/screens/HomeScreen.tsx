import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchX } from 'lucide-react-native';
import { Header } from '../components/Header';
import { StatisticsSection } from '../components/StatisticsSection';
import { SearchBar } from '../components/SearchBar';
import { CourseCard } from '../components/CourseCard';
import { mockStudent, mockStatistics, mockCourses } from '../data/mockData';
import { ThemeColors } from '../types';
import {
  typography,
  commonStyles,
  SPACING,
} from '../theme';

interface HomeScreenProps {
  colors: ThemeColors;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  colors,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return mockCourses;

    return mockCourses.filter((course) => {
      return (
        course.name.toLowerCase().includes(query) ||
        course.code.toLowerCase().includes(query) ||
        course.instructor.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <SearchX size={44} color={colors.textSecondary} style={styles.emptyIcon} />
      <Text style={[typography.titleSm, styles.emptyTitle, { color: colors.textPrimary }]}>
        Không tìm thấy môn học
      </Text>
    </View>
  );

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <FlatList
        data={filteredCourses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            colors={colors}
            isDarkMode={isDarkMode}
          />
        )}
        ListHeaderComponent={
          <View>
            <Header
              student={mockStudent}
              colors={colors}
              isDarkMode={isDarkMode}
              onToggleDarkMode={onToggleDarkMode}
            />

            <StatisticsSection
              data={mockStatistics}
              colors={colors}
              isDarkMode={isDarkMode}
            />

            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              colors={colors}
              isDarkMode={isDarkMode}
            />

            <View style={styles.courseHeaderRow}>
              <Text style={[typography.titleMd, { color: colors.textPrimary }]}>
                Danh sách môn học ({filteredCourses.length})
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  listContent: {
    paddingBottom: SPACING.xxl,
  },
  courseHeaderRow: {
    ...commonStyles.rowBetween,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md + 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: SPACING.xxl,
  },
  emptyIcon: {
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    marginBottom: SPACING.xs + 2,
  },
});
