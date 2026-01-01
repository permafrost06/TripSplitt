import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'auto';

const STORAGE_KEY = 'tripsplitt-theme';

function getSystemTheme(): 'light' | 'dark' {
    if (
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
        return 'dark';
    }
    return 'light';
}

function getStoredTheme(): Theme {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'auto') {
            return stored;
        }
    }
    return 'auto';
}

function applyTheme(theme: Theme) {
    const root = document.documentElement;
    const effectiveTheme = theme === 'auto' ? getSystemTheme() : theme;

    if (effectiveTheme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
}

export function useTheme() {
    const [theme, setThemeState] = useState<Theme>(getStoredTheme);

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem(STORAGE_KEY, newTheme);
        applyTheme(newTheme);
    }, []);

    const cycleTheme = useCallback(() => {
        const themes: Theme[] = ['light', 'dark', 'auto'];
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
    }, [theme, setTheme]);

    // Apply theme on mount and when system preference changes
    useEffect(() => {
        applyTheme(theme);

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'auto') {
                applyTheme('auto');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    return { theme, setTheme, cycleTheme };
}
