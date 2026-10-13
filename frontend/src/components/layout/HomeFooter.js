import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import logo from "../../Images/Logo.png";
import { homeTranslations, useHomeLanguage } from "../../i18n/HomeLanguage";
const quickLinkDestinations = [
    { key: "home", href: "/" },
    { key: "about" },
    { key: "courses", href: "/student-dashboard" },
];
const supportLinkKeys = ["faq", "contact", "guide"];
const socialNetworks = ["Facebook", "YouTube", "Instagram"];
const socialMediaConfig = {
    Facebook: "https://social-placeholder.invalid/facebook-url-placeholder",
    YouTube: "https://social-placeholder.invalid/youtube-url-placeholder",
    Instagram: "https://social-placeholder.invalid/instagram-url-placeholder",
};
function SocialIcon({ network }) {
    if (network === "Facebook") {
        return (_jsx("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: _jsx("path", { d: "M14 8h3V4.5c-.5-.1-2.1-.2-3.4-.2-3.4 0-5.6 2-5.6 5.8V13H5v4h3v7h4v-7h3.3l.5-4H12V10.5C12 9.3 12.3 8 14 8Z" }) }));
    }
    if (network === "YouTube") {
        return (_jsx("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: _jsx("path", { d: "M22 8.1a2.8 2.8 0 0 0-2-2C18.2 5.6 12 5.6 12 5.6s-6.2 0-8 .5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 1.5 12a29 29 0 0 0 .5 3.9 2.8 2.8 0 0 0 2 2c1.8.5 8 .5 8 .5s6.2 0 8-.5a2.8 2.8 0 0 0 2-2 29 29 0 0 0 .5-3.9ZM10 15.5v-7l6 3.5-6 3.5Z" }) }));
    }
    return (_jsxs("svg", { className: "home-footer-instagram-art", viewBox: "0 0 24 24", "aria-hidden": "true", children: [_jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "5" }), _jsx("circle", { cx: "12", cy: "12", r: "4" }), _jsx("circle", { className: "home-footer-instagram-dot", cx: "17.5", cy: "6.7", r: "1" })] }));
}
function FooterLinks({ links }) {
    return (_jsx("ul", { className: "home-footer-link-list", children: links.map((link) => (_jsx("li", { children: link.href ? (_jsx("a", { className: "home-footer-link", href: link.href, children: link.label })) : (_jsx("span", { className: "home-footer-link is-unavailable", "aria-disabled": "true", children: link.label })) }, link.label))) }));
}
export default function HomeFooter() {
    const { language } = useHomeLanguage();
    const copy = homeTranslations[language].footer;
    const quickLinks = quickLinkDestinations.map(({ key, href }) => ({
        label: copy.quickLinks[key],
        href,
    }));
    const supportLinks = supportLinkKeys.map((key) => ({
        label: copy.support[key],
    }));
    return (_jsxs("footer", { className: "home-footer", lang: language === "si" ? "si-LK" : "en", children: [_jsxs("div", { className: "home-footer-main", children: [_jsxs("section", { className: "home-footer-brand", "aria-label": "OmniSign SL", children: [_jsx("img", { src: logo, alt: "OmniSign SL logo" }), _jsxs("div", { children: [_jsx("h2", { children: "OmniSign SL" }), _jsx("p", { children: homeTranslations[language].navbar.tagline })] })] }), _jsxs("nav", { className: "home-footer-column", "aria-label": copy.quickLinks.ariaLabel, children: [_jsx("h2", { children: copy.quickLinks.heading }), _jsx(FooterLinks, { links: quickLinks })] }), _jsxs("nav", { className: "home-footer-column", "aria-label": copy.support.ariaLabel, children: [_jsx("h2", { children: copy.support.heading }), _jsx(FooterLinks, { links: supportLinks })] }), _jsxs("section", { className: "home-footer-social", "aria-labelledby": "home-footer-social-heading", children: [_jsx("h2", { id: "home-footer-social-heading", children: copy.social.heading }), _jsx("div", { className: "home-footer-social-list", children: socialNetworks.map((network) => (_jsx("a", { className: "home-footer-social-icon", href: socialMediaConfig[network], target: "_blank", rel: "noreferrer", "aria-label": copy.social.placeholderLabel.replace("{network}", network), title: copy.social.placeholderTitle.replace("{network}", network), children: _jsx(SocialIcon, { network: network }) }, network))) }), _jsx("p", { children: copy.social.message })] })] }), _jsx("div", { className: "home-footer-bottom", children: _jsx("p", { children: copy.copyright }) })] }));
}
