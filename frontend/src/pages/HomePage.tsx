import { useEffect, useState } from "react"
import logo from "../Images/Logo.png"
import loginIcon from "../Images/Login Icon.png"
import homeImage from "../Images/Home Image.png"
import homeCharacterGif from "../Video/omnisign_girl_signing.gif"

export default function HomePage() {
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
      <header className="site-nav">
        <nav aria-label="Main navigation">
          <img
            className="site-logo"
            src={logo}
            alt="OmniSign SL logo"
          />
          <span className="site-name">OminiSign SL</span>
          <span className="site-tagline">සංඥාවෙන් ඉගෙනුමට</span>
          <div className="nav-links">
            <button className="home-nav-button" type="button">
              <span>මුල් පිටුව</span>
            </button>
            <button className="about-nav-button" type="button">
              <span>අප ගැන</span>
            </button>
            <button className="learn-nav-button" type="button">
              <span>ඉගෙන ගන්න</span>
            </button>
            <button className="teachers-nav-button" type="button">
              <span>ගුරුවරුන් සඳහා</span>
            </button>
          </div>
        </nav>
        <button className="nav-login-button" type="button">
          <img className="nav-login-icon" src={loginIcon} alt="" />
          <span>ඇතුල් වන්න</span>
        </button>
      </header>
      <main className="home-page">
        <img className="home-image" src={homeImage} alt="" />
        <section className="hero-copy" aria-label="Welcome">
          <h1>ආයුබෝවන්! 👋</h1>
          <p>
            අපි එකට සංඥා භාෂාව
            <br />
            ඉගෙන ගනිමු
          </p>
          <span className="signing-video-wrap">
            <img
              className="signing-child"
              src={showCharacterGif ? homeCharacterGif : undefined}
              alt="A child signing in Sinhala Sign Language"
            />
          </span>
        </section>
      </main>
    </>
  )
}
