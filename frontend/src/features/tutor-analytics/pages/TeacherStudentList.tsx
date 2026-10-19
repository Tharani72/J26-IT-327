import { useEffect, useMemo, useState } from "react"
import "./TeacherStudentList.css"

type AttentionStatus = "good" | "support"
type Student = {
  id: string
  name: string
  grade: string
  accuracy: number
  progress: number
  attention: AttentionStatus
  avatarTone: string
}

const students: Student[] = [
  { id: "OSL-2026-001", name: "සෙනුලි පෙරේරා", grade: "3 ශ්‍රේණිය", accuracy: 92, progress: 88, attention: "good", avatarTone: "blue" },
  { id: "OSL-2026-002", name: "කවීෂා ජයවර්ධන", grade: "2 ශ්‍රේණිය", accuracy: 84, progress: 79, attention: "good", avatarTone: "mint" },
  { id: "OSL-2026-003", name: "නෙතුම් වික්‍රමසිංහ", grade: "4 ශ්‍රේණිය", accuracy: 68, progress: 54, attention: "support", avatarTone: "violet" },
  { id: "OSL-2026-004", name: "අමායා ප්‍රනාන්දු", grade: "3 ශ්‍රේණිය", accuracy: 87, progress: 82, attention: "good", avatarTone: "peach" },
  { id: "OSL-2026-005", name: "දිනුක සෙනෙවිරත්න", grade: "2 ශ්‍රේණිය", accuracy: 61, progress: 47, attention: "support", avatarTone: "yellow" },
  { id: "OSL-2026-006", name: "මිහිරි අබේසිංහ", grade: "4 ශ්‍රේණිය", accuracy: 78, progress: 72, attention: "good", avatarTone: "pink" },
]

function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></svg>
}

function StudentAvatar({ student }: { student: Student }) {
  return <span className={`teacher-student-avatar tone-${student.avatarTone}`} aria-hidden="true">{student.name.slice(0, 1)}</span>
}

function ProgressValue({ value }: { value: number }) {
  return <span className="teacher-student-progress-value"><span className="teacher-student-progress-track"><span style={{ width: `${value}%` }} /></span><strong>{value}%</strong></span>
}

function AttentionBadge({ status }: { status: AttentionStatus }) {
  return <span className={`teacher-student-attention ${status === "good" ? "is-good" : "needs-support"}`}>
    <span aria-hidden="true" />{status === "good" ? "හොඳ අවධානයක්" : "වැඩි අවධානයක් අවශ්‍යයි"}
  </span>
}

type SummaryIconKind = "students" | "success" | "support" | "progress"

