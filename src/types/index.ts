export interface StudentProfile {
  name: string;
  studentId: string;
  greeting: string;
}

export type StatIconType = 'book-open' | 'clipboard-list' | 'trophy';

export interface StatisticItem {
  id: string;
  title: string;
  value: number;
  icon: StatIconType;
  color: string;
  bgColor: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  instructor: string;
  totalLessons: number;
  completedLessons: number;
  credits: number;
  thumbnail: string;
  room: string;
}

export interface ThemeColors {
  background: string;
  cardBackground: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  info: string;
  infoLight: string;
  searchBg: string;
  searchPlaceholder: string;
  progressTrack: string;
  bottomNavBg: string;
  bottomNavBorder: string;
  badgeBg: string;
  statusCompletedBg: string;
  statusCompletedText: string;
}
