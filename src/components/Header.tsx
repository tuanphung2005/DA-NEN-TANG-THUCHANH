import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Bell, Sun, Moon, User } from 'lucide-react-native';
import { StudentProfile, ThemeColors } from '../types';
import { getBottomShadow, SPACING, RADIUS } from '../theme';

interface HeaderProps {
  student: StudentProfile;
  colors: ThemeColors;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  student,
  colors,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const avatarShadow = getBottomShadow('sm', isDarkMode);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.leftSection}>
        <View
          style={[
            styles.avatarCircle,
            avatarShadow,
            { backgroundColor: colors.primaryLight },
          ]}
        >
          <User size={22} color={colors.primary} />
        </View>

        <View style={styles.infoWrapper}>
          <Text style={[styles.greetingText, { color: colors.textSecondary }]}>
            {student.greeting},
          </Text>
          <Text
            style={[styles.nameText, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {student.name}
          </Text>
          <Text style={[styles.idText, { color: colors.textSecondary }]}>
            MSV: {student.studentId}
          </Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.actionIcon}
          onPress={onToggleDarkMode}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {isDarkMode ? (
            <Sun size={21} color={colors.warning} />
          ) : (
            <Moon size={21} color={colors.textPrimary} />
          )}
        </TouchableOpacity>

        <View style={styles.actionIcon}>
          <Bell size={21} color={colors.textPrimary} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.md,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoWrapper: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  greetingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  nameText: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginVertical: 1,
  },
  idText: {
    fontSize: 11,
    fontWeight: '600',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md + 2,
  },
  actionIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
