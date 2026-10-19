import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { AuthNotConfiguredError, signInWithRole, } from "../../services/authService";
const roleContent = {
    student: {
        heading: "ශිෂ්‍ය පිවිසුම",
        description: "ඔබගේ ඉගෙනුම් ගිණුමට පිවිසෙන්න.",
        identifierLabel: "ශිෂ්‍ය හැඳුනුම් අංකය / විද්‍යුත් තැපැල් ලිපිනය",
    },
    teacher: {
        heading: "ගුරු පිවිසුම",
        description: "ඔබගේ ගුරු ගිණුමට පිවිසෙන්න.",
        identifierLabel: "විද්‍යුත් තැපැල් ලිපිනය",
    },
    parent: {
        heading: "දෙමාපිය පිවිසුම",
        description: "ඔබගේ දෙමාපිය ගිණුමට පිවිසෙන්න.",
        identifierLabel: "විද්‍යුත් තැපැල් ලිපිනය",
    },
    admin: {
        heading: "පරිපාලක පිවිසුම",
        description: "පරිපාලක පිවිසුම් තොරතුරු ඇතුළත් කරන්න.",
        identifierLabel: "විද්‍යුත් තැපැල් ලිපිනය",
    },
};
const messages = {
    required: "කරුණාකර මෙම තොරතුර ඇතුළත් කරන්න.",
    invalidEmail: "කරුණාකර නිවැරදි විද්‍යුත් තැපැල් ලිපිනයක් ඇතුළත් කරන්න.",
    incorrectCredentials: "ඔබ ඇතුළත් කළ තොරතුරු නිවැරදි නොවේ. නැවත උත්සාහ කරන්න.",
    loginFailure: "පිවිසීමේදී ගැටලුවක් ඇති විය. නැවත උත්සාහ කරන්න.",
    loading: "පිවිසෙමින්...",
    authUnavailable: "සත්‍ය පිවිසුම් සේවාව තවම සම්බන්ධ කර නැත. මෙම තිරය දැනට අතුරුමුහුණත් පරීක්ෂාව සඳහා පමණි.",
    forgotUnavailable: "මුරපදය නැවත සැකසීමේ සේවාව තවම සම්බන්ධ කර නැත.",
};
function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
function PasswordVisibilityIcon({ visible }) {
    return (_jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", "aria-hidden": "true", children: visible ? (_jsxs(_Fragment, { children: [_jsx("path", { d: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" }), _jsx("circle", { cx: "12", cy: "12", r: "3" })] })) : (_jsxs(_Fragment, { children: [_jsx("path", { d: "m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" }), _jsx("path", { d: "M9.9 5.2A11 11 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-3.1 4" }), _jsx("path", { d: "M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7c1 0 2-.2 2.9-.5" })] })) }));
}
export default function LoginForm({ role, onBack }) {
    const content = roleContent[role];
    const isStudent = role === "student";
    const [studentId, setStudentId] = useState("");
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [feedback, setFeedback] = useState(null);
    const [forgotNotice, setForgotNotice] = useState("");
    async function handleSubmit(event) {
        event.preventDefault();
        setFeedback(null);
        setForgotNotice("");
        const nextErrors = {};
        const normalizedStudentId = studentId.trim();
        const normalizedIdentifier = identifier.trim();
        if (isStudent && !normalizedStudentId) {
            nextErrors.studentId = messages.required;
        }
        if (!normalizedIdentifier) {
            nextErrors.identifier = messages.required;
        }
        else if (!isValidEmail(normalizedIdentifier)) {
            nextErrors.identifier = messages.invalidEmail;
        }
        if (!password) {
            nextErrors.password = messages.required;
        }
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0)
            return;
        setIsLoading(true);
        try {
            await signInWithRole({ role, identifier: normalizedIdentifier, password, studentId: isStudent ? normalizedStudentId : undefined });
        }
        catch (error) {
            const errorCode = typeof error === "object" && error !== null && "code" in error
                ? error.code
                : undefined;
            if (error instanceof AuthNotConfiguredError) {
                setFeedback({ kind: "info", message: messages.authUnavailable });
            }
            else if (errorCode === "INVALID_CREDENTIALS") {
                setFeedback({ kind: "error", message: messages.incorrectCredentials });
            }
            else {
                setFeedback({ kind: "error", message: messages.loginFailure });
            }
        }
        finally {
            setIsLoading(false);
        }
    }
    return (_jsxs("section", { className: "login-form-step", "aria-labelledby": "login-form-heading", children: [_jsxs("button", { className: "login-back-button", type: "button", onClick: onBack, children: [_jsx("span", { "aria-hidden": "true", children: "\u2190" }), "\u0D86\u0DB4\u0DC3\u0DD4 \u0DBA\u0DB1\u0DCA\u0DB1"] }), _jsxs("div", { className: "login-section-heading login-form-heading", children: [_jsx("span", { className: "login-eyebrow", children: "OmniSign SL" }), _jsx("h1", { id: "login-form-heading", children: content.heading }), _jsx("p", { children: content.description })] }), _jsxs("form", { className: "login-form", noValidate: true, onSubmit: handleSubmit, children: [isStudent && (_jsxs("div", { className: "login-field", children: [_jsx("label", { htmlFor: "login-student-id", children: content.identifierLabel.split(" / ")[0] }), _jsx("input", { id: "login-student-id", type: "text", autoComplete: "username", value: studentId, onChange: (event) => {
                                    setStudentId(event.target.value);
                                    setErrors((current) => ({ ...current, studentId: undefined }));
                                    setFeedback(null);
                                }, placeholder: content.identifierLabel.split(" / ")[0], "aria-invalid": Boolean(errors.studentId), "aria-describedby": errors.studentId ? "login-student-id-error" : undefined }), errors.studentId && _jsx("p", { className: "login-field-error", id: "login-student-id-error", children: errors.studentId })] })), _jsxs("div", { className: "login-field", children: [_jsx("label", { htmlFor: "login-identifier", children: isStudent ? content.identifierLabel.split(" / ")[1] : content.identifierLabel }), _jsx("input", { id: "login-identifier", type: "email", inputMode: "email", autoComplete: isStudent ? "username" : "email", value: identifier, onChange: (event) => {
                                    setIdentifier(event.target.value);
                                    setErrors((current) => ({ ...current, identifier: undefined }));
                                    setFeedback(null);
                                }, placeholder: isStudent ? content.identifierLabel.split(" / ")[1] : content.identifierLabel, "aria-invalid": Boolean(errors.identifier), "aria-describedby": errors.identifier ? "login-identifier-error" : undefined }), errors.identifier && _jsx("p", { className: "login-field-error", id: "login-identifier-error", children: errors.identifier })] }), _jsxs("div", { className: "login-field", children: [_jsx("label", { htmlFor: "login-password", children: "\u0DB8\u0DD4\u0DBB\u0DB4\u0DAF\u0DBA" }), _jsxs("div", { className: "login-password-control", children: [_jsx("input", { id: "login-password", type: passwordVisible ? "text" : "password", autoComplete: "current-password", value: password, onChange: (event) => {
                                            setPassword(event.target.value);
                                            setErrors((current) => ({ ...current, password: undefined }));
                                            setFeedback(null);
                                        }, placeholder: "\u0DB8\u0DD4\u0DBB\u0DB4\u0DAF\u0DBA", "aria-invalid": Boolean(errors.password), "aria-describedby": errors.password ? "login-password-error" : undefined }), _jsx("button", { className: "login-password-toggle", type: "button", "aria-label": passwordVisible ? "මුරපදය සඟවන්න" : "මුරපදය පෙන්වන්න", title: passwordVisible ? "මුරපදය සඟවන්න" : "මුරපදය පෙන්වන්න", onClick: () => setPasswordVisible((visible) => !visible), children: _jsx(PasswordVisibilityIcon, { visible: passwordVisible }) })] }), errors.password && _jsx("p", { className: "login-field-error", id: "login-password-error", children: errors.password })] }), isStudent && (_jsx("div", { className: "login-forgot-row", children: _jsx("button", { className: "login-text-button", type: "button", onClick: () => setForgotNotice(messages.forgotUnavailable), children: "\u0DB8\u0DD4\u0DBB\u0DB4\u0DAF\u0DBA \u0D85\u0DB8\u0DAD\u0D9A\u0DAF?" }) })), forgotNotice && _jsx("p", { className: "login-form-notice", role: "status", children: forgotNotice }), feedback && (_jsxs("div", { className: "login-feedback login-feedback--" + feedback.kind, role: feedback.kind === "error" ? "alert" : "status", children: [_jsx("p", { children: feedback.message }), feedback.detail && _jsx("p", { children: feedback.detail })] })), _jsxs("button", { className: "login-primary-button", type: "submit", disabled: isLoading, children: [isLoading ? messages.loading : "ඇතුල්වන්න", !isLoading && _jsx("span", { "aria-hidden": "true", children: "\u2192" })] })] })] }));
}
