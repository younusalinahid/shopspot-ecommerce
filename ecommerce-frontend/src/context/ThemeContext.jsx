import React, { createContext, useContext, useState, useEffect } from 'react';
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
        if (!isLoading) {
            localStorage.setItem('theme', isDark ? 'dark' : 'light');

            if (isDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }, [isDark, isLoading]);

    const toggleTheme = () => {
        setIsDark(prev => {
            const newTheme = !prev;
            toast.success(`🌗 ${newTheme ? "Dark mode is ON" : "Light mode is ON"}`);
            return newTheme;
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