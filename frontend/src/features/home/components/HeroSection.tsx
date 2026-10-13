import { useEffect, useState } from "react"
import homeImage from "../../../Images/Home Image.png"
import homeCharacterGif from "../../../Video/omnisign_girl_signing.gif"
import type { HomeHeroCopy } from "../homeTranslations"

export default function HeroSection({ copy }: { copy: HomeHeroCopy }) {
  const [showCharacterGif, setShowCharacterGif] = useState(false)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShowCharacterGif(true)
      return
    }

    const timer = window.setTimeout(() => setShowCharacterGif(true), 1900)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <>
      <img className="home-image" src={homeImage} alt="" />
      <section className="hero-copy" aria-label={copy.ariaLabel}>
        <h1>{copy.heading}</h1>
        <p>
          {copy.descriptionLines[0]}
          <br />
          {copy.descriptionLines[1]}
        </p>
        <span className="signing-video-wrap">
          <img
            className="signing-child"
            src={showCharacterGif ? homeCharacterGif : undefined}
            alt={copy.signingImageAlt}
          />
        </span>
      </section>
    </>
  )
}
