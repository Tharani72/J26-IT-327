import { useEffect } from "react"
import Footer from "../../components/common/Footer"
import SiteNavbar from "../../components/navigation/SiteNavbar"
import { HomeLanguageProvider, useHomeLanguage } from "../../i18n/HomeLanguage"
import { homeTranslations } from "./homeTranslations"
import AIStoriesSection from "./components/AIStoriesSection"
import EyeGazeSection from "./components/EyeGazeSection"
import HeroSection from "./components/HeroSection"
import SignLanguageSection from "./components/SignLanguageSection"
import SmartGloveSection from "./components/SmartGloveSection"

export default function HomePage() {
  return (
    <HomeLanguageProvider>
      <HomePageContent />
    </HomeLanguageProvider>
  )
}

function HomePageContent() {
  const { language } = useHomeLanguage()
  const copy = homeTranslations[language]
  const htmlLanguage = language === "si" ? "si-LK" : "en"

  useEffect(() => {
    const showcase = document.querySelector<HTMLElement>(".home-feature-showcase")
    if (!showcase || !("IntersectionObserver" in window)) return

    const sections = showcase.querySelectorAll<HTMLElement>(".home-feature-section")
    showcase.classList.add("home-feature-showcase--reveal-enabled")
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible")
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.15, rootMargin: "0px 0px -36px 0px" })

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <SiteNavbar />
      <main className="home-page" lang={htmlLanguage}>
        <HeroSection copy={copy.hero} />
      </main>
      <section
        className="home-feature-showcase"
        aria-label={copy.showcase.ariaLabel}
        lang={htmlLanguage}
      >
        <div className="home-feature-showcase-inner">
          <SignLanguageSection copy={copy.showcase.features[0]} />
          <SmartGloveSection copy={copy.showcase.features[1]} />
          <EyeGazeSection copy={copy.showcase.features[2]} />
          <AIStoriesSection copy={copy.showcase.features[3]} />
        </div>
      </section>
      <Footer />
    </>
  )
}
