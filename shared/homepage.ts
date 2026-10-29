export interface HomepageContent {
  schemaVersion: 1;
  contentStatus: 'example' | 'approved';
  notice: string;
  hero: { title: string; description: string; ctaLabel: 'Explore GCC'; ctaHref: '#journey' };
  about: { title: string; description: string };
  journey: {
    title: string; description: string;
    items: { slug: 'learn' | 'apply' | 'grow'; label: 'Learn' | 'Apply' | 'Grow'; description: string; href: '/learn' | '/apply' | '/grow' }[];
  };
}
