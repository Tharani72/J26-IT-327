import HomePage from "./features/home/HomePage"
import StudentDashboard from "./features/tutor-analytics/pages/StudentDashboard"

function App() {
  if (window.location.pathname === "/student-dashboard") {
    return <StudentDashboard />
  }

  return <HomePage />
}

export default App
