import studentImage from "../../../Images/sign-language-student-static.png"
import type { HomeFeatureCopy } from "../homeTranslations"
import HomeFeatureSection from "./HomeFeatureSection"

export default function SignLanguageSection({ copy }: { copy: HomeFeatureCopy }) {
  return (
    <HomeFeatureSection
      copy={copy}
      number="01"
      visualClassName="home-feature-visual--practice"
      image={studentImage}
    />
  )
}
