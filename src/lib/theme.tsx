import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { Appearance, useColorScheme as useRNColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'bullion-theme';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
  colors: ThemeColors;
}

interface ThemeColors {
  background: string;
  card: string;
  elevated: string;
  gold: string;
  goldLight: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  borderSubtle: string;
  border: string;
}

const lightColors: ThemeColors = {
  background: '#F5F5F5',
  card: '#FFFFFF',
  elevated: '#F0F0F0',
  gold: '#B8860B',
  goldLight: '#D4A012',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  borderSubtle: '#E5E7EB',
  border: '#D1D5DB',
};

const darkColors: ThemeColors = {
  background: '#0F0F0F',
  card: '#1A1A1A',
  elevated: '#242424',
  gold: '#D4A012',
  goldLight: '#F5B832',
  textPrimary: '#F0F0F0',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  borderSubtle: '#2D2D2D',
  border: '#3D3D3D',
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useRNColorScheme();
  const [theme, setThemeState] = useState<Theme>('system');
  const [loaded, setLoaded] = useState(false);

  // Load saved theme preference
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setThemeState(stored);
      }
      setLoaded(true);
    });
  }, []);

  const resolvedTheme: ResolvedTheme =
    theme === 'system' ? (systemColorScheme ?? 'light') : theme;

  const isDark = resolvedTheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  // Sync NativeWind dark: classes with our theme state
  useEffect(() => {
    if (theme === 'system') {
      Appearance.setColorScheme(null);
    } else {
      Appearance.setColorScheme(theme);
    }
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    AsyncStorage.setItem(STORAGE_KEY, newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }, [resolvedTheme, setTheme]);

  if (!loaded) return null;

  return (
    <ThemeContext.Provider
      value={{ theme, resolvedTheme, setTheme, toggleTheme, isDark, colors }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
