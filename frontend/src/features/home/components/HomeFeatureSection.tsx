import type { HomeFeatureCopy } from "../homeTranslations"

type HomeFeatureSectionProps = {
  copy: HomeFeatureCopy
  number: string
  visualClassName: string
  image: string
  reversed?: boolean
}

export default function HomeFeatureSection({
  copy,
  number,
  visualClassName,
  image,
  reversed = false,
}: HomeFeatureSectionProps) {
  return (
    <article className={reversed ? "home-feature-section is-reversed" : "home-feature-section"}>
      <div className={"home-feature-visual " + visualClassName} aria-hidden="true">
        <img src={image} alt="" loading="lazy" />
        <span className="home-feature-visual-badge">{number}</span>
      </div>
      <div className="home-feature-copy">
        <span className="home-feature-number">{number}</span>
        <h2>{copy.heading}</h2>
        <p>{copy.description}</p>
        <ul className="home-feature-highlights">
          {copy.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
        </ul>
      </div>
    </article>
  )
}
