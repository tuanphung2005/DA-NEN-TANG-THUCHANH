import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import {
  GraduationCap,
  BookOpen,
  MapPin,
} from 'lucide-react-native';
import { Course, ThemeColors } from '../types';
import {
  SUBJECT_COLORS,
  typography,
  commonStyles,
  getBottomShadow,
  RADIUS,
  SPACING,
} from '../theme';

interface CourseCardProps {
  course: Course;
  colors: ThemeColors;
  isDarkMode: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  colors,
  isDarkMode,
}) => {
  const [imageError, setImageError] = useState(false);
  const progressPercent = Math.round(
    (course.completedLessons / course.totalLessons) * 100
  );
  const isCompleted = progressPercent >= 100;
  const subjectColor = isCompleted ? SUBJECT_COLORS.completed : SUBJECT_COLORS.inProgress;

  const cardShadow = getBottomShadow('lg', isDarkMode);

  return (
    <View
      style={[
        commonStyles.card,
        cardShadow,
        styles.card,
        { backgroundColor: colors.cardBackground },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.thumbnailContainer}>
          {imageError ? (
            <View
              style={[
                styles.iconPlaceholder,
                { backgroundColor: isDarkMode ? `${subjectColor}20` : `${subjectColor}15` },
              ]}
            >
              <BookOpen size={28} color={subjectColor} />
            </View>
          ) : (
            <Image
              source={{ uri: course.thumbnail }}
              style={styles.thumbnail}
              onError={() => setImageError(true)}
            />
          )}
        </View>

        <View style={styles.courseInfo}>
          <Text style={[typography.caption, styles.codeText, { color: colors.textSecondary, fontWeight: '700' }]}>
            {course.code}
          </Text>

          <Text
            style={[typography.titleSm, styles.courseName, { color: colors.textPrimary }]}
            numberOfLines={2}
          >
            {course.name}
          </Text>

          <View style={commonStyles.rowCenter}>
            <GraduationCap size={13} color={colors.textSecondary} style={styles.inlineIcon} />
            <Text style={[typography.bodySm, { color: colors.textSecondary }]}>
              {course.instructor}
            </Text>
          </View>

          {course.room ? (
            <View style={[commonStyles.rowCenter, styles.roomRow]}>
              <MapPin size={13} color={colors.textSecondary} style={styles.inlineIcon} />
              <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>
                {course.room}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.bottomSection}>
        <View style={commonStyles.rowBetween}>
          <View style={commonStyles.rowCenter}>
            <BookOpen size={13} color={colors.textSecondary} style={styles.inlineIcon} />
            <Text style={[typography.bodySm, { color: colors.textSecondary }]}>
              {course.completedLessons}/{course.totalLessons} bài học ({course.credits} tín chỉ)
            </Text>
          </View>

          <Text style={[typography.caption, { color: subjectColor, fontWeight: '700' }]}>
            {progressPercent}%
          </Text>
        </View>

        <View
          style={[
            commonStyles.progressTrack,
            styles.progressTrackWrapper,
            { backgroundColor: colors.progressTrack },
          ]}
        >
          <View
            style={[
              commonStyles.progressBar,
              {
                width: `${progressPercent}%`,
                backgroundColor: subjectColor,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.lg - 2,
  },
  topRow: {
    flexDirection: 'row',
  },
  thumbnailContainer: {
    marginRight: SPACING.lg - 2,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
  },
  iconPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  codeText: {
    marginBottom: SPACING.xs,
  },
  courseName: {
    marginBottom: SPACING.xs,
  },
  inlineIcon: {
    marginRight: SPACING.xs + 1,
  },
  roomRow: {
    marginTop: 3,
  },
  bottomSection: {
    marginTop: SPACING.lg - 2,
  },
  progressTrackWrapper: {
    marginTop: SPACING.sm,
  },
});
