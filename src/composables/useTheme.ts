import { ref } from 'vue';

type ThemeMode = 'dark' | 'light';

const STORAGE_KEY = 'ticketmanager-theme';
const theme = ref<ThemeMode>('dark');
let initialized = false;

const applyThemeToBody = (mode: ThemeMode) => {
  if (typeof document === 'undefined') return;

  document.body.classList.remove('theme-dark', 'theme-light');
  document.body.classList.add(mode === 'dark' ? 'theme-dark' : 'theme-light');
  document.documentElement.style.colorScheme = mode;
};

export const initTheme = () => {
  if (initialized) {
    applyThemeToBody(theme.value);
    return;
  }

  if (typeof window !== 'undefined') {
    const saved = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (saved === 'dark' || saved === 'light') {
      theme.value = saved;
    }
  }

  applyThemeToBody(theme.value);
  initialized = true;
};

export const useTheme = () => {
  const setTheme = (mode: ThemeMode) => {
    theme.value = mode;
    applyThemeToBody(mode);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, mode);
    }
  };

  const toggleTheme = () => {
    setTheme(theme.value === 'dark' ? 'light' : 'dark');
  };

  return {
    theme,
    setTheme,
    toggleTheme,
  };
};
