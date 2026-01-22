import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';

export const ThemeToggle: React.FC = () => {
    const { theme, setTheme } = useSettingsStore();
    const isDark = theme === 'dark';

    const toggleTheme = () => {
        const newTheme = isDark ? 'light' : 'dark';
        setTheme(newTheme);

        // Update DOM
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    return (
        <button
            onClick={toggleTheme}
            className={`
                relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500
                ${isDark ? 'bg-slate-700' : 'bg-slate-300'}
            `}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
            <div
                className={`
                    absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center
                    ${isDark ? 'translate-x-6' : 'translate-x-0'}
                `}
            >
                {isDark ? (
                    <Moon size={14} className="text-indigo-500" />
                ) : (
                    <Sun size={14} className="text-amber-500" />
                )}
            </div>
        </button>
    );
};
