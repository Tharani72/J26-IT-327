import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import homeImage from "../../../Images/Home Image.png";
import homeCharacterGif from "../../../Video/omnisign_girl_signing.gif";
export default function HeroSection({ copy }) {
    const [showCharacterGif, setShowCharacterGif] = useState(false);
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setShowCharacterGif(true);
            return;
        }
        const timer = window.setTimeout(() => setShowCharacterGif(true), 1900);
        return () => window.clearTimeout(timer);
    }, []);
    return (_jsxs(_Fragment, { children: [_jsx("img", { className: "home-image", src: homeImage, alt: "" }), _jsxs("section", { className: "hero-copy", "aria-label": copy.ariaLabel, children: [_jsx("h1", { children: copy.heading }), _jsxs("p", { children: [copy.descriptionLines[0], _jsx("br", {}), copy.descriptionLines[1]] }), _jsx("span", { className: "signing-video-wrap", children: _jsx("img", { className: "signing-child", src: showCharacterGif ? homeCharacterGif : undefined, alt: copy.signingImageAlt }) })] })] }));
}
