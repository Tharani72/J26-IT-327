import { jsx as _jsx } from "react/jsx-runtime";
import HomePage from "./features/home/HomePage";
import StudentDashboard from "./features/tutor-analytics/pages/StudentDashboard";
function App() {
    if (window.location.pathname === "/student-dashboard") {
        return _jsx(StudentDashboard, {});
    }
    return _jsx(HomePage, {});
}
export default App;
