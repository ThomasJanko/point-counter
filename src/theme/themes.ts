import { Theme, ThemeColors, ThemeMode } from './types';

// Default primary color (can be customized)
const DEFAULT_PRIMARY = '#8b5cf6';

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

  if (isDark) {
    return {
      // Primary colors
      primary: primaryColor,
      primaryLight,
      primaryDark,
      primaryBackground,

      // Background colors
      background: '#1a1a1a',
      surface: '#2a2a2a',
      card: '#2a2a2a',

      // Text colors
      text: '#ffffff',
      textSecondary: '#a0a0a0',
      textTertiary: '#666666',

      // Border colors
      border: '#3a3a3a',
      borderLight: '#4a4a4a',
      borderDark: '#2a2a2a',

      // Status colors
      error: '#ef4444',
      errorLight: '#ff6b6b',
      success: '#4ade80',
      warning: '#fbbf24',
      info: '#3b82f6',

      // Interactive colors
      placeholder: '#666666',
      disabled: '#4a4a4a',
      overlay: 'rgba(0, 0, 0, 0.5)',

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

      // Background colors
      background: '#ffffff',
      surface: '#f5f5f5',
      card: '#ffffff',

      // Text colors
      text: '#1a1a1a',
      textSecondary: '#666666',
      textTertiary: '#999999',

      // Border colors
      border: '#e0e0e0',
      borderLight: '#f0f0f0',
      borderDark: '#d0d0d0',

      // Status colors
      error: '#dc2626',
      errorLight: '#ef4444',
      success: '#16a34a',
      warning: '#d97706',
      info: '#2563eb',

      // Interactive colors
      placeholder: '#999999',
      disabled: '#cccccc',
      overlay: 'rgba(0, 0, 0, 0.3)',

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

// Create theme function
export const createTheme = (mode: ThemeMode, primaryColor?: string): Theme => ({
  mode,
  colors: createThemeColors(mode, primaryColor),
});

// Default themes
export const darkTheme = createTheme('dark', DEFAULT_PRIMARY);
export const lightTheme = createTheme('light', DEFAULT_PRIMARY);
