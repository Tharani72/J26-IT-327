import SiteNavbar from "../../../components/navigation/SiteNavbar"
import "./TeacherDashboard.css"
import TeacherStudentList from "./TeacherStudentList"
import teacherWelcomeIllustration from "../../../Images/teacher-smart-glove-classroom.png"
import { getDemoStudentById, type StudentDemoProfile, type StudentLearningSession } from "../studentDemoData"
import { signOutCurrentSession } from "../../../services/authService"

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

type TeacherDashboardStudent = {
  profile: StudentDemoProfile
  latest: StudentLearningSession
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

const demoStudentIds = ["ST001", "ST002", "ST003", "ST004", "ST005"]
const supportAttentionThreshold = 70

const teacherDashboardStudents: TeacherDashboardStudent[] = demoStudentIds.flatMap((studentId) => {
  const profile = getDemoStudentById(studentId)
  if (!profile) return []
  const latest = profile.sessions[profile.sessions.length - 1]
  return latest ? [{ profile, latest }] : []
})

function roundedAverage(values: number[]) {
  return values.length ? Math.round(values.reduce((total, value) => total + value, 0) / values.length) : 0
}

const attentionStudents = teacherDashboardStudents.filter((student) => student.latest.attentionScore < supportAttentionThreshold)

const teacherSummaryCards: TeacherSummaryCard[] = [
  { id: "students", title: "ආදර්ශන සිසුන්", value: String(teacherDashboardStudents.length), description: "සංස්ලේෂිත සිසුන්ගේ ලැයිස්තුව", tone: "blue" },
  { id: "accuracy", title: "සාමාන්‍ය සංඥා නිරවද්‍යතාව", value: roundedAverage(teacherDashboardStudents.map((student) => student.latest.gestureAccuracy)) + "%", description: "අවසන් වාර්තාගත සැසිය අනුව", tone: "green" },
  { id: "lessons", title: "සාමාන්‍ය ඉගෙනුම් ප්‍රගතිය", value: roundedAverage(teacherDashboardStudents.map((student) => student.latest.learningProgress)) + "%", description: "අවසන් වාර්තාගත සැසිය අනුව", tone: "blue" },
  { id: "attention", title: "අමතර සහාය අවශ්‍ය සිසුන්", value: String(attentionStudents.length), description: "අවධානය 70% ට අඩු ආදර්ශන වාර්තා", tone: "orange" },
]

const progressValuesByDate = new Map<string, number[]>()
teacherDashboardStudents.forEach(({ profile }) => {
  profile.sessions.forEach((session) => {
    const values = progressValuesByDate.get(session.date) ?? []
    values.push(session.learningProgress)
    progressValuesByDate.set(session.date, values)
  })
})

const teacherProgressTrend = Array.from(progressValuesByDate.entries())
  .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
  .map(([date, values]) => ({ date, value: roundedAverage(values) }))

const recentLearningActivity = teacherDashboardStudents
  .flatMap(({ profile }) => profile.sessions.map((session) => ({ profile, session })))
  .sort((activityA, activityB) => activityB.session.date.localeCompare(activityA.session.date))
  .slice(0, 5)

function formatDemoDate(date: string) {
  return new Intl.DateTimeFormat("si-LK", { day: "numeric", month: "short" }).format(new Date(date + "T00:00:00"))
}

function TeacherProgressChart() {
  const plotLeft = 48
  const plotRight = 610
  const plotTop = 18
  const plotBottom = 178
  const plotHeight = plotBottom - plotTop
  const points = teacherProgressTrend.map((item, index) => {
    const x = teacherProgressTrend.length === 1
      ? (plotLeft + plotRight) / 2
      : plotLeft + (index / (teacherProgressTrend.length - 1)) * (plotRight - plotLeft)
    return { ...item, x, y: plotTop + ((100 - item.value) / 100) * plotHeight }
  })
  const linePoints = points.map((point) => point.x + "," + point.y).join(" ")
  const areaPath = points.length
    ? "M " + points[0].x + " " + plotBottom + " L " + points.map((point) => point.x + " " + point.y).join(" L ") + " L " + points[points.length - 1].x + " " + plotBottom + " Z"
    : ""

  return (
    <section className="teacher-dashboard-panel teacher-progress-panel" aria-labelledby="teacher-progress-title">
      <header className="teacher-panel-heading">
        <div>
          <p className="teacher-panel-eyebrow">සංස්ලේෂිත ආදර්ශන දත්ත</p>
          <h2 id="teacher-progress-title">ඉගෙනුම් ප්‍රගතිය</h2>
          <p>සෑම සතියකම වාර්තා වූ සාමාන්‍ය ප්‍රගතිය</p>
        </div>
        <span className="teacher-panel-icon teacher-panel-icon--blue"><TeacherSummaryIcon name="lessons" /></span>
      </header>
      {points.length ? (
        <>
          <div className="teacher-progress-chart-wrap">
            <svg className="teacher-progress-chart" viewBox="0 0 640 210" role="img" aria-label="සංස්ලේෂිත ආදර්ශන දත්ත මත සතිපතා ඉගෙනුම් ප්‍රගතිය">
              <defs>
                <linearGradient id="teacher-progress-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#3478ff" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#3478ff" stopOpacity="0.01" />
                </linearGradient>
              </defs>
              {[0, 25, 50, 75, 100].map((tick) => {
                const y = plotTop + ((100 - tick) / 100) * plotHeight
                return <g key={tick} className="teacher-progress-gridline">
                  <line x1={plotLeft} x2={plotRight} y1={y} y2={y} />
                  <text x="38" y={y + 4} textAnchor="end">{tick}%</text>
                </g>
              })}
              <path d={areaPath} fill="url(#teacher-progress-fill)" />
              <polyline points={linePoints} className="teacher-progress-line" />
              {points.map((point) => <circle key={point.date} cx={point.x} cy={point.y} r="4.5" className="teacher-progress-point" />)}
            </svg>
          </div>
          <div className="teacher-progress-date-axis" style={{ gridTemplateColumns: "repeat(" + points.length + ", minmax(0, 1fr))" }}>
            {points.map((point) => <span key={point.date}>{formatDemoDate(point.date)}</span>)}
          </div>
        </>
      ) : <p className="teacher-dashboard-empty">ප්‍රගති වාර්තා නොමැත.</p>}
      <p className="teacher-data-footnote">මෙම ප්‍රස්ථාරය ආදර්ශන සිසුන්ගේ දත්ත පමණක් භාවිත කරයි.</p>
    </section>
  )
}

function TeacherAttentionPanel() {
  return (
    <section className="teacher-dashboard-panel teacher-attention-panel" aria-labelledby="teacher-attention-title">
      <header className="teacher-panel-heading">
        <div>
          <p className="teacher-panel-eyebrow">අවසන් වාර්තාගත සැසිය</p>
          <h2 id="teacher-attention-title">අමතර සහාය</h2>
        </div>
        <span className="teacher-panel-icon teacher-panel-icon--orange"><TeacherSummaryIcon name="attention" /></span>
      </header>
      <p className="teacher-panel-note">අවධානය 70% ට අඩු ආදර්ශන වාර්තා</p>
      {attentionStudents.length ? (
        <ul className="teacher-attention-list">
          {attentionStudents.map(({ profile, latest }) => <li className="teacher-attention-item" key={profile.studentId}>
            <span className="teacher-dashboard-avatar">{profile.displayName.slice(0, 1)}</span>
            <span className="teacher-attention-copy"><strong>{profile.displayName}</strong><small>{profile.studentId} · {profile.grade}</small></span>
            <strong className="teacher-attention-score">{Math.round(latest.attentionScore)}%</strong>
          </li>)}
        </ul>
      ) : <p className="teacher-dashboard-empty">මෙම ආදර්ශන දත්තවල සහාය අවශ්‍ය වාර්තා නොමැත.</p>}
    </section>
  )
}

function TeacherRecentActivity() {
  return (
    <section className="teacher-dashboard-panel teacher-activity-panel" aria-labelledby="teacher-activity-title">
      <header className="teacher-panel-heading">
        <div>
          <p className="teacher-panel-eyebrow">ආදර්ශන සැසි</p>
          <h2 id="teacher-activity-title">මෑත ඉගෙනුම් ක්‍රියාකාරකම්</h2>
        </div>
        <span className="teacher-panel-icon teacher-panel-icon--green"><TeacherSummaryIcon name="lessons" /></span>
      </header>
      {recentLearningActivity.length ? (
        <ul className="teacher-activity-list">
          {recentLearningActivity.map(({ profile, session }) => <li className="teacher-activity-item" key={session.id}>
            <span className="teacher-activity-marker" aria-hidden="true"><TeacherSummaryIcon name="accuracy" /></span>
            <span className="teacher-activity-copy"><strong>{session.lessonTitle}</strong><small>{profile.displayName} · {profile.studentId}</small></span>
            <time dateTime={session.date}>{formatDemoDate(session.date)}</time>
          </li>)}
        </ul>
      ) : <p className="teacher-dashboard-empty">ඉගෙනුම් ක්‍රියාකාරකම් නොමැත.</p>}
    </section>
  )
}

function TeacherPerformanceTable() {
  return (
    <section className="teacher-dashboard-panel teacher-performance-panel" aria-labelledby="teacher-performance-title">
      <header className="teacher-panel-heading teacher-performance-heading">
        <div>
          <p className="teacher-panel-eyebrow">සංස්ලේෂිත ආදර්ශන දත්ත</p>
          <h2 id="teacher-performance-title">ශිෂ්‍ය කාර්යසාධනය</h2>
          <p>එක් එක් සිසුවාගේ අවසන් වාර්තාගත සැසිය</p>
        </div>
        <span className="teacher-performance-count">{teacherDashboardStudents.length} ආදර්ශන සිසුන්</span>
      </header>
      {teacherDashboardStudents.length ? <div className="teacher-performance-table-wrap">
        <table className="teacher-performance-table">
          <thead><tr>
            <th scope="col">ශිෂ්‍යයා</th>
            <th scope="col">ශ්‍රේණිය</th>
            <th scope="col">සංඥා නිරවද්‍යතාව</th>
            <th scope="col">ඉගෙනුම් ප්‍රගතිය</th>
            <th scope="col">අවධානය</th>
            <th scope="col">අවසන් සැසිය</th>
          </tr></thead>
          <tbody>{teacherDashboardStudents.map(({ profile, latest }) => {
            const needsSupport = latest.attentionScore < supportAttentionThreshold
            return <tr key={profile.studentId}>
              <td><span className="teacher-performance-student"><span className="teacher-dashboard-avatar">{profile.displayName.slice(0, 1)}</span><span><strong>{profile.displayName}</strong><small>{profile.studentId}</small></span></span></td>
              <td>{profile.grade}</td>
              <td><strong className="teacher-performance-value">{Math.round(latest.gestureAccuracy)}%</strong></td>
              <td><span className="teacher-performance-progress"><span className="teacher-performance-track"><span style={{ width: Math.max(0, Math.min(100, latest.learningProgress)) + "%" }} /></span><strong>{Math.round(latest.learningProgress)}%</strong></span></td>
              <td><span className={needsSupport ? "teacher-performance-status is-support" : "teacher-performance-status is-good"}>{needsSupport ? "අමතර සහාය" : "හොඳයි"}</span></td>
              <td><time dateTime={latest.date}>{formatDemoDate(latest.date)}</time></td>
            </tr>
          })}</tbody>
        </table>
      </div> : <p className="teacher-dashboard-empty">ශිෂ්‍ය කාර්යසාධන වාර්තා නොමැත.</p>}
      <p className="teacher-data-footnote">මෙය සජීවී ගුරු වාර්තාවක් නොවේ. ඉගැන්වීම් භාවිතයට පෙර සැබෑ ගුරු-පන්ති API එකක් අවශ්‍ය වේ.</p>
    </section>
  )
}

function TeacherDashboardHome() {
  return (
    <div className="teacher-dashboard-main">
      <section className="teacher-dashboard-banner" aria-labelledby="teacher-dashboard-title">
        <div className="teacher-welcome-copy">
          <span className="teacher-welcome-eyebrow">OMNISIGN SL · ගුරු පුවරුව</span>
          <h1 id="teacher-dashboard-title">ආයුබෝවන්, ගුරුතුමනි</h1>
          <p>සිසුන්ගේ ඉගෙනුම් ප්‍රගතිය සහ පන්ති කටයුතු එකම තැනකින් බලන්න.</p>
          <span className="teacher-synthetic-badge"><span aria-hidden="true" />සංස්ලේෂිත ආදර්ශන දත්ත · සජීවී ගුරු වාර්තා නොවේ</span>
        </div>
        <div className="teacher-welcome-art">
          <img src={teacherWelcomeIllustration} alt="Primary-school children practising sign language with smart gloves while their teacher guides them." />
        </div>
      </section>

      <section className="teacher-summary-grid" aria-label="සංස්ලේෂිත ගුරු පුවරු සාරාංශය">
        {teacherSummaryCards.map((card) => (
          <article className={"teacher-summary-card teacher-summary-card--" + card.tone} key={card.id}>
            <div className="teacher-summary-main">
              <span className="teacher-summary-icon-box"><TeacherSummaryIcon name={card.id} className="teacher-summary-icon" /></span>
              <div className="teacher-summary-copy">
                <h2 className="teacher-summary-title">{card.title}</h2>
                <p className="teacher-summary-value">{card.value}</p>
                <p className="teacher-summary-description">{card.description}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <div className="teacher-dashboard-insights">
        <TeacherProgressChart />
        <div className="teacher-dashboard-side-panels">
          <TeacherAttentionPanel />
          <TeacherRecentActivity />
        </div>
      </div>
      <TeacherPerformanceTable />
    </div>
  )
}

export default function TeacherDashboard() {
  const isStudentsPage = window.location.pathname === "/teacher-dashboard/students"

  function handleLogout() {
    void signOutCurrentSession().finally(() => window.location.replace("/login"))
  }

  return (
    <>
      <SiteNavbar teacherProfile onStudentLogout={handleLogout} />
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
          {!isStudentsPage && <TeacherDashboardHome />}
          {isStudentsPage && <TeacherStudentList />}
        </main>
      </div>
    </>
  )
}