function SummaryIcon({ kind }: { kind: SummaryIconKind }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === "students" && <><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 5a3.2 3.2 0 0 1 0 6.2M17 14a6 6 0 0 1 4.5 5.5" /></>}
    {kind === "success" && <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16.5 9" /></>}
    {kind === "support" && <><path d="M12 3 22 20H2L12 3Z" /><path d="M12 9v5M12 17h.01" /></>}
    {kind === "progress" && <><path d="M3 19V5M3 19h18" /><path d="m6 15 4-4 3 2 5-7M15 6h3v3" /></>}
  </svg>
}
export default function TeacherStudentList() {
  const [search, setSearch] = useState("")
  const [grade, setGrade] = useState("all")
  const [progressBand, setProgressBand] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 300)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!selectedStudent) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedStudent(null)
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [selectedStudent])

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return students.filter((student) => {
      const matchesSearch = !query || student.name.toLocaleLowerCase().includes(query) || student.id.toLocaleLowerCase().includes(query)
      const matchesGrade = grade === "all" || student.grade === grade
      const matchesProgress = progressBand === "all"
        || (progressBand === "high" && student.progress >= 80)
        || (progressBand === "medium" && student.progress >= 60 && student.progress < 80)
        || (progressBand === "low" && student.progress < 60)
      return matchesSearch && matchesGrade && matchesProgress
    })
  }, [search, grade, progressBand])

  const averageProgress = Math.round(students.reduce((total, student) => total + student.progress, 0) / students.length)
  const goodProgressCount = students.filter((student) => student.progress >= 75).length
  const supportCount = students.filter((student) => student.attention === "support").length
  const hasFilters = Boolean(search || grade !== "all" || progressBand !== "all")

  const clearFilters = () => {
    setSearch("")
    setGrade("all")
    setProgressBand("all")
  }

  return <section className="teacher-student-list" aria-labelledby="teacher-students-title">
    <header className="teacher-student-heading">
      <div>
        <p className="teacher-student-eyebrow">OmniSign SL</p>
        <h1 id="teacher-students-title">මගේ සිසුන්</h1>
        <p className="teacher-student-subtitle">සිසුන්ගේ තොරතුරු සහ ඉගෙනුම් ප්‍රගතිය පරීක්ෂා කරන්න.</p>
      </div>
    </header>

    <div className="teacher-student-summary" aria-label="සිසුන් පිළිබඳ සාරාංශය">
      <article className="teacher-student-summary-card">
        <span className="teacher-student-summary-icon icon-blue"><SummaryIcon kind="students" /></span>
        <div><p>මුළු සිසුන්</p><strong>{students.length}</strong></div>
      </article>
      <article className="teacher-student-summary-card">
        <span className="teacher-student-summary-icon icon-green"><SummaryIcon kind="success" /></span>
        <div><p>හොඳ ප්‍රගතියක් පෙන්වන සිසුන්</p><strong>{goodProgressCount}</strong></div>
      </article>
      <article className="teacher-student-summary-card">
        <span className="teacher-student-summary-icon icon-orange"><SummaryIcon kind="support" /></span>
        <div><p>වැඩි අවධානයක් අවශ්‍ය සිසුන්</p><strong>{supportCount}</strong></div>
      </article>
      <article className="teacher-student-summary-card">
        <span className="teacher-student-summary-icon icon-purple"><SummaryIcon kind="progress" /></span>
        <div><p>සාමාන්‍ය ඉගෙනුම් ප්‍රගතිය</p><strong>{averageProgress}%</strong></div>
      </article>
    </div>

    <section className="teacher-student-panel" aria-label="සිසුන් සොයන්න සහ පෙරහන් කරන්න">
      <div className="teacher-student-filters">
        <label className="teacher-student-search" htmlFor="teacher-student-search">
          <SearchIcon />
          <span className="sr-only">නම හෝ ශිෂ්‍ය අංකය අනුව සොයන්න</span>
          <input id="teacher-student-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="නම හෝ ශිෂ්‍ය අංකය සොයන්න..." />
        </label>
        <label className="teacher-student-select-label">
          <span>පන්තිය</span>
          <select value={grade} onChange={(event) => setGrade(event.target.value)} aria-label="පන්තිය අනුව පෙරහන් කරන්න">
            <option value="all">සියලුම පන්ති</option>
            <option value="2 ශ්‍රේණිය">2 ශ්‍රේණිය</option>
            <option value="3 ශ්‍රේණිය">3 ශ්‍රේණිය</option>
            <option value="4 ශ්‍රේණිය">4 ශ්‍රේණිය</option>
          </select>
        </label>
        <label className="teacher-student-select-label">
          <span>ඉගෙනුම් ප්‍රගතිය</span>
          <select value={progressBand} onChange={(event) => setProgressBand(event.target.value)} aria-label="ඉගෙනුම් ප්‍රගතිය අනුව පෙරහන් කරන්න">
            <option value="all">සියලුම ප්‍රගති මට්ටම්</option>
            <option value="high">ඉහළ (80% සහ වැඩි)</option>
            <option value="medium">මධ්‍යම (60%–79%)</option>
            <option value="low">අමතර සහාය අවශ්‍ය (60% ට අඩු)</option>
          </select>
        </label>
        <button className="teacher-student-clear" type="button" onClick={clearFilters} disabled={!hasFilters}>පෙරහන් ඉවත් කරන්න</button>
      </div>

      <div className="teacher-student-list-meta" aria-live="polite">
        <h2>සිසුන්ගේ ලැයිස්තුව</h2>
        <span>{filteredStudents.length} දෙනෙක්</span>
      </div>

      {isLoading ? <div className="teacher-student-state" role="status"><span className="teacher-student-spinner" />සිසුන්ගේ තොරතුරු ලබාගනිමින්...</div>
        : filteredStudents.length === 0 ? <div className="teacher-student-state teacher-student-empty"><span aria-hidden="true">⌕</span><strong>සිසුන් හමු නොවීය</strong><p>ඔබගේ සෙවුම හෝ පෙරහන් වෙනස් කර නැවත උත්සාහ කරන්න.</p><button type="button" onClick={clearFilters}>පෙරහන් ඉවත් කරන්න</button></div>
          : <>
            <div className="teacher-student-table-wrap">
              <table className="teacher-student-table">
                <thead><tr><th scope="col">ශිෂ්‍යයා</th><th scope="col">පන්තිය</th><th scope="col">සංඥා නිරවද්‍යතාව</th><th scope="col">ඉගෙනුම් ප්‍රගතිය</th><th scope="col">අවධානය</th><th scope="col"><span className="sr-only">ක්‍රියා</span></th></tr></thead>
                <tbody>{filteredStudents.map((student) => <tr key={student.id}>
                  <td><div className="teacher-student-person"><StudentAvatar student={student} /><span><strong>{student.name}</strong><small>{student.id}</small></span></div></td>
                  <td>{student.grade}</td><td><strong className="teacher-student-percent">{student.accuracy}%</strong></td>
                  <td><ProgressValue value={student.progress} /></td><td><AttentionBadge status={student.attention} /></td>
                  <td><button className="teacher-student-details-button" type="button" onClick={() => setSelectedStudent(student)}>විස්තර බලන්න</button></td>
                </tr>)}</tbody>
              </table>
            </div>
            <div className="teacher-student-mobile-list">{filteredStudents.map((student) => <article className="teacher-student-mobile-card" key={student.id}>
              <div className="teacher-student-mobile-person"><StudentAvatar student={student} /><span><strong>{student.name}</strong><small>{student.id} · {student.grade}</small></span></div>
              <div className="teacher-student-mobile-metrics"><span>සංඥා නිරවද්‍යතාව <strong>{student.accuracy}%</strong></span><span>ඉගෙනුම් ප්‍රගතිය <ProgressValue value={student.progress} /></span><span>අවධානය <AttentionBadge status={student.attention} /></span></div>
              <button className="teacher-student-details-button" type="button" onClick={() => setSelectedStudent(student)}>විස්තර බලන්න</button>
            </article>)}</div>
          </>}
    </section>

    {selectedStudent && <div className="teacher-student-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedStudent(null) }}>
      <section className="teacher-student-modal" role="dialog" aria-modal="true" aria-labelledby="teacher-student-modal-title">
        <button className="teacher-student-modal-close" type="button" onClick={() => setSelectedStudent(null)} aria-label="වසා දමන්න">×</button>
        <div className="teacher-student-modal-person"><StudentAvatar student={selectedStudent} /><div><h2 id="teacher-student-modal-title">{selectedStudent.name}</h2><p>{selectedStudent.id} · {selectedStudent.grade}</p></div></div>
        <div className="teacher-student-modal-stats"><div><span>සංඥා නිරවද්‍යතාව</span><strong>{selectedStudent.accuracy}%</strong></div><div><span>ඉගෙනුම් ප්‍රගතිය</span><strong>{selectedStudent.progress}%</strong></div></div>
        <div className="teacher-student-modal-status"><span>අවධානයේ තත්ත්වය</span><AttentionBadge status={selectedStudent.attention} /></div>
        <p className="teacher-student-modal-note">මෙම සිසුවාගේ ඉගෙනුම් තොරතුරු සහ ප්‍රගතිය මෙහි පෙන්වයි.</p>
      </section>
    </div>}
  </section>
}

