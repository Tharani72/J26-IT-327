import { jsx as _jsx } from "react/jsx-runtime";
import HomePage from "./features/home/HomePage";
import StudentDashboard from "./features/tutor-analytics/pages/StudentDashboard";
import TeacherDashboard from "./features/tutor-analytics/pages/TeacherDashboard";
import LoginPage from "./components/common/LoginPage";
function App() {
    const currentPath = window.location.pathname;
    if (currentPath === "/login") {
        return _jsx(LoginPage, {});
    }
    if (currentPath === "/student-dashboard") {
        return _jsx(StudentDashboard, {});
    }
    if (currentPath === "/teacher-dashboard" || currentPath === "/teacher-dashboard/students") {
        return _jsx(TeacherDashboard, {});
    }
    return _jsx(HomePage, {});
}
export default App;
