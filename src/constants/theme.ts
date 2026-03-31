import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const COLORS = {
  background: '#0A0A0F',
  surface: '#13131A',
  surfaceLight: '#1C1C28',

  cyan: '#00E5FF',
  cyanDim: 'rgba(0, 229, 255, 0.15)',
  cyanGlow: 'rgba(0, 229, 255, 0.4)',
  violet: '#7C4DFF',
  violetDim: 'rgba(124, 77, 255, 0.15)',
  magenta: '#E040FB',

  success: '#00E676',
  warning: '#FFD740',
  error: '#FF5252',

  glass: 'rgba(255, 255, 255, 0.06)',
  glassBorder: 'rgba(255, 255, 255, 0.10)',
  glassLight: 'rgba(255, 255, 255, 0.12)',

  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textTertiary: 'rgba(255, 255, 255, 0.4)',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const FONT = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  sizes: {
    caption: 11,
    small: 13,
    body: 15,
    subtitle: 17,
    title: 22,
    headline: 28,
  },
} as const;

export const LAYOUT = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  isAndroid: Platform.OS === 'android',
} as const;

export const DETECTION_COLORS = [
  '#00E5FF',
  '#7C4DFF',
  '#E040FB',
  '#00E676',
  '#FFD740',
  '#FF6E40',
  '#448AFF',
  '#69F0AE',
] as const;
