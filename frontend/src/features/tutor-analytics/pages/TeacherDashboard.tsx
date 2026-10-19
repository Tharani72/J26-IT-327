import SiteNavbar from "../../../components/navigation/SiteNavbar"
import "./TeacherDashboard.css"
import TeacherStudentList from "./TeacherStudentList"

type TeacherNavigationId = "dashboard" | "students" | "lessons" | "progress" | "attention" | "reports" | "settings"

type TeacherNavigationItem = {
  id: TeacherNavigationId
  label: string
}

type TeacherSummaryId = "students" | "lessons" | "accuracy" | "attention"
type TeacherSummaryTone = "blue" | "green" | "orange"

type TeacherSummaryCard = {
  id: TeacherSummaryId
  title: string
  value: string
  description: string
  tone: TeacherSummaryTone
}

const teacherNavigationItems: TeacherNavigationItem[] = [
  { id: "dashboard", label: "ගුරු උපකරණ පුවරුව" },
  { id: "students", label: "මගේ සිසුන්" },
  { id: "lessons", label: "පාඩම් කළමනාකරණය" },
  { id: "progress", label: "ඉගෙනුම් ප්‍රගතිය" },
  { id: "attention", label: "අවධානය සහ සහභාගීත්වය" },
  { id: "reports", label: "වාර්තා" },
  { id: "settings", label: "සැකසුම්" },
]

const teacherSummaryCards: TeacherSummaryCard[] = [
  { id: "students", title: "මුළු සිසුන්", value: "24", description: "අද සමඟ ඉගෙනුම ලබන සිසුන්", tone: "blue" },
  { id: "lessons", title: "අද පාඩම් සම්පූර්ණ කළ", value: "18", description: "අද දිනයේ සම්පූර්ණ කළ පාඩම්", tone: "green" },
  { id: "accuracy", title: "සාමාන්‍ය නිවැරදිභාවය", value: "86%", description: "සියලු සිසුන්ගේ සාමාන්‍ය අගය", tone: "blue" },
  { id: "attention", title: "අවධානය අවශ්‍ය සිසුන්", value: "3", description: "දැනට අවධානය අවශ්‍ය සිසුන්", tone: "orange" },
]


const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const

function TeacherNavigationIcon({ name }: { name: TeacherNavigationId }) {
  switch (name) {
    case "dashboard":
      return <svg {...iconProps}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
    case "students":
      return <svg {...iconProps}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 5a3.5 3.5 0 0 1 0 6.8M17 14a6 6 0 0 1 4.5 5.8" /></svg>
    case "lessons":
      return <svg {...iconProps}><path d="M12 7v14M3 5.5A2.5 2.5 0 0 1 5.5 3H12v18H5.5A2.5 2.5 0 0 1 3 18.5zM21 5.5A2.5 2.5 0 0 0 18.5 3H12v18h6.5a2.5 2.5 0 0 0 2.5-2.5z" /></svg>
    case "progress":
      return <svg {...iconProps}><path d="M3.5 20.5V4M3.5 20.5h17" /><path d="m6.5 16 4-4 3 2 5-7" /><path d="M15.5 7h3v3" /></svg>
    case "attention":
      return <svg {...iconProps}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
    case "reports":
      return <svg {...iconProps}><path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></svg>
    case "settings":
      return <svg {...iconProps}><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a7.8 7.8 0 0 1-1.6.9l-.3 1.8h-2.8l-.3-1.8a7.8 7.8 0 0 1-1.6-.9l-1.7.6-1.4-2.4 1.4-1.1a7.2 7.2 0 0 1 0-1.9l-1.4-1.1 1.4-2.4 1.7.6a7.8 7.8 0 0 1 1.6-.9l.3-1.8h2.8l.3 1.8a7.8 7.8 0 0 1 1.6.9l1.7-.6 1.4 2.4-1.4 1.1a7.2 7.2 0 0 1-.1 1.8z" /></svg>
  }
}

function TeacherSummaryIcon({ name, className }: { name: TeacherSummaryId; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {name === "students" && <><circle cx="9" cy="8" r="3.2" /><path d="M2.8 20a6.2 6.2 0 0 1 12.4 0M16 5.2a3.2 3.2 0 0 1 0 6.2M17 14a5.6 5.6 0 0 1 4.2 5.4" /></>}
      {name === "lessons" && <><path d="M12 6.5v14M3 5.5A2.5 2.5 0 0 1 5.5 3H12v18H5.5A2.5 2.5 0 0 1 3 18.5zM21 5.5A2.5 2.5 0 0 0 18.5 3H12v18h6.5a2.5 2.5 0 0 0 2.5-2.5z" /></>}
      {name === "accuracy" && <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><path d="m9.5 12 1.7 1.7 4-4" /></>}
      {name === "attention" && <><path d="M12 3 22 20H2L12 3Z" /><path d="M12 9v5M12 17h.01" /></>}
    </svg>
  )
}

export default function TeacherDashboard() {
  const isStudentsPage = window.location.pathname === "/teacher-dashboard/students"
  return (
    <>
      <SiteNavbar teacherProfile />
      <div className="teacher-dashboard">
        <aside className="teacher-dashboard-sidebar" aria-label="ගුරු උපකරණ පුවරුව">
          <nav className="teacher-dashboard-navigation" aria-label="ගුරු උපකරණ පුවරුව">
            {teacherNavigationItems.map((item) => {
              const isActive = isStudentsPage ? item.id === "students" : item.id === "dashboard"

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.id === "students" ? () => { window.location.href = "/teacher-dashboard/students" } : item.id === "dashboard" ? () => { window.location.href = "/teacher-dashboard" } : undefined}
                  className={isActive ? "teacher-dashboard-button is-active" : "teacher-dashboard-button"}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="teacher-dashboard-button-icon"><TeacherNavigationIcon name={item.id} /></span>
                  <span className="teacher-dashboard-button-label">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        <main className="teacher-dashboard-content" aria-labelledby={isStudentsPage ? "teacher-students-title" : "teacher-dashboard-title"}>
          {!isStudentsPage && <section className="teacher-dashboard-banner" aria-hidden="true" />}
          {!isStudentsPage && (
            <section className="teacher-summary-grid" aria-label="ගුරු උපකරණ පුවරුවේ සාරාංශය">
              {teacherSummaryCards.map((card) => (
                <article className={`teacher-summary-card teacher-summary-card--${card.tone}`} key={card.id}>
                  <div className="teacher-summary-main">
                    <span className="teacher-summary-icon-box">
                      <TeacherSummaryIcon name={card.id} className="teacher-summary-icon" />
                    </span>
                    <div className="teacher-summary-copy">
                      <h2 className="teacher-summary-title">{card.title}</h2>
                      <p className="teacher-summary-value">{card.value}</p>
                      <div className="teacher-summary-details">
                        <p className="teacher-summary-description">{card.description}</p>
                        <TeacherSummaryIcon name={card.id} className="teacher-summary-decoration" />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}
          {isStudentsPage && <TeacherStudentList />}
        </main>
      </div>
    </>
  )
}
