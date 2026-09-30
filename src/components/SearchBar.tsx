import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { ThemeColors } from '../types';
import { typography, getBottomShadow, RADIUS, SPACING } from '../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  colors: ThemeColors;
  isDarkMode?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  colors,
  isDarkMode = false,
}) => {
  const shadow = getBottomShadow('md', isDarkMode);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.searchBox,
          shadow,
          { backgroundColor: isDarkMode ? colors.cardBackground : '#FFFFFF' },
        ]}
      >
        <Search size={18} color={colors.searchPlaceholder} style={styles.searchIcon} />
        <TextInput
          style={[typography.body, styles.input, { color: colors.textPrimary }]}
          placeholder="Tìm kiếm môn học, mã môn..."
          placeholderTextColor={colors.searchPlaceholder}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
        {value.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => onChangeText('')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <View style={[styles.clearIconBg, { backgroundColor: colors.textMuted }]}>
              <X size={12} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: RADIUS.lg + 2,
    paddingHorizontal: SPACING.lg,
  },
  searchIcon: {
    marginRight: SPACING.md,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearIconBg: {
    width: 20,
    height: 20,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
