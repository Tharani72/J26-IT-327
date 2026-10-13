import aiLearningImage from "../../../Images/ai-learning-assistant-static.png"
import type { HomeFeatureCopy } from "../homeTranslations"
import HomeFeatureSection from "./HomeFeatureSection"

export default function AIStoriesSection({ copy }: { copy: HomeFeatureCopy }) {
  return (
    <HomeFeatureSection
      copy={copy}
      number="04"
      visualClassName="home-feature-visual--progress"
      image={aiLearningImage}
      reversed
    />
  )
}
