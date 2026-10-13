import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import logo from "../Images/Logo.png";
import loginIcon from "../Images/Login Icon.png";
import homeImage from "../Images/Home Image.png";
import homeCharacterGif from "../Video/omnisign_girl_signing.gif";
export default function HomePage() {
    const [showCharacterGif, setShowCharacterGif] = useState(false);
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setShowCharacterGif(true);
            return;
        }
        const timer = window.setTimeout(() => setShowCharacterGif(true), 1900);
        return () => window.clearTimeout(timer);
    }, []);
    return (_jsxs(_Fragment, { children: [_jsxs("header", { className: "site-nav", children: [_jsxs("nav", { "aria-label": "Main navigation", children: [_jsx("img", { className: "site-logo", src: logo, alt: "OmniSign SL logo" }), _jsx("span", { className: "site-name", children: "OminiSign SL" }), _jsx("span", { className: "site-tagline", children: "\u0DC3\u0D82\u0DA5\u0DCF\u0DC0\u0DD9\u0DB1\u0DCA \u0D89\u0D9C\u0DD9\u0DB1\u0DD4\u0DB8\u0DA7" }), _jsxs("div", { className: "nav-links", children: [_jsx("button", { className: "home-nav-button", type: "button", children: _jsx("span", { children: "\u0DB8\u0DD4\u0DBD\u0DCA \u0DB4\u0DD2\u0DA7\u0DD4\u0DC0" }) }), _jsx("button", { className: "about-nav-button", type: "button", children: _jsx("span", { children: "\u0D85\u0DB4 \u0D9C\u0DD0\u0DB1" }) }), _jsx("button", { className: "learn-nav-button", type: "button", children: _jsx("span", { children: "\u0D89\u0D9C\u0DD9\u0DB1 \u0D9C\u0DB1\u0DCA\u0DB1" }) }), _jsx("button", { className: "teachers-nav-button", type: "button", children: _jsx("span", { children: "\u0D9C\u0DD4\u0DBB\u0DD4\u0DC0\u0DBB\u0DD4\u0DB1\u0DCA \u0DC3\u0DB3\u0DC4\u0DCF" }) })] })] }), _jsxs("button", { className: "nav-login-button", type: "button", children: [_jsx("img", { className: "nav-login-icon", src: loginIcon, alt: "" }), _jsx("span", { children: "\u0D87\u0DAD\u0DD4\u0DBD\u0DCA \u0DC0\u0DB1\u0DCA\u0DB1" })] })] }), _jsxs("main", { className: "home-page", children: [_jsx("img", { className: "home-image", src: homeImage, alt: "" }), _jsxs("section", { className: "hero-copy", "aria-label": "Welcome", children: [_jsx("h1", { children: "\u0D86\u0DBA\u0DD4\u0DB6\u0DDD\u0DC0\u0DB1\u0DCA! \uD83D\uDC4B" }), _jsxs("p", { children: ["\u0D85\u0DB4\u0DD2 \u0D91\u0D9A\u0DA7 \u0DC3\u0D82\u0DA5\u0DCF \u0DB7\u0DCF\u0DC2\u0DCF\u0DC0", _jsx("br", {}), "\u0D89\u0D9C\u0DD9\u0DB1 \u0D9C\u0DB1\u0DD2\u0DB8\u0DD4"] }), _jsx("span", { className: "signing-video-wrap", children: _jsx("img", { className: "signing-child", src: showCharacterGif ? homeCharacterGif : undefined, alt: "A child signing in Sinhala Sign Language" }) })] })] })] }));
}
