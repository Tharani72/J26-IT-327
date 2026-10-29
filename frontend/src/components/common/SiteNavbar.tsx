import { useState } from "react"

const logo = "/logo.png"

const navigationText = {
  tagline: "සංඥාවෙන් ඉගෙනුමට",
  studentName: "කවිසා",
  grade: "3 ශ්‍රේණිය",
  profile: "ගිණුම් පැතිකඩ",
  settings: "සැකසුම්",
  logout: "ඉවත් වන්න",
}

const navbarTranslations = {
  si: {
    tagline: "සංඥාවෙන් ඉගෙනුමට",
    home: "මුල් පිටුව",
    about: "අප ගැන",
    courses: "පාඩම්",
    login: "ඇතුල් වන්න",
    openMenu: "මෙනුව විවෘත කරන්න",
    closeMenu: "මෙනුව වසන්න",
    language: "භාෂාව",
    menu: "මෙනුව",
  },
  en: {
    tagline: "Learning through Signs",
    home: "Home",
    about: "About",
    courses: "Courses",
    login: "Login",
    openMenu: "Open Menu",
    closeMenu: "Close Menu",
    language: "Language",
    menu: "Menu",
  }
}

type SiteNavbarProps = {
  studentProfile?: boolean
  teacherProfile?: boolean
}

export default function SiteNavbar({ studentProfile = false, teacherProfile = false }: SiteNavbarProps) {
  const isProfileNavbar = studentProfile || teacherProfile
  const [isStudentMenuOpen, setStudentMenuOpen] = useState(false)
  const [isHomeMenuOpen, setHomeMenuOpen] = useState(false)
  const [language, setLanguage] = useState<"si" | "en">("si")

  const homeLabels = navbarTranslations[language]

  const currentPath = window.location.pathname
  const currentHash = window.location.hash
  const homeNavigationItems = [
    { key: "home", label: homeLabels.home, href: "/", active: currentPath === "/" && !currentHash },
    { key: "about", label: homeLabels.about, href: "/#about", active: currentPath === "/" && currentHash === "#about" },
    { key: "courses", label: homeLabels.courses, href: undefined, active: false },
  ]

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 32px',
      background: '#ffffff',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 5000,
      width: '100%',
      boxSizing: 'border-box',
      fontFamily: 'Arial, sans-serif'
    }}>
      {isProfileNavbar ? (
        <>
          {/* 1. Left Side: Logo & Brand (වම් පැත්ත) */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={logo} alt="OmniSign SL logo" style={{ height: '40px' }} onError={(e) => e.currentTarget.style.display = 'none'} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>
                {teacherProfile ? "OmniSign SL" : "OmniSign SL"}
              </span>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>
                {navigationText.tagline}
              </span>
            </div>
          </div>

          {/* 2. Middle Side: Navigation Menu (අලුතින් එකතු කළ මැද කොටස) */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '32px' }}>
            <a href="/" style={{ textDecoration: 'none', color: '#2563eb', fontWeight: 'bold', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🏠</span> මුල් පිටුව
            </a>
            <a href="/progress" style={{ textDecoration: 'none', color: '#64748b', fontWeight: 'bold', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>📈</span> මගේ ප්‍රගතිය
            </a>
            <a href="/games" style={{ textDecoration: 'none', color: '#64748b', fontWeight: 'bold', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🎮</span> ක්‍රීඩා
            </a>
          </div>

          {/* 3. Right Side: Controls & Profile (දකුණු පැත්ත) */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px' }}>
            
            {/* Language Selector (භාෂාව තේරීම - Optional) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>
               <span>🌐</span> සිංහල
            </div>

            {/* Notification Bell */}
            <button style={{
              background: '#f8fafc', border: '1px solid #e2e8f0', width: '42px', height: '42px',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative'
            }}>
              <svg style={{ width: '20px', height: '20px', stroke: '#475569', strokeWidth: 2 }} viewBox="0 0 24 24" fill="none">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
                <path d="M12 2v2" />
              </svg>
              <span style={{ position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid #f8fafc' }} />
            </button>

            {/* Profile Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setStudentMenuOpen(!isStudentMenuOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', background: '#ffffff',
                  border: '1px solid #e2e8f0', padding: '6px 16px 6px 6px', borderRadius: '30px',
                  cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                <span style={{ width: '36px', height: '36px', display: 'inline-block' }}>
                  {teacherProfile ? (
                    <svg viewBox="0 0 48 48">
                      <circle cx="24" cy="24" r="23" fill="#e7f4ff" />
                      <path d="M5 48c1-10 8-15 19-15s18 5 19 15H5z" fill="#2452a4" />
                      <path d="M14 34 24 44 34 34l5 14H9z" fill="#ffffff" />
                      <path d="M12 20c-1-10 4-16 12-16s13 6 12 16l-2 10H14z" fill="#342b29" />
                      <path d="M15 19c0-7 3-11 9-11s9 4 9 11v8c0 7-4 11-9 11s-9-4-9-11z" fill="#f2bd9b" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 48 48">
                      <circle cx="24" cy="24" r="23" fill="#e7f4ff" />
                      <path d="M7 47c1-9 7-14 17-14s16 5 17 14H7z" fill="#2452a4" />
                      <path d="M11 22c-2-11 4-18 13-18s15 7 13 19l-3 9H14z" fill="#3b2a25" />
                      <path d="M13 19c0-8 4-12 11-12s11 4 11 12v7c0 7-5 12-11 12s-11-5-11-12z" fill="#f6c7a6" />
                    </svg>
                  )}
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>{teacherProfile ? "ගුරුවරයා" : navigationText.studentName}</span>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>{teacherProfile ? "ගුරු මණ්ඩලය" : navigationText.grade}</span>
                </span>
                <svg style={{ width: '16px', height: '16px', stroke: '#94a3b8', strokeWidth: 2 }} viewBox="0 0 24 24" fill="none">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isStudentMenuOpen && (
                <div style={{
                  position: 'absolute', top: '55px', right: 0, background: '#ffffff',
                  border: '1px solid #e2e8f0', borderRadius: '12px', padding: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', minWidth: '150px'
                }}>
                  <button style={{ padding: '10px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', color: '#334155' }} onClick={() => setStudentMenuOpen(false)}>{teacherProfile ? "ගුරුවරයාගේ පැතිකඩ" : navigationText.profile}</button>
                  <button style={{ padding: '10px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', color: '#334155' }} onClick={() => setStudentMenuOpen(false)}>{teacherProfile ? "සැකසුම්" : navigationText.settings}</button>
                  <button style={{ padding: '10px', background: '#fee2e2', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', color: '#b91c1c', borderRadius: '6px' }} onClick={() => setStudentMenuOpen(false)}>{teacherProfile ? "ඉවත් වන්න" : navigationText.logout}</button>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        // ... (පහළ තියෙන Home Navigation කේතය වෙනසක් නොකර එලෙසම තබන්න)
        // Home Navigation (For Guests)
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={logo} alt="OmniSign SL logo" style={{ height: '40px' }} />
            <span style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>OmniSign SL</span>
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {homeNavigationItems.map((item) => (
              <a key={item.key} href={item.href} style={{ textDecoration: 'none', color: item.active ? '#2563eb' : '#475569', fontWeight: 'bold', fontSize: '14px' }}>
                {item.label}
              </a>
            ))}
            <a href="/login" style={{ background: '#2563eb', color: '#fff', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
              {homeLabels.login}
            </a>
          </div>
        </div>
      )}
    </header>
  )
}