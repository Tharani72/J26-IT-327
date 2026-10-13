import SiteNavbar from "../../../components/navigation/SiteNavbar"
import studentDashboardImage from "./Images/StudentDashboard.png"
import "./StudentDashboard.css"

type SidebarIconName =
  | "home"
  | "lessons"
  | "my-lessons"
  | "progress"
  | "recommendations"
  | "games"
  | "settings"

const sidebarItems: { id: SidebarIconName; label: string; icon: SidebarIconName }[] = [
  { id: "home", label: "\u0db8\u0dd4\u0dbd\u0dca \u0db4\u0dd2\u0da7\u0dd4\u0dc0", icon: "home" },
  { id: "lessons", label: "\u0db4\u0dcf\u0da9\u0db8\u0dca \u0d89\u0d9c\u0dd9\u0db1\u0dd4\u0db8", icon: "lessons" },
  { id: "my-lessons", label: "\u0db8\u0d9c\u0dda \u0db4\u0dcf\u0da9\u0db8", icon: "my-lessons" },
  { id: "progress", label: "\u0db8\u0d9c\u0dda \u0db4\u0dca\u200d\u0dbb\u0d9c\u0dad\u0dd2\u0dba", icon: "progress" },
  { id: "recommendations", label: "\u0db1\u0dd2\u0dbb\u0dca\u0daf\u0dda\u0dc1", icon: "recommendations" },
  { id: "games", label: "\u0d9a\u0dca\u200d\u0dbb\u0dd3\u0da9\u0dcf \u0dc4\u0dcf \u0d9a\u0da7\u0dba\u0dd4\u0dad\u0dd4", icon: "games" },
  { id: "settings", label: "\u0dc3\u0dd0\u0d9a\u0dc3\u0dd4\u0db8\u0dca", icon: "settings" }
]

type SummaryCardIconName = "target" | "eye" | "book" | "chart"

type SummaryCard = {
  id: string
  title: string
  subtitle: string
  value: string
  progress: number
  color: string
  icon: SummaryCardIconName
}

const summaryCards: SummaryCard[] = [
  { id: "accuracy", title: "නිවැරදි බව", subtitle: "Accuracy", value: "89%", progress: 89, color: "#20C96B", icon: "target" },
  { id: "attention", title: "අවධානය", subtitle: "Accuracy", value: "77%", progress: 77, color: "#397BFF", icon: "eye" },
  { id: "completed-lessons", title: "සම්පූර්ණ කළ පාඩම්", subtitle: "Completed Lessons", value: "8/10", progress: 80, color: "#FFB800", icon: "book" },
  { id: "overall-progress", title: "සමස්ත ප්‍රගතිය", subtitle: "Overall Progress", value: "82%", progress: 82, color: "#A64DFF", icon: "chart" },
]

function SummaryCardIcon({ icon }: { icon: SummaryCardIconName }) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icon === "target" && (
        <>
          <circle cx="10" cy="14" r="7" />
          <circle cx="10" cy="14" r="3" />
          <path d="m10 14 9-9M15 5h4v4" />
        </>
      )}
      {icon === "eye" && (
        <>
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
      {icon === "book" && (
        <>
          <path d="M12 6.5C10.4 4.9 8 4 3 4v15c4.8 0 7.3.8 9 2.5 1.7-1.7 4.2-2.5 9-2.5V4c-5 0-7.4.9-9 2.5Z" />
          <path d="M12 6.5v15M6 8h3M15 8h3M6 12h3M15 12h3" />
        </>
      )}
      {icon === "chart" && (
        <>
          <path d="M4 20V11h4v9M10 20V6h4v14M16 20V3h4v17M3 20h18" />
        </>
      )}
    </svg>
  )
}

type LearningProgressKey = "accuracy" | "attention" | "proficiency"

type LearningProgressDatum = {
  week: string
  accuracy: number
  attention: number
  proficiency: number
}

