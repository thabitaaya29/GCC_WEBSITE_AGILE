import type { HomepageContent } from "../../../shared/homepage";

export default function AboutSection({ content }: { content: HomepageContent["about"] }) {
  return (
    <section aria-labelledby="about-title" className="bg-brand-red text-white">
      <div className="page-container page-section">
        <h2 id="about-title" className="section-title">{content.title}</h2>
        <p className="mt-6 max-w-[65ch]">{content.description}</p>
      </div>
    </section>
  );
}
