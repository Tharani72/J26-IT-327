import { jsx as _jsx } from "react/jsx-runtime";
import smartGloveImage from "../../../Images/smart-sign-language-glove.png";
import HomeFeatureSection from "./HomeFeatureSection";
export default function SmartGloveSection({ copy }) {
    return (_jsx(HomeFeatureSection, { copy: copy, number: "02", visualClassName: "home-feature-visual--glove", image: smartGloveImage, reversed: true }));
}
