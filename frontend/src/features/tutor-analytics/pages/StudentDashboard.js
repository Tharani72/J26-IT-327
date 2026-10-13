import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import SiteNavbar from "../../../components/navigation/SiteNavbar";
import studentDashboardImage from "./Images/StudentDashboard.png";
import "./StudentDashboard.css";
const sidebarItems = [
    { id: "home", label: "\u0db8\u0dd4\u0dbd\u0dca \u0db4\u0dd2\u0da7\u0dd4\u0dc0", icon: "home" },
    { id: "lessons", label: "\u0db4\u0dcf\u0da9\u0db8\u0dca \u0d89\u0d9c\u0dd9\u0db1\u0dd4\u0db8", icon: "lessons" },
    { id: "my-lessons", label: "\u0db8\u0d9c\u0dda \u0db4\u0dcf\u0da9\u0db8", icon: "my-lessons" },
    { id: "progress", label: "\u0db8\u0d9c\u0dda \u0db4\u0dca\u200d\u0dbb\u0d9c\u0dad\u0dd2\u0dba", icon: "progress" },
    { id: "recommendations", label: "\u0db1\u0dd2\u0dbb\u0dca\u0daf\u0dda\u0dc1", icon: "recommendations" },
    { id: "games", label: "\u0d9a\u0dca\u200d\u0dbb\u0dd3\u0da9\u0dcf \u0dc4\u0dcf \u0d9a\u0da7\u0dba\u0dd4\u0dad\u0dd4", icon: "games" },
    { id: "settings", label: "\u0dc3\u0dd0\u0d9a\u0dc3\u0dd4\u0db8\u0dca", icon: "settings" }
];
const summaryCards = [
    { id: "accuracy", title: "නිවැරදි බව", subtitle: "Accuracy", value: "89%", progress: 89, color: "#20C96B", icon: "target" },
    { id: "attention", title: "අවධානය", subtitle: "Accuracy", value: "77%", progress: 77, color: "#397BFF", icon: "eye" },
    { id: "completed-lessons", title: "සම්පූර්ණ කළ පාඩම්", subtitle: "Completed Lessons", value: "8/10", progress: 80, color: "#FFB800", icon: "book" },
    { id: "overall-progress", title: "සමස්ත ප්‍රගතිය", subtitle: "Overall Progress", value: "82%", progress: 82, color: "#A64DFF", icon: "chart" },
];
function SummaryCardIcon({ icon }) {
    return (_jsxs("svg", { width: "26", height: "26", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [icon === "target" && (_jsxs(_Fragment, { children: [_jsx("circle", { cx: "10", cy: "14", r: "7" }), _jsx("circle", { cx: "10", cy: "14", r: "3" }), _jsx("path", { d: "m10 14 9-9M15 5h4v4" })] })), icon === "eye" && (_jsxs(_Fragment, { children: [_jsx("path", { d: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" }), _jsx("circle", { cx: "12", cy: "12", r: "3" })] })), icon === "book" && (_jsxs(_Fragment, { children: [_jsx("path", { d: "M12 6.5C10.4 4.9 8 4 3 4v15c4.8 0 7.3.8 9 2.5 1.7-1.7 4.2-2.5 9-2.5V4c-5 0-7.4.9-9 2.5Z" }), _jsx("path", { d: "M12 6.5v15M6 8h3M15 8h3M6 12h3M15 12h3" })] })), icon === "chart" && (_jsx(_Fragment, { children: _jsx("path", { d: "M4 20V11h4v9M10 20V6h4v14M16 20V3h4v17M3 20h18" }) }))] }));
}
const learningProgressData = [
    { week: "\u0dc3\u0dad\u0dd2\u0020\u0031", accuracy: 40, attention: 28, proficiency: 18 },
    { week: "\u0dc3\u0dad\u0dd2\u0020\u0032", accuracy: 60, attention: 48, proficiency: 35 },
    { week: "\u0dc3\u0dad\u0dd2\u0020\u0033", accuracy: 75, attention: 60, proficiency: 44 },
    { week: "\u0dc3\u0dad\u0dd2\u0020\u0034", accuracy: 80, attention: 64, proficiency: 45 },
    { week: "\u0dc3\u0dad\u0dd2\u0020\u0035", accuracy: 89, attention: 72, proficiency: 54 },
    { week: "\u0dc3\u0dad\u0dd2\u0020\u0036", accuracy: 91, attention: 73, proficiency: 54 },
    { week: "\u0dc3\u0dad\u0dd2\u0020\u0037", accuracy: 100, attention: 82, proficiency: 63 },
];
const learningProgressSeries = [
    { key: "accuracy", label: "\u0db1\u0dd2\u0dc0\u0dd0\u0dbb\u0daf\u0dd2\u0020\u0db6\u0dc0", color: "#10C98A" },
    { key: "attention", label: "\u0d85\u0dc0\u0db0\u0dcf\u0db1\u0dba\u0020\u0028\u0045\u0079\u0065\u0020\u0047\u0061\u007a\u0065\u0029", color: "#3478FF" },
    { key: "proficiency", label: "\u0db4\u0dca\u200d\u0dbb\u0dad\u0dd2\u0da0\u0dcf\u0dbb\u0020\u0d9a\u0dcf\u0dbd\u0dba", color: "#8B3DFF" },
];
function chartY(value) {
    return 172 - (value / 100) * 164;
}
function chartX(index) {
    return ((index + 0.5) * 700) / learningProgressData.length;
}
function weeklyChartPath(key) {
    return learningProgressData.map((datum, index) => {
        const command = index === 0 ? "M" : "L";
        return command + " " + chartX(index) + " " + chartY(datum[key]);
    }).join(" ");
}
function LearningProgressChart() {
    const axisValues = [100, 80, 60, 40, 20, 0];
    return (_jsxs("section", { className: "learning-progress-card", "aria-labelledby": "learning-progress-title", children: [_jsxs("header", { className: "learning-progress-header", children: [_jsxs("div", { className: "learning-progress-heading", children: [_jsxs("svg", { className: "learning-progress-heading-icon", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: [_jsx("rect", { x: "3.5", y: "5", width: "17", height: "16", rx: "2" }), _jsx("path", { d: "M8 3v4M16 3v4M4 10h16M7.5 16l3-3 2.5 2 4-4" })] }), _jsx("h2", { id: "learning-progress-title", children: "\u0db4\u0dc3\u0dd4\u0d9c\u0dd2\u0dba\u0020\u0d89\u0d9c\u0dd9\u0db1\u0dd4\u0db8\u0dca\u0020\u0db4\u0dca\u200d\u0dbb\u0d9c\u0dad\u0dd2\u0dba" })] }), _jsx("div", { className: "learning-progress-legend", "aria-label": "Chart legend", children: learningProgressSeries.map((series) => (_jsxs("span", { className: "learning-progress-legend-item", children: [_jsx("span", { className: "learning-progress-legend-swatch", style: { backgroundColor: series.color } }), series.label] }, series.key))) })] }), _jsxs("div", { className: "learning-progress-plot", role: "group", "aria-label": "Learning progress percentages across seven weeks", children: [_jsx("div", { className: "learning-progress-y-axis", "aria-hidden": "true", children: axisValues.map((value) => _jsxs("span", { children: [value, "%"] }, value)) }), _jsxs("div", { className: "learning-progress-plot-area", "aria-hidden": "true", children: [_jsxs("svg", { viewBox: "0 0 700 180", preserveAspectRatio: "none", children: [axisValues.map((value) => (_jsx("line", { x1: "0", x2: "700", y1: chartY(value), y2: chartY(value), className: "learning-progress-grid-line" }, value))), learningProgressSeries.map((series) => (_jsx("path", { d: weeklyChartPath(series.key), fill: "none", stroke: series.color, strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round" }, series.key)))] }), _jsx("div", { className: "learning-progress-markers", "aria-hidden": "true", children: learningProgressSeries.flatMap((series) => learningProgressData.map((datum, index) => (_jsx("span", { className: "learning-progress-marker", style: {
                                        borderColor: series.color,
                                        left: ((index + 0.5) / learningProgressData.length) * 100 + "%",
                                        top: (chartY(datum[series.key]) / 180) * 100 + "%",
                                    } }, series.key + "-" + index)))) })] }), _jsx("div", { className: "learning-progress-x-axis", "aria-hidden": "true", children: learningProgressData.map((datum) => _jsx("span", { children: datum.week }, datum.week)) })] })] }));
}
const eyeGazeMetrics = [
    { label: "කාර්යයේ නිරත වීම", value: "82%", icon: "target", tone: "green" },
    { label: "වෙනතකට බැලීම්", value: "3 වාර", icon: "eye-off", tone: "pink" },
    { label: "බැලීමේ කාලය", value: "4.8 තත්පර", icon: "clock", tone: "blue" },
    { label: "ප්‍රතිචාර කාලය", value: "2.3 තත්පර", icon: "zap", tone: "blue" },
];
function EyeGazeIcon({ name }) {
    return (_jsxs("svg", { width: "22", height: "22", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.9", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [name === "eye" && (_jsxs(_Fragment, { children: [_jsx("path", { d: "M2.5 12s3.3-7 9.5-7 9.5 7 9.5 7-3.3 7-9.5 7-9.5-7-9.5-7Z" }), _jsx("circle", { cx: "12", cy: "12", r: "3" })] })), name === "target" && (_jsxs(_Fragment, { children: [_jsx("circle", { cx: "12", cy: "12", r: "8.5" }), _jsx("circle", { cx: "12", cy: "12", r: "4.5" }), _jsx("path", { d: "m9.5 12 1.7 1.7 4-4.2" })] })), name === "eye-off" && (_jsxs(_Fragment, { children: [_jsx("path", { d: "M3 3l18 18" }), _jsx("path", { d: "M10.6 10.6a2 2 0 0 0 2.8 2.8" }), _jsx("path", { d: "M9.9 5.2A10.8 10.8 0 0 1 12 5c5.2 0 9 4.3 10 7-.4 1.2-1.2 2.4-2.4 3.4M6.6 6.6C4.4 8 2.8 10.1 2 12c.9 2.7 4.2 7 10 7 1 0 2-.2 2.8-.5" })] })), name === "clock" && (_jsxs(_Fragment, { children: [_jsx("circle", { cx: "12", cy: "12", r: "9" }), _jsx("path", { d: "M12 7v5l3.5 2" })] })), name === "zap" && _jsx("path", { d: "M13 2 4 14h7l-1 8 10-13h-7l0-7Z" }), name === "smile" && (_jsxs(_Fragment, { children: [_jsx("circle", { cx: "12", cy: "12", r: "9.5" }), _jsx("path", { d: "M8.5 10h.01M15.5 10h.01M8 14s1.5 2.5 4 2.5 4-2.5 4-2.5" })] })), name === "arrow" && _jsx("path", { d: "M5 12h14m-6-6 6 6-6 6" })] }));
}
function EyeGazeAnalytics() {
    const circumference = 2 * Math.PI * 48;
    return (_jsxs("section", { className: "eye-gaze-analytics", "aria-labelledby": "eye-gaze-title", children: [_jsxs("header", { className: "eye-gaze-header", children: [_jsxs("div", { className: "eye-gaze-title-group", children: [_jsx("span", { className: "eye-gaze-header-icon", children: _jsx(EyeGazeIcon, { name: "eye" }) }), _jsxs("div", { className: "eye-gaze-heading-copy", children: [_jsx("h2", { id: "eye-gaze-title", children: "\u0D85\u0DC0\u0DB0\u0DCF\u0DB1\u0DBA\u0DDA \u0DAD\u0DAD\u0DCA\u0DAD\u0DCA\u0DC0\u0DBA" }), _jsx("span", { children: "(Eye Gaze Analytics)" })] })] }), _jsxs("button", { className: "eye-gaze-details-button", type: "button", children: [_jsx("span", { children: "\u0DC3\u0DC0\u0DD2\u0DC3\u0DCA\u0DAD\u0DBB \u0DB6\u0DBD\u0DB1\u0DCA\u0DB1" }), _jsx(EyeGazeIcon, { name: "arrow" })] })] }), _jsxs("div", { className: "eye-gaze-content", children: [_jsxs("div", { className: "eye-gaze-overview", children: [_jsxs("div", { className: "eye-gaze-ring", role: "progressbar", "aria-label": "Eye gaze attention", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": 77, children: [_jsxs("svg", { viewBox: "0 0 120 120", "aria-hidden": "true", children: [_jsx("circle", { className: "eye-gaze-ring-track", cx: "60", cy: "60", r: "48" }), _jsx("circle", { className: "eye-gaze-ring-progress", cx: "60", cy: "60", r: "48", strokeDasharray: circumference, strokeDashoffset: circumference * 0.23, transform: "rotate(-90 60 60)" })] }), _jsxs("div", { className: "eye-gaze-ring-copy", children: [_jsx("strong", { children: "77%" }), _jsx("span", { children: "\u0D85\u0DC0\u0DB0\u0DCF\u0DB1\u0DBA" })] })] }), _jsxs("span", { className: "eye-gaze-status", children: [_jsx(EyeGazeIcon, { name: "smile" }), _jsx("span", { children: "\u0DC4\u0DDC\u0DB3 \u0D85\u0DC0\u0DB0\u0DCF\u0DB1\u0DBA\u0D9A\u0DCA" })] })] }), _jsx("div", { className: "eye-gaze-metrics", "aria-label": "Eye gaze analytics metrics", children: eyeGazeMetrics.map((metric) => (_jsxs("article", { className: "eye-gaze-metric-card", children: [_jsx("span", { className: `eye-gaze-metric-icon eye-gaze-metric-icon--${metric.tone}`, children: _jsx(EyeGazeIcon, { name: metric.icon }) }), _jsxs("span", { className: "eye-gaze-metric-copy", children: [_jsx("span", { className: "eye-gaze-metric-label", children: metric.label }), _jsx("strong", { className: "eye-gaze-metric-value", children: metric.value })] })] }, metric.label))) })] })] }));
}
const recentLessons = [
    { id: "sign-letters-1", title: "සංඥා අකුරු - 1", completedAt: "2026-10-05", completion: "92%", artwork: "single-hand" },
    { id: "sign-letters-2", title: "සංඥා අකුරු - 2", completedAt: "2026-10-03", completion: "85%", artwork: "paired-hands" },
    { id: "animals-1", title: "සතුන් - 1", completedAt: "2026-09-28", completion: "78%", artwork: "dog" },
    { id: "fruits-1", title: "පලතුරු - 1", completedAt: "2026-09-25", completion: "88%", artwork: "apple" },
];
function ActivitySectionIcon({ name }) {
    return (_jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.9", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [name === "clock" && (_jsxs(_Fragment, { children: [_jsx("circle", { cx: "12", cy: "12", r: "9" }), _jsx("path", { d: "M12 7v5l3.5 2" })] })), name === "star" && _jsx("path", { d: "m12 2.8 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3-5.6-3-5.6 3 1.1-6.3L3 9.4l6.2-.9L12 2.8Z", fill: "currentColor" }), name === "arrow" && _jsx("path", { d: "M5 12h14m-6-6 6 6-6 6" })] }));
}
function LessonIllustration({ kind }) {
    const handShape = "M34 94 28 78c-2-6 0-11 4-12 4-1 7 2 9 7l-1-28c0-5 3-8 7-7 4 0 6 3 6 8l1-18c0-5 3-8 7-7 5 1 6 4 5 9l-1 19 4-15c1-5 5-7 9-5 4 2 4 5 2 10l-5 15 7-9c3-4 7-4 10-1 3 3 2 6 0 10l-8 15c-5 9-12 14-23 15l-17 1c-5 0-9-2-10-6Z";
    return (_jsxs("svg", { className: "lesson-illustration-svg", viewBox: "0 0 160 110", "aria-hidden": "true", children: [_jsx("ellipse", { cx: "80", cy: "98", rx: "48", ry: "7", fill: "rgba(35, 77, 126, 0.1)" }), (kind === "single-hand" || kind === "paired-hands") && (_jsxs(_Fragment, { children: [kind === "single-hand" ? (_jsxs("g", { transform: "translate(22 1)", children: [_jsx("path", { d: handShape, fill: "#ffc99f", stroke: "#df956a", strokeWidth: "2", strokeLinejoin: "round" }), _jsx("path", { d: "M37 83c12 6 27 6 41 0l5 10c-14 8-31 9-43 1Z", fill: "#4f8df7" })] })) : (_jsxs(_Fragment, { children: [_jsxs("g", { transform: "translate(-10 12) scale(.82)", children: [_jsx("path", { d: handShape, fill: "#ffc99f", stroke: "#df956a", strokeWidth: "2", strokeLinejoin: "round" }), _jsx("path", { d: "M37 83c12 6 27 6 41 0l5 10c-14 8-31 9-43 1Z", fill: "#4f8df7" })] }), _jsxs("g", { transform: "translate(160 0) scale(-1 1) translate(-10 12) scale(.82)", children: [_jsx("path", { d: handShape, fill: "#ffd6a8", stroke: "#df956a", strokeWidth: "2", strokeLinejoin: "round" }), _jsx("path", { d: "M37 83c12 6 27 6 41 0l5 10c-14 8-31 9-43 1Z", fill: "#ffb84d" })] })] })), _jsx("path", { d: "m22 30 3 5 5 1-5 2-2 5-2-5-5-2 5-1 1-5ZM132 24l2 4 4 1-4 2-1 4-2-4-4-2 4-1 1-4Z", fill: "#ffd34e" })] })), kind === "dog" && (_jsxs(_Fragment, { children: [_jsx("path", { d: "M48 43 39 31c-5-8 2-14 10-9l13 10M112 43l9-12c5-8-2-14-10-9L98 32", fill: "#a95e42", stroke: "#8c4935", strokeWidth: "3", strokeLinejoin: "round" }), _jsx("path", { d: "M49 44c0-17 14-27 31-27s31 10 31 27v20c0 19-13 30-31 30S49 83 49 64Z", fill: "#d99460", stroke: "#b56d47", strokeWidth: "3" }), _jsx("ellipse", { cx: "80", cy: "67", rx: "20", ry: "15", fill: "#ffe4c5" }), _jsx("circle", { cx: "68", cy: "52", r: "3", fill: "#352a2b" }), _jsx("circle", { cx: "92", cy: "52", r: "3", fill: "#352a2b" }), _jsx("ellipse", { cx: "80", cy: "63", rx: "5", ry: "4", fill: "#352a2b" }), _jsx("path", { d: "M80 67v5m0 0c-4 5-9 4-12 1m12-1c4 5 9 4 12 1", fill: "none", stroke: "#74433b", strokeWidth: "2.5", strokeLinecap: "round" }), _jsx("path", { d: "M61 88c10 6 28 6 38 0", fill: "none", stroke: "#4d9ee8", strokeWidth: "7", strokeLinecap: "round" }), _jsx("circle", { cx: "105", cy: "88", r: "4", fill: "#ffd34e" })] })), kind === "apple" && (_jsxs(_Fragment, { children: [_jsx("path", { d: "M80 37c-19-16-43-3-40 21 3 23 18 39 39 34 21 5 36-11 39-34 3-24-21-37-38-21Z", fill: "#fa6473", stroke: "#df475b", strokeWidth: "3" }), _jsx("path", { d: "M80 38c-1-10 2-17 8-22", fill: "none", stroke: "#80513b", strokeWidth: "5", strokeLinecap: "round" }), _jsx("path", { d: "M86 23c13-12 25-5 24 5-11 5-20 4-24-5Z", fill: "#59c889", stroke: "#3eaa70", strokeWidth: "2" }), _jsx("path", { d: "M60 55c-2 10 2 20 8 25", fill: "none", stroke: "#ffb1a9", strokeWidth: "4", strokeLinecap: "round" }), _jsx("circle", { cx: "48", cy: "36", r: "4", fill: "#ffd34e" }), _jsx("path", { d: "m114 66 3 4 5 1-5 2-2 5-2-5-5-2 5-1 1-4Z", fill: "#ffd34e" })] }))] }));
}
function RecentLearningActivity() {
    return (_jsxs("section", { className: "recent-learning-section", "aria-labelledby": "recent-learning-title", children: [_jsxs("header", { className: "bottom-section-header", children: [_jsxs("div", { className: "bottom-section-heading", children: [_jsx("span", { className: "recent-learning-heading-icon", children: _jsx(ActivitySectionIcon, { name: "clock" }) }), _jsx("h2", { id: "recent-learning-title", children: "\u0DB8\u0DD1\u0DAD\u0D9A\u0DAF\u0DD3 \u0D89\u0D9C\u0DD9\u0DB1\u0DD4\u0DB8\u0DCA \u0DB4\u0DCF\u0DA9\u0DB8\u0DCA" })] }), _jsxs("button", { className: "recent-learning-all-button", type: "button", children: [_jsx("span", { children: "\u0DC3\u0DD2\u0DBA\u0DBD\u0DCA\u0DBD \u0DB6\u0DBD\u0DB1\u0DCA\u0DB1" }), _jsx(ActivitySectionIcon, { name: "arrow" })] })] }), _jsx("div", { className: "recent-lesson-grid", children: recentLessons.map((lesson) => (_jsxs("article", { className: "recent-lesson-card", children: [_jsx("div", { className: `recent-lesson-artwork recent-lesson-artwork--${lesson.artwork}`, children: _jsx(LessonIllustration, { kind: lesson.artwork }) }), _jsxs("div", { className: "recent-lesson-copy", children: [_jsx("h3", { children: lesson.title }), _jsxs("div", { className: "recent-lesson-meta", children: [_jsx("time", { dateTime: lesson.completedAt, children: lesson.completedAt }), _jsx("span", { className: "recent-lesson-completion", children: lesson.completion })] })] })] }, lesson.id))) })] }));
}
function RecommendedLearningActivity() {
    return (_jsxs("aside", { className: "recommended-lesson-section", "aria-labelledby": "recommended-lesson-title", children: [_jsxs("header", { className: "recommended-lesson-header", children: [_jsx("span", { className: "recommended-lesson-star", children: _jsx(ActivitySectionIcon, { name: "star" }) }), _jsx("h2", { id: "recommended-lesson-title", children: "\u0D94\u0DB6\u0DA7 \u0D9C\u0DD0\u0DC5\u0DB4\u0DD9\u0DB1 \u0D8A\u0DC5\u0D9F \u0DB4\u0DCF\u0DA9\u0DB8" })] }), _jsxs("div", { className: "recommended-lesson-panel", children: [_jsx("div", { className: "recommended-lesson-artwork", children: _jsx(LessonIllustration, { kind: "paired-hands" }) }), _jsxs("div", { className: "recommended-lesson-copy", children: [_jsx("h3", { children: "\u0DC3\u0D82\u0DA5\u0DCF \u0D85\u0D9A\u0DD4\u0DBB\u0DD4 - 2" }), _jsx("p", { children: "\u0D94\u0DB6\u0D9C\u0DDA \u0D89\u0DAF\u0DD2\u0DBB\u0DD2\u0DB4\u0DAD\u0DCA \u0D9A\u0DD2\u0DBB\u0DD3\u0DB8 \u0D85\u0DB1\u0DD4\u0DC0 \u0DC3\u0D9A\u0DC3\u0DCA \u0D9A\u0DC5 \u0DB4\u0DCF\u0DA9\u0DB8\u0D9A\u0DD2." })] })] }), _jsxs("button", { className: "recommended-lesson-button", type: "button", children: [_jsx("span", { children: "\u0DB4\u0DCF\u0DA9\u0DB8 \u0D86\u0DBB\u0DB8\u0DCA\u0DB7 \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1" }), _jsx(ActivitySectionIcon, { name: "arrow" })] })] }));
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
};
function SidebarIcon({ name }) {
    switch (name) {
        case "home":
            return (_jsxs("svg", { ...iconProps, children: [_jsx("path", { d: "m3 10 9-7 9 7" }), _jsx("path", { d: "M5.5 9.5V21h13V9.5" }), _jsx("path", { d: "M9 21v-7h6v7" })] }));
        case "lessons":
            return (_jsxs("svg", { ...iconProps, children: [_jsx("path", { d: "M12 7v14" }), _jsx("path", { d: "M3 5.5A2.5 2.5 0 0 1 5.5 3H12v18H5.5A2.5 2.5 0 0 1 3 18.5z" }), _jsx("path", { d: "M21 5.5A2.5 2.5 0 0 0 18.5 3H12v18h6.5a2.5 2.5 0 0 0 2.5-2.5z" })] }));
        case "my-lessons":
            return (_jsxs("svg", { ...iconProps, children: [_jsx("rect", { x: "5", y: "3", width: "14", height: "18", rx: "2" }), _jsx("path", { d: "M9 8h6M9 12h3" }), _jsx("path", { d: "m13 16 2 2 4-4" })] }));
        case "progress":
            return (_jsxs("svg", { ...iconProps, children: [_jsx("path", { d: "M4 19V5M4 19h17" }), _jsx("path", { d: "m7 15 4-4 3 2 5-6" }), _jsx("path", { d: "M15 7h4v4" })] }));
        case "recommendations":
            return (_jsxs("svg", { ...iconProps, children: [_jsx("path", { d: "M9 18h6M10 21h4" }), _jsx("path", { d: "M8.5 14.5A7 7 0 1 1 15.5 14.5c-.9.7-1.3 1.4-1.5 2.5h-4c-.2-1.1-.6-1.8-1.5-2.5z" }), _jsx("path", { d: "M12 2v2M4.9 4.9l1.4 1.4M19.1 4.9l-1.4 1.4" })] }));
        case "games":
            return (_jsxs("svg", { ...iconProps, children: [_jsx("path", { d: "M7 8h10a4 4 0 0 1 3.8 5.2l-1.2 4a2.5 2.5 0 0 1-4.1 1.1L13 16h-2l-2.5 2.3a2.5 2.5 0 0 1-4.1-1.1l-1.2-4A4 4 0 0 1 7 8z" }), _jsx("path", { d: "M7 11v4M5 13h4M16.5 12h.01M18.5 14h.01" })] }));
        case "settings":
            return (_jsxs("svg", { ...iconProps, children: [_jsx("circle", { cx: "12", cy: "12", r: "3" }), _jsx("path", { d: "m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a7.8 7.8 0 0 1-1.6.9l-.3 1.8h-2.8l-.3-1.8a7.8 7.8 0 0 1-1.6-.9l-1.7.6-1.4-2.4 1.4-1.1a7.2 7.2 0 0 1 0-1.9l-1.4-1.1 1.4-2.4 1.7.6a7.8 7.8 0 0 1 1.6-.9l.3-1.8h2.8l.3 1.8a7.8 7.8 0 0 1 1.6.9l1.7-.6 1.4 2.4-1.4 1.1a7.2 7.2 0 0 1-.1 1.8z" })] }));
        default:
            return null;
    }
}
export default function StudentDashboard() {
    return (_jsxs(_Fragment, { children: [_jsx(SiteNavbar, { studentProfile: true }), _jsxs("div", { className: "student-dashboard", children: [_jsx("aside", { className: "student-dashboard-sidebar", "aria-label": "Student dashboard sidebar", children: _jsx("nav", { className: "student-dashboard-navigation", "aria-label": "Student dashboard", children: sidebarItems.map((item) => {
                                const isActive = item.id === "home";
                                return (_jsxs("button", { type: "button", className: isActive ? "student-dashboard-button is-active" : "student-dashboard-button", "aria-current": isActive ? "page" : undefined, children: [_jsx("span", { className: "student-dashboard-button-icon", children: _jsx(SidebarIcon, { name: item.icon }) }), _jsx("span", { className: "student-dashboard-button-label", children: item.label })] }, item.id));
                            }) }) }), _jsxs("main", { className: "student-dashboard-content", children: [_jsx("img", { className: "student-dashboard-image", src: studentDashboardImage, alt: "OmniSign SL student dashboard illustration" }), _jsx("section", { className: "student-dashboard-summary-grid", "aria-label": "Student learning summary", children: summaryCards.map((card) => (_jsxs("article", { className: "student-summary-card", children: [_jsxs("div", { className: "student-summary-card-main", children: [_jsx("span", { className: "student-summary-card-icon", style: { backgroundColor: card.color }, "aria-hidden": "true", children: _jsx(SummaryCardIcon, { icon: card.icon }) }), _jsxs("div", { className: "student-summary-card-copy", children: [_jsx("h2", { className: "student-summary-card-title", children: card.title }), _jsx("p", { className: "student-summary-card-subtitle", children: card.subtitle }), _jsx("strong", { className: "student-summary-card-value", children: card.value })] })] }), _jsx("div", { className: "student-summary-card-progress", role: "progressbar", "aria-label": card.title + " " + card.subtitle, "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": card.progress, style: { borderColor: card.color }, children: _jsx("span", { className: "student-summary-card-progress-fill", style: { width: card.progress + "%", backgroundColor: card.color } }) })] }, card.id))) }), _jsxs("div", { className: "student-dashboard-analytics-row", children: [_jsx(LearningProgressChart, {}), _jsx(EyeGazeAnalytics, {})] }), _jsxs("div", { className: "student-dashboard-bottom-row", children: [_jsx(RecentLearningActivity, {}), _jsx(RecommendedLearningActivity, {})] })] })] })] }));
}
