import logo from "../../Images/Logo.png"
import { homeTranslations } from "../../features/home/homeTranslations"
import { useHomeLanguage } from "../../i18n/HomeLanguage"

type FooterLink = {
  label: string
  href?: string
}

const quickLinkDestinations: { key: "home" | "about" | "courses"; href?: string }[] = [
  { key: "home", href: "/" },
  { key: "about" },
  { key: "courses", href: "/student-dashboard" },
] as const

const supportLinkKeys = ["faq", "contact", "guide"] as const

const socialNetworks = ["Facebook", "YouTube", "Instagram"] as const
type SocialNetwork = (typeof socialNetworks)[number]

const socialMediaConfig: Record<SocialNetwork, string> = {
  Facebook: "https://social-placeholder.invalid/facebook-url-placeholder",
  YouTube: "https://social-placeholder.invalid/youtube-url-placeholder",
  Instagram: "https://social-placeholder.invalid/instagram-url-placeholder",
}

function SocialIcon({ network }: { network: SocialNetwork }) {
  if (network === "Facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 8h3V4.5c-.5-.1-2.1-.2-3.4-.2-3.4 0-5.6 2-5.6 5.8V13H5v4h3v7h4v-7h3.3l.5-4H12V10.5C12 9.3 12.3 8 14 8Z" />
      </svg>
    )
  }

  if (network === "YouTube") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M22 8.1a2.8 2.8 0 0 0-2-2C18.2 5.6 12 5.6 12 5.6s-6.2 0-8 .5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 1.5 12a29 29 0 0 0 .5 3.9 2.8 2.8 0 0 0 2 2c1.8.5 8 .5 8 .5s6.2 0 8-.5a2.8 2.8 0 0 0 2-2 29 29 0 0 0 .5-3.9ZM10 15.5v-7l6 3.5-6 3.5Z" />
      </svg>
    )
  }

  return (
    <svg className="home-footer-instagram-art" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle className="home-footer-instagram-dot" cx="17.5" cy="6.7" r="1" />
    </svg>
  )
}

function FooterLinks({ links }: { links: FooterLink[] }) {
  return (
    <ul className="home-footer-link-list">
      {links.map((link) => (
        <li key={link.label}>
          {link.href ? (
            <a className="home-footer-link" href={link.href}>{link.label}</a>
          ) : (
            <span className="home-footer-link is-unavailable" aria-disabled="true">{link.label}</span>
          )}
        </li>
      ))}
    </ul>
  )
}

export default function Footer() {
  const { language } = useHomeLanguage()
  const copy = homeTranslations[language].footer
  const quickLinks: FooterLink[] = quickLinkDestinations.map(({ key, href }) => ({
    label: copy.quickLinks[key],
    href,
  }))
  const supportLinks: FooterLink[] = supportLinkKeys.map((key) => ({
    label: copy.support[key],
  }))

  return (
    <footer className="home-footer" lang={language === "si" ? "si-LK" : "en"}>
      <div className="home-footer-main">
        <section className="home-footer-brand" aria-label="OmniSign SL">
          <img src={logo} alt="OmniSign SL logo" />
          <div>
            <h2>OmniSign SL</h2>
            <p>{homeTranslations[language].navbar.tagline}</p>
          </div>
        </section>

        <nav className="home-footer-column" aria-label={copy.quickLinks.ariaLabel}>
          <h2>{copy.quickLinks.heading}</h2>
          <FooterLinks links={quickLinks} />
        </nav>

        <nav className="home-footer-column" aria-label={copy.support.ariaLabel}>
          <h2>{copy.support.heading}</h2>
          <FooterLinks links={supportLinks} />
        </nav>

        <section className="home-footer-social" aria-labelledby="home-footer-social-heading">
          <h2 id="home-footer-social-heading">{copy.social.heading}</h2>
          <div className="home-footer-social-list">
            {socialNetworks.map((network) => (
              <a
                className="home-footer-social-icon"
                href={socialMediaConfig[network]}
                target="_blank"
                rel="noreferrer"
                aria-label={copy.social.placeholderLabel.replace("{network}", network)}
                title={copy.social.placeholderTitle.replace("{network}", network)}
                key={network}
              >
                <SocialIcon network={network} />
              </a>
            ))}
          </div>
          <p>{copy.social.message}</p>
        </section>
      </div>

      <div className="home-footer-bottom">
        <p>{copy.copyright}</p>
      </div>
    </footer>
  )
}