const learningProgressData: LearningProgressDatum[] = [
  { week: "\u0dc3\u0dad\u0dd2\u0020\u0031", accuracy: 40, attention: 28, proficiency: 18 },
  { week: "\u0dc3\u0dad\u0dd2\u0020\u0032", accuracy: 60, attention: 48, proficiency: 35 },
  { week: "\u0dc3\u0dad\u0dd2\u0020\u0033", accuracy: 75, attention: 60, proficiency: 44 },
  { week: "\u0dc3\u0dad\u0dd2\u0020\u0034", accuracy: 80, attention: 64, proficiency: 45 },
  { week: "\u0dc3\u0dad\u0dd2\u0020\u0035", accuracy: 89, attention: 72, proficiency: 54 },
  { week: "\u0dc3\u0dad\u0dd2\u0020\u0036", accuracy: 91, attention: 73, proficiency: 54 },
  { week: "\u0dc3\u0dad\u0dd2\u0020\u0037", accuracy: 100, attention: 82, proficiency: 63 },
]

const learningProgressSeries: { key: LearningProgressKey; label: string; color: string }[] = [
  { key: "accuracy", label: "\u0db1\u0dd2\u0dc0\u0dd0\u0dbb\u0daf\u0dd2\u0020\u0db6\u0dc0", color: "#10C98A" },
  { key: "attention", label: "\u0d85\u0dc0\u0db0\u0dcf\u0db1\u0dba\u0020\u0028\u0045\u0079\u0065\u0020\u0047\u0061\u007a\u0065\u0029", color: "#3478FF" },
  { key: "proficiency", label: "\u0db4\u0dca\u200d\u0dbb\u0dad\u0dd2\u0da0\u0dcf\u0dbb\u0020\u0d9a\u0dcf\u0dbd\u0dba", color: "#8B3DFF" },
]

function chartY(value: number) {
  return 172 - (value / 100) * 164
}

function chartX(index: number) {
  return ((index + 0.5) * 700) / learningProgressData.length
}

function weeklyChartPath(key: LearningProgressKey) {
  return learningProgressData.map((datum, index) => {
    const command = index === 0 ? "M" : "L"
    return command + " " + chartX(index) + " " + chartY(datum[key])
  }).join(" ")
}

