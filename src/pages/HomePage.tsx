import type { HomepageContent } from "../../shared/homepage";
import HeroSection from "../components/home/HeroSection";
import AboutSection from "../components/home/AboutSection";
import ProgramsSection from "../components/home/ProgramsSection";

export default function HomePage({ content }: { content: HomepageContent }) {
  return (
    <main>
      {content.contentStatus === "example" && (
        <div className="border-b border-line bg-brand-cream py-3">
          <p className="page-container text-sm">{content.notice}</p>
        </div>
      )}
      <HeroSection content={content.hero} />
      {/* CommunityGallery belongs here once the actual photos are supplied. */}
      <AboutSection content={content.about} />
      <ProgramsSection content={content.journey} />
      {/* StartingPoint and TrackRecord await confirmed destinations and data. */}
    </main>
  );
}
