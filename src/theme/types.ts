export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  // Primary / accent colors (user-selectable, see ACCENT_COLORS)
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryBackground: string; // Background with primary tint
  /** Text/icon color to use on top of a primary-filled surface (contrast varies per accent). */
  onPrimary: string;

  // Background colors
  background: string;
  surface: string;
  surface2: string;
  card: string;
  /** Subtle input fill, distinct from surface2 (matches --inputBg in the reference prototype). */
  inputBackground: string;

  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;

  // Border colors
  border: string;
  borderLight: string;
  borderDark: string;

  // Status colors
  error: string;
  errorLight: string;
  success: string;
  warning: string;
  info: string;

  // Interactive colors
  placeholder: string;
  disabled: string;
  overlay: string;

  // Special colors
  shadow: string;
}

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
}

// The 4 user-selectable accent colors ("Accent (choix utilisateur, 4 options)").
// `onColor` is the fixed contrast text/icon color used on top of a
// button/surface filled with this accent (matches the Tablée prototype,
// which uses white text on violet/rose but dark text on the brighter
// sarcelle/or since those don't have enough contrast with white).
export interface AccentOption {
  key: string;
  label: string;
  value: string;
  onColor: string;
}

export const ACCENT_COLORS: AccentOption[] = [
  { key: 'violet', label: 'Violet', value: '#6E56FF', onColor: '#FFFFFF' },
  { key: 'rose', label: 'Rose', value: '#FF4D82', onColor: '#FFFFFF' },
  { key: 'sarcelle', label: 'Sarcelle', value: '#17D9B4', onColor: '#06251F' },
  { key: 'or', label: 'Or', value: '#FFC53D', onColor: '#3A2600' },
];

export const DEFAULT_ACCENT = ACCENT_COLORS[0].value;

// Fixed, cycled palette used to suggest a default color for each new player.
export const PLAYER_COLOR_PALETTE: string[] = [
  '#6E56FF',
  '#FF4D82',
  '#17D9B4',
  '#FFC53D',
  '#4D8AFF',
  '#FF8A3D',
  '#4ADE80',
  '#B565FF',
];

// Font families (loaded as native fonts via android/app/src/main/assets/fonts).
export const FONTS = {
  titleBold: 'Sora-Bold',
  titleExtraBold: 'Sora-ExtraBold',
  bodyRegular: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  bodySemiBold: 'Inter-SemiBold',
  bodyBold: 'Inter-Bold',
};

// Shared style fragment for numeric displays (scores, totals) so digits
// don't shift width as they change.
export const tabularNums: { fontVariant: import('react-native').TextStyle['fontVariant'] } = {
  fontVariant: ['tabular-nums'],
};
