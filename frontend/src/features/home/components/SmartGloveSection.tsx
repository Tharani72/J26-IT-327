import smartGloveImage from "../../../Images/smart-sign-language-glove.png"
import type { HomeFeatureCopy } from "../homeTranslations"
import HomeFeatureSection from "./HomeFeatureSection"

export default function SmartGloveSection({ copy }: { copy: HomeFeatureCopy }) {
  return (
    <HomeFeatureSection
      copy={copy}
      number="02"
      visualClassName="home-feature-visual--glove"
      image={smartGloveImage}
      reversed
    />
  )
}
