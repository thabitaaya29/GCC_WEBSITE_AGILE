import type { HomepageContent } from "../../shared/homepage";

// Local draft for layout work, deliberately separate from the future API loader.
// This is not a fallback for a failed Supabase request or approved public copy.
export const homepageDraft: HomepageContent = {
  schemaVersion: 1,
  contentStatus: "example",
  notice: "Preview struktur homepage — konten draft, belum final. Data Supabase belum terhubung.",
  hero: {
    title: "Think Structurally. Solve Strategically. Grow Together.",
    description: "Develop your consulting mindset with GCC. Learn to understand business problems, structure analyses, and deliver recommendations through learning, mentoring, and collaboration.",
    ctaLabel: "Explore GCC",
    ctaHref: "#journey",
  },
  about: {
    title: "This is Our Consulting Journey",
    description: "Growth Consulting Club is a professional development community for students who want to get to know and explore the consulting industry.",
  },
  journey: {
    title: "Explore How We Learn and Grow",
    description: "Pilih tahap perjalananmu. Halaman Learn, Apply, dan Grow masih berupa preview.",
    items: [
      { slug: "learn", label: "Learn", description: "Kenali dasar consulting dan cara memahami permasalahan bisnis.", href: "/learn" },
      { slug: "apply", label: "Apply", description: "Eksplorasi penerapan analisis dan rekomendasi pada tantangan bisnis.", href: "/apply" },
      { slug: "grow", label: "Grow", description: "Temukan kesempatan untuk belajar, berkolaborasi, dan berkembang bersama.", href: "/grow" },
    ],
  },
};
