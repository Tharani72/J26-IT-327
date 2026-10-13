import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from "react";
const HomeLanguageContext = createContext({
    language: "si",
    setLanguage: () => undefined,
});
const LANGUAGE_STORAGE_KEY = "omnisign-home-language";
export function HomeLanguageProvider({ children }) {
    const [language, setLanguageState] = useState(() => {
        try {
            return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) === "en" ? "en" : "si";
        }
        catch {
            return "si";
        }
    });
    const setLanguage = (nextLanguage) => {
        setLanguageState(nextLanguage);
    };
    useEffect(() => {
        document.documentElement.lang = language === "si" ? "si-LK" : "en";
        try {
            window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
        }
        catch {
            // Keep the selected language for this session when storage is unavailable.
        }
    }, [language]);
    return (_jsx(HomeLanguageContext.Provider, { value: { language, setLanguage }, children: children }));
}
export function useHomeLanguage() {
    return useContext(HomeLanguageContext);
}
