import { Link } from "react-router";
import { buttonStyles } from "../UI/button-styles";

type PreviewPageProps = {
  title: string;
  description: string;
};

export default function PreviewPage({
  title,
  description,
}: PreviewPageProps) {
  return (
    <main className="page-container page-section flex min-h-[70vh] flex-col items-center justify-center text-center">
      <span className="mb-6 rounded-full bg-brand-cream px-4 py-2 text-sm font-medium text-ink">
        Coming Soon
      </span>

      <h1 className="page-title mb-4">
        {title}
      </h1>

      <p className="body-copy mb-8">
        {description}
      </p>

      <Link
        to="/"
        className={buttonStyles()}
      >
        Kembali ke Discover
      </Link>
    </main>
  );
}
