import { Link } from "react-router";

type PreviewPageProps = {
  title: string;
  description: string;
};

export default function PreviewPage({
  title,
  description,
}: PreviewPageProps) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center px-6 text-center">
      <span className="mb-4 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
        Coming Soon
      </span>

      <h1 className="mb-4 text-4xl font-bold text-gray-900">
        {title}
      </h1>

      <p className="mb-8 max-w-xl text-gray-600">
        {description}
      </p>

      <Link
        to="/"
        className="rounded-lg bg-emerald-700 px-6 py-3 font-medium text-white hover:bg-emerald-800"
      >
        Kembali ke Discover
      </Link>
    </main>
  );
}