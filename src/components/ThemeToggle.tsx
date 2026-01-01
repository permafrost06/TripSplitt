import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
    const { theme, cycleTheme } = useTheme();

    const icons = {
        light: Sun,
        dark: Moon,
        auto: Monitor,
    };

    const labels = {
        light: 'Light',
        dark: 'Dark',
        auto: 'Auto',
    };

    const Icon = icons[theme];

    return (
        <Button variant="ghost" size="icon" onClick={cycleTheme} title={labels[theme]}>
            <Icon className="w-5 h-5" />
        </Button>
    );
}
