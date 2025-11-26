import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import { Theme, ThemeMode } from './types';
import { createTheme } from './themes';

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  primaryColor: string;
  setMode: (mode: ThemeMode) => void;
  setPrimaryColor: (color: string) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialPrimaryColor?: string;
  initialMode?: ThemeMode | 'auto';
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialPrimaryColor = '#8b5cf6',
  initialMode = 'auto',
}) => {
  const systemColorScheme = useColorScheme();
  const [primaryColor, setPrimaryColor] = useState<string>(initialPrimaryColor);
  const [modePreference, setModePreference] = useState<ThemeMode | 'auto'>(
    initialMode,
  );

  // Determine actual theme mode
  const actualMode: ThemeMode =
    modePreference === 'auto'
      ? systemColorScheme === 'dark'
        ? 'dark'
        : 'light'
      : modePreference;

  // Create theme based on mode and primary color
  const theme = createTheme(actualMode, primaryColor);

  // Update theme when system color scheme changes (if in auto mode)
  useEffect(() => {
    if (modePreference === 'auto') {
      // Theme will automatically update via actualMode calculation
    }
  }, [systemColorScheme, modePreference]);

  const setMode = (mode: ThemeMode | 'auto') => {
    setModePreference(mode);
  };

  const toggleMode = () => {
    if (modePreference === 'auto') {
      setModePreference(systemColorScheme === 'dark' ? 'light' : 'dark');
    } else {
      setModePreference(modePreference === 'dark' ? 'light' : 'dark');
    }
  };

  const value: ThemeContextType = {
    theme,
    mode: actualMode,
    primaryColor,
    setMode,
    setPrimaryColor,
    toggleMode,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
