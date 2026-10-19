import HomePage from "./features/home/HomePage"
import StudentDashboard from "./features/tutor-analytics/pages/StudentDashboard"
import TeacherDashboard from "./features/tutor-analytics/pages/TeacherDashboard"
import LoginPage from "./components/common/LoginPage"

import { useEffect, useState } from "react"
import { getCurrentStudentSession, type StudentDemoSession } from "./services/authService"

function ProtectedStudentDashboard() {
  const [session, setSession] = useState<StudentDemoSession | null | undefined>(undefined)

  useEffect(() => {
    let active = true
    getCurrentStudentSession().then((currentSession) => {
      if (!active) return
      if (!currentSession) {
        window.location.replace("/login")
        return
      }
      setSession(currentSession)
    })
    return () => {
      active = false
    }
  }, [])

  return session ? <StudentDashboard studentId={session.studentId} /> : null
}

function App() {
  const currentPath = window.location.pathname

  if (currentPath === "/login") {
    return <LoginPage />
  }

  if (currentPath === "/student-dashboard") {
    return <ProtectedStudentDashboard />
  }

  if (currentPath === "/teacher-dashboard" || currentPath === "/teacher-dashboard/students") {
    return <TeacherDashboard />
  }

  return <HomePage />
}

export default App