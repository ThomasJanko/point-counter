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
import { storageService } from '../services/storageService';

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
  const [isLoaded, setIsLoaded] = useState(false);

  // Load theme preferences from storage on mount
  useEffect(() => {
    const loadThemePreferences = async () => {
      try {
        const [savedMode, savedPrimaryColor] = await Promise.all([
          storageService.getThemeMode(),
          storageService.getThemePrimaryColor(),
        ]);

        if (savedMode !== null) {
          setModePreference(savedMode as ThemeMode | 'auto');
        }
        if (savedPrimaryColor !== null) {
          setPrimaryColor(savedPrimaryColor);
        }
      } catch (error) {
        console.error('Error loading theme preferences:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadThemePreferences();
  }, []);

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
    storageService.saveThemeMode(mode).catch(error => {
      console.error('Error saving theme mode:', error);
    });
  };

  const setPrimaryColorWithSave = (color: string) => {
    setPrimaryColor(color);
    storageService.saveThemePrimaryColor(color).catch(error => {
      console.error('Error saving theme primary color:', error);
    });
  };

  const toggleMode = () => {
    const newMode =
      modePreference === 'auto'
        ? systemColorScheme === 'dark'
          ? 'light'
          : 'dark'
        : modePreference === 'dark'
        ? 'light'
        : 'dark';
    setModePreference(newMode);
    storageService.saveThemeMode(newMode).catch(error => {
      console.error('Error saving theme mode:', error);
    });
  };

  const value: ThemeContextType = {
    theme,
    mode: actualMode,
    primaryColor,
    setMode,
    setPrimaryColor: setPrimaryColorWithSave,
    toggleMode,
  };

  // Don't render until theme is loaded to avoid flash
  if (!isLoaded) {
    return null;
  }

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
