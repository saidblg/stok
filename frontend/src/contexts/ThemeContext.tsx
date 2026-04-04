import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import toast from 'react-hot-toast';
import { dashboardApi } from '../api/dashboard.api';
import { useAuth } from './AuthContext';
import { ThemePreference } from '../types';

export type Theme = ThemePreference;

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'karabacak-theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return storedTheme === 'dark' ? 'dark' : 'light';
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const { user, loading, isAuthenticated, setThemePreference } = useAuth();
  const previousSyncedThemeRef = useRef<Theme>(theme);

  useEffect(() => {
    const root = document.documentElement;

    root.classList.remove('theme-light', 'theme-dark');
    root.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
    root.style.colorScheme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (isAuthenticated && user?.themePreference) {
      setTheme(user.themePreference);
      previousSyncedThemeRef.current = user.themePreference;
      return;
    }

    const storedTheme = getInitialTheme();
    setTheme(storedTheme);
    previousSyncedThemeRef.current = storedTheme;
  }, [loading, isAuthenticated, user?.themePreference]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: async () => {
        const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
        const previousTheme = theme;

        setTheme(nextTheme);
        previousSyncedThemeRef.current = nextTheme;

        if (!isAuthenticated) {
          return;
        }

        setThemePreference(nextTheme);

        try {
          const response = await dashboardApi.updateThemePreference(nextTheme);
          previousSyncedThemeRef.current = response.themePreference;
          setTheme(response.themePreference);
          setThemePreference(response.themePreference);
        } catch (error) {
          setTheme(previousTheme);
          setThemePreference(previousTheme);
          previousSyncedThemeRef.current = previousTheme;
          toast.error('Tema tercihi kaydedilemedi');
        }
      },
    }),
    [theme, isAuthenticated, setThemePreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }

  return context;
};