function LearningProgressChart() {
  const axisValues = [100, 80, 60, 40, 20, 0]

  return (
    <section className="learning-progress-card" aria-labelledby="learning-progress-title">
      <header className="learning-progress-header">
        <div className="learning-progress-heading">
          <svg className="learning-progress-heading-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3.5" y="5" width="17" height="16" rx="2" />
            <path d="M8 3v4M16 3v4M4 10h16M7.5 16l3-3 2.5 2 4-4" />
          </svg>
          <h2 id="learning-progress-title">{"\u0db4\u0dc3\u0dd4\u0d9c\u0dd2\u0dba\u0020\u0d89\u0d9c\u0dd9\u0db1\u0dd4\u0db8\u0dca\u0020\u0db4\u0dca\u200d\u0dbb\u0d9c\u0dad\u0dd2\u0dba"}</h2>
        </div>
        <div className="learning-progress-legend" aria-label="Chart legend">
          {learningProgressSeries.map((series) => (
            <span className="learning-progress-legend-item" key={series.key}>
              <span className="learning-progress-legend-swatch" style={{ backgroundColor: series.color }} />
              {series.label}
            </span>
          ))}
        </div>
      </header>

      <div className="learning-progress-plot" role="group" aria-label="Learning progress percentages across seven weeks">
        <div className="learning-progress-y-axis" aria-hidden="true">
          {axisValues.map((value) => <span key={value}>{value}%</span>)}
        </div>
        <div className="learning-progress-plot-area" aria-hidden="true">
          <svg viewBox="0 0 700 180" preserveAspectRatio="none">
            {axisValues.map((value) => (
              <line
                key={value}
                x1="0"
                x2="700"
                y1={chartY(value)}
                y2={chartY(value)}
                className="learning-progress-grid-line"
              />
            ))}
            {learningProgressSeries.map((series) => (
              <path
                key={series.key}
                d={weeklyChartPath(series.key)}
                fill="none"
                stroke={series.color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </svg>
          <div className="learning-progress-markers" aria-hidden="true">
            {learningProgressSeries.flatMap((series) =>
              learningProgressData.map((datum, index) => (
                <span
                  key={series.key + "-" + index}
                  className="learning-progress-marker"
                  style={{
                    borderColor: series.color,
                    left: ((index + 0.5) / learningProgressData.length) * 100 + "%",
                    top: (chartY(datum[series.key]) / 180) * 100 + "%",
                  }}
                />
              ))
            )}
          </div>
        </div>
        <div className="learning-progress-x-axis" aria-hidden="true">
          {learningProgressData.map((datum) => <span key={datum.week}>{datum.week}</span>)}
        </div>
      </div>
    </section>
  )
}

type EyeGazeIconName = "eye" | "target" | "eye-off" | "clock" | "zap" | "smile" | "arrow"
type EyeGazeMetricTone = "green" | "pink" | "blue"

type EyeGazeMetric = {
  label: string
  value: string
  icon: Exclude<EyeGazeIconName, "eye" | "smile" | "arrow">
  tone: EyeGazeMetricTone
}

const eyeGazeMetrics: EyeGazeMetric[] = [
  { label: "කාර්යයේ නිරත වීම", value: "82%", icon: "target", tone: "green" },
  { label: "වෙනතකට බැලීම්", value: "3 වාර", icon: "eye-off", tone: "pink" },
  { label: "බැලීමේ කාලය", value: "4.8 තත්පර", icon: "clock", tone: "blue" },
  { label: "ප්‍රතිචාර කාලය", value: "2.3 තත්පර", icon: "zap", tone: "blue" },
]

function EyeGazeIcon({ name }: { name: EyeGazeIconName }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === "eye" && (
        <>
          <path d="M2.5 12s3.3-7 9.5-7 9.5 7 9.5 7-3.3 7-9.5 7-9.5-7-9.5-7Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
      {name === "target" && (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <circle cx="12" cy="12" r="4.5" />
          <path d="m9.5 12 1.7 1.7 4-4.2" />
        </>
      )}
      {name === "eye-off" && (
        <>
          <path d="M3 3l18 18" />
          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
          <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.2 0 9 4.3 10 7-.4 1.2-1.2 2.4-2.4 3.4M6.6 6.6C4.4 8 2.8 10.1 2 12c.9 2.7 4.2 7 10 7 1 0 2-.2 2.8-.5" />
        </>
      )}
      {name === "clock" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3.5 2" />
        </>
      )}
      {name === "zap" && <path d="M13 2 4 14h7l-1 8 10-13h-7l0-7Z" />}
      {name === "smile" && (
        <>
          <circle cx="12" cy="12" r="9.5" />
          <path d="M8.5 10h.01M15.5 10h.01M8 14s1.5 2.5 4 2.5 4-2.5 4-2.5" />
        </>
      )}
      {name === "arrow" && <path d="M5 12h14m-6-6 6 6-6 6" />}
    </svg>
  )
}

function EyeGazeAnalytics() {
  const circumference = 2 * Math.PI * 48

  return (
    <section className="eye-gaze-analytics" aria-labelledby="eye-gaze-title">
      <header className="eye-gaze-header">
        <div className="eye-gaze-title-group">
          <span className="eye-gaze-header-icon">
            <EyeGazeIcon name="eye" />
          </span>
          <div className="eye-gaze-heading-copy">
            <h2 id="eye-gaze-title">අවධානයේ තත්ත්වය</h2>
            <span>(Eye Gaze Analytics)</span>
          </div>
        </div>
        <button className="eye-gaze-details-button" type="button">
          <span>සවිස්තර බලන්න</span>
          <EyeGazeIcon name="arrow" />
        </button>
      </header>

      <div className="eye-gaze-content">
        <div className="eye-gaze-overview">
          <div
            className="eye-gaze-ring"
            role="progressbar"
            aria-label="Eye gaze attention"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={77}
          >
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <circle className="eye-gaze-ring-track" cx="60" cy="60" r="48" />
              <circle
                className="eye-gaze-ring-progress"
                cx="60"
                cy="60"
                r="48"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * 0.23}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="eye-gaze-ring-copy">
              <strong>77%</strong>
              <span>අවධානය</span>
            </div>
          </div>
          <span className="eye-gaze-status">
            <EyeGazeIcon name="smile" />
            <span>හොඳ අවධානයක්</span>
          </span>
        </div>

        <div className="eye-gaze-metrics" aria-label="Eye gaze analytics metrics">
          {eyeGazeMetrics.map((metric) => (
            <article className="eye-gaze-metric-card" key={metric.label}>
              <span className={`eye-gaze-metric-icon eye-gaze-metric-icon--${metric.tone}`}>
                <EyeGazeIcon name={metric.icon} />
              </span>
              <span className="eye-gaze-metric-copy">
                <span className="eye-gaze-metric-label">{metric.label}</span>
                <strong className="eye-gaze-metric-value">{metric.value}</strong>
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

type ActivitySectionIconName = "clock" | "star" | "arrow"
type LessonArtworkKind = "single-hand" | "paired-hands" | "dog" | "apple"

type RecentLesson = {
  id: string
  title: string
  completedAt: string
  completion: string
  artwork: LessonArtworkKind
}

const recentLessons: RecentLesson[] = [
  { id: "sign-letters-1", title: "සංඥා අකුරු - 1", completedAt: "2026-10-05", completion: "92%", artwork: "single-hand" },
  { id: "sign-letters-2", title: "සංඥා අකුරු - 2", completedAt: "2026-10-03", completion: "85%", artwork: "paired-hands" },
  { id: "animals-1", title: "සතුන් - 1", completedAt: "2026-09-28", completion: "78%", artwork: "dog" },
  { id: "fruits-1", title: "පලතුරු - 1", completedAt: "2026-09-25", completion: "88%", artwork: "apple" },
]

function ActivitySectionIcon({ name }: { name: ActivitySectionIconName }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === "clock" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3.5 2" />
        </>
      )}
      {name === "star" && <path d="m12 2.8 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3-5.6-3-5.6 3 1.1-6.3L3 9.4l6.2-.9L12 2.8Z" fill="currentColor" />}
      {name === "arrow" && <path d="M5 12h14m-6-6 6 6-6 6" />}
    </svg>
  )
}

function LessonIllustration({ kind }: { kind: LessonArtworkKind }) {
  const handShape = "M34 94 28 78c-2-6 0-11 4-12 4-1 7 2 9 7l-1-28c0-5 3-8 7-7 4 0 6 3 6 8l1-18c0-5 3-8 7-7 5 1 6 4 5 9l-1 19 4-15c1-5 5-7 9-5 4 2 4 5 2 10l-5 15 7-9c3-4 7-4 10-1 3 3 2 6 0 10l-8 15c-5 9-12 14-23 15l-17 1c-5 0-9-2-10-6Z"

  return (
    <svg className="lesson-illustration-svg" viewBox="0 0 160 110" aria-hidden="true">
      <ellipse cx="80" cy="98" rx="48" ry="7" fill="rgba(35, 77, 126, 0.1)" />
      {(kind === "single-hand" || kind === "paired-hands") && (
        <>
          {kind === "single-hand" ? (
            <g transform="translate(22 1)">
              <path d={handShape} fill="#ffc99f" stroke="#df956a" strokeWidth="2" strokeLinejoin="round" />
              <path d="M37 83c12 6 27 6 41 0l5 10c-14 8-31 9-43 1Z" fill="#4f8df7" />
            </g>
          ) : (
            <>
              <g transform="translate(-10 12) scale(.82)">
                <path d={handShape} fill="#ffc99f" stroke="#df956a" strokeWidth="2" strokeLinejoin="round" />
                <path d="M37 83c12 6 27 6 41 0l5 10c-14 8-31 9-43 1Z" fill="#4f8df7" />
              </g>
              <g transform="translate(160 0) scale(-1 1) translate(-10 12) scale(.82)">
                <path d={handShape} fill="#ffd6a8" stroke="#df956a" strokeWidth="2" strokeLinejoin="round" />
                <path d="M37 83c12 6 27 6 41 0l5 10c-14 8-31 9-43 1Z" fill="#ffb84d" />
              </g>
            </>
          )}
          <path d="m22 30 3 5 5 1-5 2-2 5-2-5-5-2 5-1 1-5ZM132 24l2 4 4 1-4 2-1 4-2-4-4-2 4-1 1-4Z" fill="#ffd34e" />
        </>
      )}
      {kind === "dog" && (
        <>
          <path d="M48 43 39 31c-5-8 2-14 10-9l13 10M112 43l9-12c5-8-2-14-10-9L98 32" fill="#a95e42" stroke="#8c4935" strokeWidth="3" strokeLinejoin="round" />
          <path d="M49 44c0-17 14-27 31-27s31 10 31 27v20c0 19-13 30-31 30S49 83 49 64Z" fill="#d99460" stroke="#b56d47" strokeWidth="3" />
          <ellipse cx="80" cy="67" rx="20" ry="15" fill="#ffe4c5" />
          <circle cx="68" cy="52" r="3" fill="#352a2b" />
          <circle cx="92" cy="52" r="3" fill="#352a2b" />
          <ellipse cx="80" cy="63" rx="5" ry="4" fill="#352a2b" />
          <path d="M80 67v5m0 0c-4 5-9 4-12 1m12-1c4 5 9 4 12 1" fill="none" stroke="#74433b" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M61 88c10 6 28 6 38 0" fill="none" stroke="#4d9ee8" strokeWidth="7" strokeLinecap="round" />
          <circle cx="105" cy="88" r="4" fill="#ffd34e" />
        </>
      )}
      {kind === "apple" && (
        <>
          <path d="M80 37c-19-16-43-3-40 21 3 23 18 39 39 34 21 5 36-11 39-34 3-24-21-37-38-21Z" fill="#fa6473" stroke="#df475b" strokeWidth="3" />
          <path d="M80 38c-1-10 2-17 8-22" fill="none" stroke="#80513b" strokeWidth="5" strokeLinecap="round" />
          <path d="M86 23c13-12 25-5 24 5-11 5-20 4-24-5Z" fill="#59c889" stroke="#3eaa70" strokeWidth="2" />
          <path d="M60 55c-2 10 2 20 8 25" fill="none" stroke="#ffb1a9" strokeWidth="4" strokeLinecap="round" />
          <circle cx="48" cy="36" r="4" fill="#ffd34e" />
          <path d="m114 66 3 4 5 1-5 2-2 5-2-5-5-2 5-1 1-4Z" fill="#ffd34e" />
        </>
      )}
    </svg>
  )
}

function RecentLearningActivity() {
  return (
    <section className="recent-learning-section" aria-labelledby="recent-learning-title">
      <header className="bottom-section-header">
        <div className="bottom-section-heading">
          <span className="recent-learning-heading-icon"><ActivitySectionIcon name="clock" /></span>
          <h2 id="recent-learning-title">මෑතකදී ඉගෙනුම් පාඩම්</h2>
        </div>
        <button className="recent-learning-all-button" type="button">
          <span>සියල්ල බලන්න</span>
          <ActivitySectionIcon name="arrow" />
        </button>
      </header>

      <div className="recent-lesson-grid">
        {recentLessons.map((lesson) => (
          <article className="recent-lesson-card" key={lesson.id}>
            <div className={`recent-lesson-artwork recent-lesson-artwork--${lesson.artwork}`}>
              <LessonIllustration kind={lesson.artwork} />
            </div>
            <div className="recent-lesson-copy">
              <h3>{lesson.title}</h3>
              <div className="recent-lesson-meta">
                <time dateTime={lesson.completedAt}>{lesson.completedAt}</time>
                <span className="recent-lesson-completion">{lesson.completion}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function RecommendedLearningActivity() {
  return (
    <aside className="recommended-lesson-section" aria-labelledby="recommended-lesson-title">
      <header className="recommended-lesson-header">
        <span className="recommended-lesson-star"><ActivitySectionIcon name="star" /></span>
        <h2 id="recommended-lesson-title">ඔබට ගැළපෙන ඊළඟ පාඩම</h2>
      </header>

      <div className="recommended-lesson-panel">
        <div className="recommended-lesson-artwork">
          <LessonIllustration kind="paired-hands" />
        </div>
        <div className="recommended-lesson-copy">
          <h3>සංඥා අකුරු - 2</h3>
          <p>ඔබගේ ඉදිරිපත් කිරීම අනුව සකස් කළ පාඩමකි.</p>
        </div>
      </div>

      <button className="recommended-lesson-button" type="button">
        <span>පාඩම ආරම්භ කරන්න</span>
        <ActivitySectionIcon name="arrow" />
      </button>
    </aside>
  )
}

const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
} as const

function SidebarIcon({ name }: { name: SidebarIconName }) {
  switch (name) {
    case "home":
      return (
        <svg {...iconProps}>
          <path d="m3 10 9-7 9 7" />
          <path d="M5.5 9.5V21h13V9.5" />
          <path d="M9 21v-7h6v7" />
        </svg>
      )
    case "lessons":
      return (
        <svg {...iconProps}>
          <path d="M12 7v14" />
          <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H12v18H5.5A2.5 2.5 0 0 1 3 18.5z" />
          <path d="M21 5.5A2.5 2.5 0 0 0 18.5 3H12v18h6.5a2.5 2.5 0 0 0 2.5-2.5z" />
        </svg>
      )
    case "my-lessons":
      return (
        <svg {...iconProps}>
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M9 8h6M9 12h3" />
          <path d="m13 16 2 2 4-4" />
        </svg>
      )
    case "progress":
      return (
        <svg {...iconProps}>
          <path d="M4 19V5M4 19h17" />
          <path d="m7 15 4-4 3 2 5-6" />
          <path d="M15 7h4v4" />
        </svg>
      )
    case "recommendations":
      return (
        <svg {...iconProps}>
          <path d="M9 18h6M10 21h4" />
          <path d="M8.5 14.5A7 7 0 1 1 15.5 14.5c-.9.7-1.3 1.4-1.5 2.5h-4c-.2-1.1-.6-1.8-1.5-2.5z" />
          <path d="M12 2v2M4.9 4.9l1.4 1.4M19.1 4.9l-1.4 1.4" />
        </svg>
      )
    case "games":
      return (
        <svg {...iconProps}>
          <path d="M7 8h10a4 4 0 0 1 3.8 5.2l-1.2 4a2.5 2.5 0 0 1-4.1 1.1L13 16h-2l-2.5 2.3a2.5 2.5 0 0 1-4.1-1.1l-1.2-4A4 4 0 0 1 7 8z" />
          <path d="M7 11v4M5 13h4M16.5 12h.01M18.5 14h.01" />
        </svg>
      )
    case "settings":
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="3" />
          <path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a7.8 7.8 0 0 1-1.6.9l-.3 1.8h-2.8l-.3-1.8a7.8 7.8 0 0 1-1.6-.9l-1.7.6-1.4-2.4 1.4-1.1a7.2 7.2 0 0 1 0-1.9l-1.4-1.1 1.4-2.4 1.7.6a7.8 7.8 0 0 1 1.6-.9l.3-1.8h2.8l.3 1.8a7.8 7.8 0 0 1 1.6.9l1.7-.6 1.4 2.4-1.4 1.1a7.2 7.2 0 0 1-.1 1.8z" />
        </svg>
      )
    default:
      return null
  }
}

export default function StudentDashboard() {
  return (
    <>
      <SiteNavbar studentProfile />
      <div className="student-dashboard">
        <aside className="student-dashboard-sidebar" aria-label="Student dashboard sidebar">
          <nav className="student-dashboard-navigation" aria-label="Student dashboard">
            {sidebarItems.map((item) => {
              const isActive = item.id === "home"

              return (
                <button
                  key={item.id}
                  type="button"
                  className={isActive ? "student-dashboard-button is-active" : "student-dashboard-button"}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="student-dashboard-button-icon">
                    <SidebarIcon name={item.icon} />
                  </span>
                  <span className="student-dashboard-button-label">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </aside>
        <main className="student-dashboard-content">
          <img
            className="student-dashboard-image"
            src={studentDashboardImage}
            alt="OmniSign SL student dashboard illustration"
          />
          <section className="student-dashboard-summary-grid" aria-label="Student learning summary">
            {summaryCards.map((card) => (
              <article className="student-summary-card" key={card.id}>
                <div className="student-summary-card-main">
                  <span
                    className="student-summary-card-icon"
                    style={{ backgroundColor: card.color }}
                    aria-hidden="true"
                  >
                    <SummaryCardIcon icon={card.icon} />
                  </span>
                  <div className="student-summary-card-copy">
                    <h2 className="student-summary-card-title">{card.title}</h2>
                    <p className="student-summary-card-subtitle">{card.subtitle}</p>
                    <strong className="student-summary-card-value">{card.value}</strong>
                  </div>
                </div>
                <div
                  className="student-summary-card-progress"
                  role="progressbar"
                  aria-label={card.title + " " + card.subtitle}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={card.progress}
                  style={{ borderColor: card.color }}
                >
                  <span
                    className="student-summary-card-progress-fill"
                    style={{ width: card.progress + "%", backgroundColor: card.color }}
                  />
                </div>
              </article>
            ))}
          </section>
          <div className="student-dashboard-analytics-row">
            <LearningProgressChart />
            <EyeGazeAnalytics />
          </div>
          <div className="student-dashboard-bottom-row">
            <RecentLearningActivity />
            <RecommendedLearningActivity />
          </div>
        </main>
      </div>
    </>
  )
}
