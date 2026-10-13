import { jsx as _jsx } from "react/jsx-runtime";
import aiLearningImage from "../../../Images/ai-learning-assistant-static.png";
import HomeFeatureSection from "./HomeFeatureSection";
export default function AIStoriesSection({ copy }) {
    return (_jsx(HomeFeatureSection, { copy: copy, number: "04", visualClassName: "home-feature-visual--progress", image: aiLearningImage, reversed: true }));
}
