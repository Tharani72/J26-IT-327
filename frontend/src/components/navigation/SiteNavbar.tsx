import { useState } from "react"
import logo from "../../Images/Logo.png"
import { homeTranslations } from "../../features/home/homeTranslations"
import { useHomeLanguage } from "../../i18n/HomeLanguage"

const navigationText = {
  tagline: "\u0dc3\u0d82\u0da5\u0dcf\u0dc0\u0dd9\u0db1\u0dca \u0d89\u0d9c\u0dd9\u0db1\u0dd4\u0db8\u0da7",
  studentName: "\u0d9a\u0dc0\u0dd2\u0dc2\u0dcf",
  grade: "3 \u0dc1\u0dca\u200d\u0dbb\u0dda\u0dab\u0dd2\u0dba",
  profile: "මගේ පැතිකඩ",
  settings: "සැකසුම්",
  logout: "ඉවත් වන්න",
}

type SiteNavbarProps = {
  studentProfile?: boolean
  teacherProfile?: boolean
  studentDisplayName?: string
  studentGrade?: string
  onStudentLogout?: () => void
}

export default function SiteNavbar({
  studentProfile = false,
  teacherProfile = false,
  studentDisplayName,
  studentGrade,
  onStudentLogout,
}: SiteNavbarProps) {
  const isProfileNavbar = studentProfile || teacherProfile
  const [isStudentMenuOpen, setStudentMenuOpen] = useState(false)
  const [isHomeMenuOpen, setHomeMenuOpen] = useState(false)
  const { language, setLanguage } = useHomeLanguage()

  const homeLabels = homeTranslations[language].navbar

  const currentPath = window.location.pathname
  const currentHash = window.location.hash
  const homeNavigationItems = [
    { key: "home", label: homeLabels.home, href: "/", active: currentPath === "/" && !currentHash },
    { key: "about", label: homeLabels.about, href: "/#about", active: currentPath === "/" && currentHash === "#about" },
    { key: "courses", label: homeLabels.courses, href: undefined, active: false },
  ]

  return (
    <header lang={isProfileNavbar ? "si-LK" : language === "si" ? "si-LK" : "en"} className={isProfileNavbar ? "site-nav site-nav--student" : "site-nav site-nav--home"}>
      {isProfileNavbar ? (
        <>
          <div className="site-brand">
            <img className="site-logo" src={logo} alt="OmniSign SL logo" />
            <div className="site-brand-copy">
              <span className="site-name">{teacherProfile ? "OmniSign SL" : "OminiSign SL"}</span>
              <span className="site-tagline">{navigationText.tagline}</span>
            </div>
          </div>

          <div className="student-nav-controls">
            <button className="notification-bell-button" type="button" aria-label={teacherProfile ? "දැනුම්දීම්" : "Notifications"}>
              <svg className="notification-bell-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
                <path d="M12 2v2" />
              </svg>
              <span className="notification-bell-dot" aria-hidden="true" />
            </button>

            <div className="student-account-menu">
              <button
                className="student-account"
                type="button"
                aria-haspopup="menu"
                aria-expanded={isStudentMenuOpen}
                aria-controls="student-profile-menu"
                onClick={() => setStudentMenuOpen((open) => !open)}
              >
                <span className="student-profile-avatar" role="img" aria-label={teacherProfile ? "ගුරු පැතිකඩ රූපය" : "Student avatar"}>
                  {teacherProfile ? (
                    <svg className="student-avatar-art" viewBox="0 0 48 48" aria-hidden="true">
                      <circle cx="24" cy="24" r="23" fill="#e7f4ff" />
                      <path d="M5 48c1-10 8-15 19-15s18 5 19 15H5z" fill="#2452a4" />
                      <path d="M14 34 24 44 34 34l5 14H9z" fill="#ffffff" />
                      <path d="M12 20c-1-10 4-16 12-16s13 6 12 16l-2 10H14z" fill="#342b29" />
                      <path d="M15 19c0-7 3-11 9-11s9 4 9 11v8c0 7-4 11-9 11s-9-4-9-11z" fill="#f2bd9b" />
                      <path d="M13 19c0-10 5-15 12-15 8 0 12 6 11 15-4-1-7-4-9-8-3 4-7 7-14 8z" fill="#342b29" />
                      <path d="M19 25h.1M29 25h.1" stroke="#382923" strokeWidth="2.4" strokeLinecap="round" />
                      <path d="M21 32c2 2 4 2 6 0" fill="none" stroke="#a64c4c" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg className="student-avatar-art" viewBox="0 0 48 48" aria-hidden="true">
                      <circle cx="24" cy="24" r="23" fill="#e7f4ff" />
                      <path d="M7 47c1-9 7-14 17-14s16 5 17 14H7z" fill="#2452a4" />
                      <path d="M11 22c-2-11 4-18 13-18s15 7 13 19l-3 9H14z" fill="#3b2a25" />
                      <circle cx="12.5" cy="23" r="3" fill="#f3bd9c" />
                      <circle cx="35.5" cy="23" r="3" fill="#f3bd9c" />
                      <path d="M13 19c0-8 4-12 11-12s11 4 11 12v7c0 7-5 12-11 12s-11-5-11-12z" fill="#f6c7a6" />
                      <path d="M12 20C11 10 17 4 24 4c8 0 13 6 12 16-3-1-6-4-8-8-3 4-9 7-16 8z" fill="#3b2a25" />
                      <path d="M18 23h.1M30 23h.1" stroke="#382923" strokeWidth="2.8" strokeLinecap="round" />
                      <path d="M21 30c2 2 4 2 6 0" fill="none" stroke="#b85450" strokeWidth="1.7" strokeLinecap="round" />
                    </svg>
                  )}
                </span>
                <span className="student-profile-details">
                  <span className="student-profile-name">{teacherProfile ? "ගුරුවරයා" : studentDisplayName ?? navigationText.studentName}</span>
                  <span className="student-profile-grade">{teacherProfile ? "ගුරු ගිණුම" : studentGrade ?? navigationText.grade}</span>
                </span>
                <svg className="student-chevron-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {isStudentMenuOpen && (
                <div className="student-profile-menu" id="student-profile-menu" role="menu">
                  <button type="button" role="menuitem" onClick={() => setStudentMenuOpen(false)}>{teacherProfile ? "ගුරු පැතිකඩ" : navigationText.profile}</button>
                  <button type="button" role="menuitem" onClick={() => setStudentMenuOpen(false)}>{teacherProfile ? "සැකසුම්" : navigationText.settings}</button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setStudentMenuOpen(false)
                      if (!teacherProfile) onStudentLogout?.()
                    }}
                  >
                    {teacherProfile ? "ඉවත් වන්න" : navigationText.logout}
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="site-brand home-nav-brand">
            <img className="site-logo" src={logo} alt="OmniSign SL logo" />
            <div className="site-brand-copy">
              <span className="site-name">OmniSign SL</span>
              <span className="site-tagline">{homeLabels.tagline}</span>
            </div>
          </div>

          <button
            className="home-nav-toggle"
            type="button"
            aria-label={isHomeMenuOpen ? homeLabels.closeMenu : homeLabels.openMenu}
            aria-expanded={isHomeMenuOpen}
            aria-controls="home-navigation-menu"
            onClick={() => setHomeMenuOpen((open) => !open)}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {isHomeMenuOpen ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>

          <nav
            className={isHomeMenuOpen ? "home-nav-menu is-open" : "home-nav-menu"}
            id="home-navigation-menu"
            aria-label={homeLabels.menu}
          >
            <div className="home-nav-links">
              {homeNavigationItems.map((item) => (
                <a
                  className={item.active ? "home-nav-link is-active" : "home-nav-link"}
                  href={item.href}
                  aria-current={item.active ? "page" : undefined}
                  key={item.key}
                  onClick={() => setHomeMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="home-nav-actions">
              <div className="home-language-selector" role="group" aria-label={homeLabels.language}>
                <button
                  className={language === "si" ? "is-selected" : ""}
                  type="button"
                  aria-pressed={language === "si"}
                  onClick={() => setLanguage("si")}
                >
                  {"\u0dc3\u0dd2\u0d82"}
                </button>
                <span aria-hidden="true">/</span>
                <button
                  className={language === "en" ? "is-selected" : ""}
                  type="button"
                  aria-pressed={language === "en"}
                  onClick={() => setLanguage("en")}
                >
                  EN
                </button>
              </div>

              <a className="home-login-button" href="/login" onClick={() => setHomeMenuOpen(false)}>
                <span>{homeLabels.login}</span>
              </a>
            </div>
          </nav>
        </>
      )}
    </header>
  )
}
