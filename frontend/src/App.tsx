import HomePage from "./features/home/HomePage"
import StudentDashboard from "./features/tutor-analytics/pages/StudentDashboard"
import TeacherDashboard from "./features/tutor-analytics/pages/TeacherDashboard"
import LoginPage from "./components/common/LoginPage"

import { useEffect, useState, type ReactNode } from "react"
import { getCurrentSession, type AuthSession } from "./services/authService"

const isTeacherDashboardPresentationDemo =
  import.meta.env.DEV &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname) &&
  import.meta.env.VITE_TEACHER_DASHBOARD_DEMO === "true"

function ProtectedDashboard({
  role,
  children,
}: {
  role: AuthSession["role"]
  children: (session: AuthSession) => ReactNode
}) {
  const [session, setSession] = useState<AuthSession | null>(null)

  useEffect(() => {
    let active = true
    getCurrentSession().then((session) => {
      if (!active) return
      if (!session) {
        window.location.replace("/login")
        return
      }
      if (session.role !== role) {
        window.location.replace(session.role === "teacher" ? "/teacher-dashboard" : "/student-dashboard")
        return
      }
      setSession(session)
    })
    return () => {
      active = false
    }
  }, [role])

  return session ? children(session) : null
}

function App() {
  const currentPath = window.location.pathname

  if (currentPath === "/login") {
    return <LoginPage />
  }

  if (currentPath === "/student-dashboard") {
    return (
      <ProtectedDashboard role="student">
        {(session) => session.role === "student" ? <StudentDashboard studentId={session.studentId} /> : null}
      </ProtectedDashboard>
    )
  }

  if (currentPath === "/teacher-dashboard" && isTeacherDashboardPresentationDemo) {
    return <TeacherDashboard />
  }

  if (currentPath === "/teacher-dashboard" || currentPath === "/teacher-dashboard/students") {
    return <ProtectedDashboard role="teacher">{(session) => session.role === "teacher" ? <TeacherDashboard /> : null}</ProtectedDashboard>
  }

  return <HomePage />
}

export default App
