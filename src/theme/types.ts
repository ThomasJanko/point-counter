export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryBackground: string; // Background with primary tint

  // Background colors
  background: string;
  surface: string;
  card: string;

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

