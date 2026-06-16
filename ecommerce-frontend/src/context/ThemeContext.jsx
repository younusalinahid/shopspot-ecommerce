import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const toastShownRef = useRef(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setIsDark(savedTheme === 'dark');
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDark(prefersDark);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (isLoading) return;

        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark, isLoading]);

    const toggleTheme = () => {
        setIsDark(prev => {
            const newIsDark = !prev;

            if (!toastShownRef.current) {
                toastShownRef.current = true;

                toast.success(newIsDark ? "🌙 Dark Mode ON" : "☀️ Light Mode ON", {
                    position: "top-left",
                    autoClose: 1200,
                });

                setTimeout(() => {
                    toastShownRef.current = false;
                }, 800);
            }

            return newIsDark;
        });
    };

    const setTheme = (theme) => {
        setIsDark(theme === 'dark');
    };

    const value = {
        isDark,
        toggleTheme,
        setTheme,
        isLoading
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};