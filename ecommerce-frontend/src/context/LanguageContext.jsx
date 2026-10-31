import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import translations from '../i18n/translations';

const LanguageContext = createContext({lang: 'en', setLang: () => {}, t: (k) => k});

const STORAGE_KEY = 'lang';

const readLang = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved === 'bn' || saved === 'en' ? saved : 'en';
    } catch {
        return 'en';
    }
};

/**
 * Site language (English / Bangla). t('key', {count: 3}) returns the text for the
 * current language, falls back to English, and fills {placeholders}.
 */
export function LanguageProvider({children}) {
    const [lang, setLangState] = useState(readLang);

    useEffect(() => {
        document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch { /* private mode */ }
    }, [lang]);

    const setLang = useCallback((next) => setLangState(next === 'bn' ? 'bn' : 'en'), []);

    const t = useCallback((key, vars) => {
        let text = translations[lang]?.[key] ?? translations.en[key] ?? key;
        if (vars) {
            Object.entries(vars).forEach(([k, v]) => {
                text = text.split(`{${k}}`).join(String(v));
            });
        }
        return text;
    }, [lang]);

    const value = useMemo(() => ({lang, setLang, t}), [lang, setLang, t]);
    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
