import { Theme, ThemeColors, ThemeMode, DEFAULT_ACCENT, ACCENT_COLORS } from './types';

// Default primary/accent color (one of the 4 ACCENT_COLORS options)
const DEFAULT_PRIMARY = DEFAULT_ACCENT;

function onPrimaryFor(primaryColor: string): string {
  const match = ACCENT_COLORS.find(
    a => a.value.toLowerCase() === primaryColor.toLowerCase(),
  );
  return match ? match.onColor : '#FFFFFF';
}

// Helper function to create theme colors based on mode and primary color
const createThemeColors = (
  mode: ThemeMode,
  primaryColor: string = DEFAULT_PRIMARY,
): ThemeColors => {
  const isDark = mode === 'dark';

  // Calculate primary variations
  const primaryLight = isDark
    ? lightenColor(primaryColor, 20)
    : darkenColor(primaryColor, 10);
  const primaryDark = isDark
    ? darkenColor(primaryColor, 20)
    : lightenColor(primaryColor, 10);
  const primaryBackground = isDark
    ? `${primaryColor}20` // 20% opacity
    : `${primaryColor}15`; // 15% opacity
  const onPrimary = onPrimaryFor(primaryColor);

  if (isDark) {
    return {
      // Primary colors
      primary: primaryColor,
      primaryLight,
      primaryDark,
      primaryBackground,
      onPrimary,

      // Background colors
      background: '#0E0E12',
      surface: '#1B1B22',
      surface2: '#141418',
      card: '#1B1B22',
      inputBackground: 'rgba(255, 255, 255, 0.05)',

      // Text colors
      text: '#F5F5F7',
      textSecondary: 'rgba(245, 245, 247, 0.55)',
      textTertiary: 'rgba(245, 245, 247, 0.38)',

      // Border colors
      border: 'rgba(255, 255, 255, 0.12)',
      borderLight: 'rgba(255, 255, 255, 0.08)',
      borderDark: 'rgba(255, 255, 255, 0.18)',

      // Status colors
      error: '#FF6B6B',
      errorLight: '#FF8A8A',
      success: '#4ADE80',
      warning: '#FBBF24',
      info: '#4D8AFF',

      // Interactive colors
      placeholder: 'rgba(245, 245, 247, 0.38)',
      disabled: 'rgba(255, 255, 255, 0.12)',
      overlay: 'rgba(0, 0, 0, 0.65)',

      // Special colors
      shadow: '#000000',
    };
  } else {
    return {
      // Primary colors
      primary: primaryColor,
      primaryLight,
      primaryDark,
      primaryBackground,
      onPrimary,

      // Background colors
      background: '#F7F5F1',
      surface: '#FFFFFF',
      surface2: '#ECEAE4',
      card: '#FFFFFF',
      inputBackground: 'rgba(22, 21, 26, 0.045)',

      // Text colors
      text: '#16151A',
      textSecondary: 'rgba(22, 21, 26, 0.55)',
      textTertiary: 'rgba(22, 21, 26, 0.4)',

      // Border colors
      border: 'rgba(22, 21, 26, 0.14)',
      borderLight: 'rgba(22, 21, 26, 0.08)',
      borderDark: 'rgba(22, 21, 26, 0.2)',

      // Status colors
      error: '#D6403F',
      errorLight: '#E36564',
      success: '#16A34A',
      warning: '#D97706',
      info: '#2563EB',

      // Interactive colors
      placeholder: 'rgba(22, 21, 26, 0.4)',
      disabled: 'rgba(22, 21, 26, 0.14)',
      overlay: 'rgba(0, 0, 0, 0.45)',

      // Special colors
      shadow: '#000000',
    };
  }
};

// Helper functions to adjust color brightness
function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const r = (num >> 16) + Math.round((255 - (num >> 16)) * (percent / 100));
  const g =
    ((num >> 8) & 0x00ff) +
    Math.round((255 - ((num >> 8) & 0x00ff)) * (percent / 100));
  const b =
    (num & 0x0000ff) + Math.round((255 - (num & 0x0000ff)) * (percent / 100));
  return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function darkenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.round((num >> 16) * (1 - percent / 100));
  const g = Math.round(((num >> 8) & 0x00ff) * (1 - percent / 100));
  const b = Math.round((num & 0x0000ff) * (1 - percent / 100));
  return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export const lightTheme: Theme = {
  mode: 'light',
  colors: createThemeColors('light'),
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: createThemeColors('dark'),
};

export const createTheme = (mode: ThemeMode, primaryColor?: string): Theme => ({
  mode,
  colors: createThemeColors(mode, primaryColor),
});
