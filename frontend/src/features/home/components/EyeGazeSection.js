import { jsx as _jsx } from "react/jsx-runtime";
import eyeGazeImage from "../../../Images/eye-gaze-learning-static.png";
import HomeFeatureSection from "./HomeFeatureSection";
export default function EyeGazeSection({ copy }) {
    return (_jsx(HomeFeatureSection, { copy: copy, number: "03", visualClassName: "home-feature-visual--stories", image: eyeGazeImage }));
}
