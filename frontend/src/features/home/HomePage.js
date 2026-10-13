import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import Footer from "../../components/common/Footer";
import SiteNavbar from "../../components/navigation/SiteNavbar";
import { HomeLanguageProvider, useHomeLanguage } from "../../i18n/HomeLanguage";
import { homeTranslations } from "./homeTranslations";
import AIStoriesSection from "./components/AIStoriesSection";
import EyeGazeSection from "./components/EyeGazeSection";
import HeroSection from "./components/HeroSection";
import SignLanguageSection from "./components/SignLanguageSection";
import SmartGloveSection from "./components/SmartGloveSection";
export default function HomePage() {
    return (_jsx(HomeLanguageProvider, { children: _jsx(HomePageContent, {}) }));
}
function HomePageContent() {
    const { language } = useHomeLanguage();
    const copy = homeTranslations[language];
    const htmlLanguage = language === "si" ? "si-LK" : "en";
    useEffect(() => {
        const showcase = document.querySelector(".home-feature-showcase");
        if (!showcase || !("IntersectionObserver" in window))
            return;
        const sections = showcase.querySelectorAll(".home-feature-section");
        showcase.classList.add("home-feature-showcase--reveal-enabled");
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -36px 0px" });
        sections.forEach((section) => observer.observe(section));
        return () => observer.disconnect();
    }, []);
    return (_jsxs(_Fragment, { children: [_jsx(SiteNavbar, {}), _jsx("main", { className: "home-page", lang: htmlLanguage, children: _jsx(HeroSection, { copy: copy.hero }) }), _jsx("section", { className: "home-feature-showcase", "aria-label": copy.showcase.ariaLabel, lang: htmlLanguage, children: _jsxs("div", { className: "home-feature-showcase-inner", children: [_jsx(SignLanguageSection, { copy: copy.showcase.features[0] }), _jsx(SmartGloveSection, { copy: copy.showcase.features[1] }), _jsx(EyeGazeSection, { copy: copy.showcase.features[2] }), _jsx(AIStoriesSection, { copy: copy.showcase.features[3] })] }) }), _jsx(Footer, {})] }));
}
