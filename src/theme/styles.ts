import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  card: 20,
  round: 999,
};

export const getBottomShadow = (
  level: 'sm' | 'md' | 'lg',
  isDarkMode = false
): ViewStyle => {
  const configs = {
    sm: {
      height: 2,
      opacity: isDarkMode ? 0.25 : 0.06,
      elevation: 2,
    },
    md: {
      height: 3,
      opacity: isDarkMode ? 0.3 : 0.06,
      elevation: 3,
    },
    lg: {
      height: 4,
      opacity: isDarkMode ? 0.35 : 0.06,
      elevation: 4,
    },
  };

  const config = configs[level];

  return {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: config.height },
    shadowOpacity: config.opacity,
    shadowRadius: 0,
    elevation: config.elevation,
  };
};

export const typography = StyleSheet.create({
  titleLg: {
    fontSize: 19,
    fontWeight: '800',
  },
  titleMd: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  titleSm: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  body: {
    fontSize: 14,
    fontWeight: '500',
  },
  bodySm: {
    fontSize: 12,
    fontWeight: '500',
  },
  caption: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
});

export const commonStyles = StyleSheet.create({
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  horizontalPadding: {
    paddingHorizontal: SPACING.xl,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: RADIUS.card,
    padding: SPACING.lg,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
});
