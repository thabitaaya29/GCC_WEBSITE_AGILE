import type { HomepageContent } from "../../../shared/homepage";
import ProgramCard from "./ProgramCard";

export default function ProgramsSection({ content }: { content: HomepageContent["journey"] }) {
  return (
    <section id="journey" aria-labelledby="journey-title" className="page-section scroll-mt-28 bg-brand-cream">
      <div className="page-container">
        <h2 id="journey-title" className="section-title">{content.title}</h2>
        <p className="body-copy mt-6">{content.description}</p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {content.items.map((item) => <ProgramCard key={item.slug} item={item} />)}
        </div>
      </div>
    </section>
  );
}
