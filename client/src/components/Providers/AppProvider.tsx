import { useEffect, type ReactNode } from 'react';
import useStore from '@/store';
import { env } from '@/lib/utils';
import { ToastProvider } from '@/components/ui';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const isDarkMode = useStore((s) => s.isDarkMode)
  const setTheme = useStore((s) => s.setTheme)

  // Sync dark class to <html> whenever isDarkMode changes
  useEffect(() => {
    /* istanbul ignore next */
    if (typeof window === 'undefined') return

    document.documentElement.classList.toggle('dark-mode', isDarkMode)
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  // Listen for OS theme changes when "system" is selected
  useEffect(() => {
    const mediaQuery = env.matchMedia('(prefers-color-scheme: dark)')

    const handleSystemThemeChange = () => {
      if (useStore.getState().theme === 'system') {
        setTheme('system')
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [setTheme])

  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
}


