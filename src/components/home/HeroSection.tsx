import type { HomepageContent } from "../../../shared/homepage";
import { buttonStyles } from "../UI/button-styles";

export default function HeroSection({ content }: { content: HomepageContent["hero"] }) {
  return (
    <section aria-labelledby="hero-title" className="bg-brand-green">
      <div className="page-container page-section">
        <h1 id="hero-title" className="page-title max-w-4xl">{content.title}</h1>
        <p className="mt-6 max-w-[65ch]">{content.description}</p>
        <a href={content.ctaHref} className={buttonStyles({ size: "lg", className: "mt-8 w-full sm:w-auto" })}>
          {content.ctaLabel}
        </a>
      </div>
    </section>
  );
}
