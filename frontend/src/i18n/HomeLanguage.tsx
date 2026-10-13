import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export type HomeLanguage = "si" | "en"

type HomeLanguageContextValue = {
  language: HomeLanguage
  setLanguage: (language: HomeLanguage) => void
}

const HomeLanguageContext = createContext<HomeLanguageContextValue>({
  language: "si",
  setLanguage: () => undefined,
})

const LANGUAGE_STORAGE_KEY = "omnisign-home-language"

export function HomeLanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<HomeLanguage>(() => {
    try {
      return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) === "en" ? "en" : "si"
    } catch {
      return "si"
    }
  })

  const setLanguage = (nextLanguage: HomeLanguage) => {
    setLanguageState(nextLanguage)
  }

  useEffect(() => {
    document.documentElement.lang = language === "si" ? "si-LK" : "en"
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    } catch {
      // Keep the selected language for this session when storage is unavailable.
    }
  }, [language])

  return (
    <HomeLanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </HomeLanguageContext.Provider>
  )
}

export function useHomeLanguage() {
  return useContext(HomeLanguageContext)
}
