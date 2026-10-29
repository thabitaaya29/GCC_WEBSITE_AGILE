import { Link } from "react-router";
import type { HomepageContent } from "../../../shared/homepage";
import { buttonStyles } from "../UI/button-styles";

type JourneyItem = HomepageContent["journey"]["items"][number];

// The v1 API supplies journey summaries, not full program details or benefits.
export default function ProgramCard({ item }: { item: JourneyItem }) {
  return (
    <article aria-labelledby={`stage-${item.slug}`} className="flex min-w-0 flex-col rounded-2xl border border-line bg-white p-6">
      <h3 id={`stage-${item.slug}`} className="text-2xl font-bold">{item.label}</h3>
      <p className="mt-4 text-muted">{item.description}</p>
      <p className="mb-6 mt-4 text-sm text-muted">Coming Soon — preview</p>
      <Link to={item.href} className={buttonStyles({ variant: "secondary", className: "mt-auto" })}>
        Explore {item.label}
      </Link>
    </article>
  );
}
