import { jsx as _jsx } from "react/jsx-runtime";
import studentImage from "../../../Images/sign-language-student-static.png";
import HomeFeatureSection from "./HomeFeatureSection";
export default function SignLanguageSection({ copy }) {
    return (_jsx(HomeFeatureSection, { copy: copy, number: "01", visualClassName: "home-feature-visual--practice", image: studentImage }));
}
