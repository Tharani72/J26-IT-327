import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import SiteNavbar from "../../../components/navigation/SiteNavbar";
import "./TeacherDashboard.css";
import TeacherStudentList from "./TeacherStudentList";
const teacherNavigationItems = [
    { id: "dashboard", label: "ගුරු උපකරණ පුවරුව" },
    { id: "students", label: "මගේ සිසුන්" },
    { id: "lessons", label: "පාඩම් කළමනාකරණය" },
    { id: "progress", label: "ඉගෙනුම් ප්‍රගතිය" },
    { id: "attention", label: "අවධානය සහ සහභාගීත්වය" },
    { id: "reports", label: "වාර්තා" },
    { id: "settings", label: "සැකසුම්" },
];
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
};
function TeacherNavigationIcon({ name }) {
    switch (name) {
        case "dashboard":
            return _jsxs("svg", { ...iconProps, children: [_jsx("rect", { x: "3", y: "3", width: "7", height: "7", rx: "1.5" }), _jsx("rect", { x: "14", y: "3", width: "7", height: "7", rx: "1.5" }), _jsx("rect", { x: "3", y: "14", width: "7", height: "7", rx: "1.5" }), _jsx("rect", { x: "14", y: "14", width: "7", height: "7", rx: "1.5" })] });
        case "students":
            return _jsxs("svg", { ...iconProps, children: [_jsx("circle", { cx: "9", cy: "8", r: "3.5" }), _jsx("path", { d: "M2.5 20a6.5 6.5 0 0 1 13 0M16 5a3.5 3.5 0 0 1 0 6.8M17 14a6 6 0 0 1 4.5 5.8" })] });
        case "lessons":
            return _jsx("svg", { ...iconProps, children: _jsx("path", { d: "M12 7v14M3 5.5A2.5 2.5 0 0 1 5.5 3H12v18H5.5A2.5 2.5 0 0 1 3 18.5zM21 5.5A2.5 2.5 0 0 0 18.5 3H12v18h6.5a2.5 2.5 0 0 0 2.5-2.5z" }) });
        case "progress":
            return _jsxs("svg", { ...iconProps, children: [_jsx("path", { d: "M3.5 20.5V4M3.5 20.5h17" }), _jsx("path", { d: "m6.5 16 4-4 3 2 5-7" }), _jsx("path", { d: "M15.5 7h3v3" })] });
        case "attention":
            return _jsxs("svg", { ...iconProps, children: [_jsx("path", { d: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" }), _jsx("circle", { cx: "12", cy: "12", r: "3" })] });
        case "reports":
            return _jsxs("svg", { ...iconProps, children: [_jsx("path", { d: "M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" }), _jsx("path", { d: "M14 3v5h5M9 13h6M9 17h6" })] });
        case "settings":
            return _jsxs("svg", { ...iconProps, children: [_jsx("circle", { cx: "12", cy: "12", r: "3" }), _jsx("path", { d: "m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a7.8 7.8 0 0 1-1.6.9l-.3 1.8h-2.8l-.3-1.8a7.8 7.8 0 0 1-1.6-.9l-1.7.6-1.4-2.4 1.4-1.1a7.2 7.2 0 0 1 0-1.9l-1.4-1.1 1.4-2.4 1.7.6a7.8 7.8 0 0 1 1.6-.9l.3-1.8h2.8l.3 1.8a7.8 7.8 0 0 1 1.6.9l1.7-.6 1.4 2.4-1.4 1.1a7.2 7.2 0 0 1-.1 1.8z" })] });
    }
}
export default function TeacherDashboard() {
    const isStudentsPage = window.location.pathname === "/teacher-dashboard/students";
    return (_jsxs(_Fragment, { children: [_jsx(SiteNavbar, { teacherProfile: true }), _jsxs("div", { className: "teacher-dashboard", children: [_jsx("aside", { className: "teacher-dashboard-sidebar", "aria-label": "\u0D9C\u0DD4\u0DBB\u0DD4 \u0D8B\u0DB4\u0D9A\u0DBB\u0DAB \u0DB4\u0DD4\u0DC0\u0DBB\u0DD4\u0DC0", children: _jsx("nav", { className: "teacher-dashboard-navigation", "aria-label": "\u0D9C\u0DD4\u0DBB\u0DD4 \u0D8B\u0DB4\u0D9A\u0DBB\u0DAB \u0DB4\u0DD4\u0DC0\u0DBB\u0DD4\u0DC0", children: teacherNavigationItems.map((item) => {
                                const isActive = isStudentsPage ? item.id === "students" : item.id === "dashboard";
                                return (_jsxs("button", { type: "button", onClick: item.id === "students" ? () => { window.location.href = "/teacher-dashboard/students"; } : item.id === "dashboard" ? () => { window.location.href = "/teacher-dashboard"; } : undefined, className: isActive ? "teacher-dashboard-button is-active" : "teacher-dashboard-button", "aria-current": isActive ? "page" : undefined, children: [_jsx("span", { className: "teacher-dashboard-button-icon", children: _jsx(TeacherNavigationIcon, { name: item.id }) }), _jsx("span", { className: "teacher-dashboard-button-label", children: item.label })] }, item.id));
                            }) }) }), _jsxs("main", { className: "teacher-dashboard-content", "aria-labelledby": isStudentsPage ? "teacher-students-title" : "teacher-dashboard-title", children: [!isStudentsPage && _jsx("section", { className: "teacher-dashboard-banner", "aria-hidden": "true" }), isStudentsPage && _jsx(TeacherStudentList, {})] })] })] }));
}
