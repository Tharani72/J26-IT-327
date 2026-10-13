import eyeGazeImage from "../../../Images/eye-gaze-learning-static.png"
import type { HomeFeatureCopy } from "../homeTranslations"
import HomeFeatureSection from "./HomeFeatureSection"

export default function EyeGazeSection({ copy }: { copy: HomeFeatureCopy }) {
  return (
    <HomeFeatureSection
      copy={copy}
      number="03"
      visualClassName="home-feature-visual--stories"
      image={eyeGazeImage}
    />
  )
}
